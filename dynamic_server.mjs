import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

import { default as express } from 'express';
import { default as sqlite3 } from 'sqlite3';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const port = 2000;
const root = path.join(__dirname, 'public');
const template = path.join(__dirname, 'templates');

let app = express();
app.use(express.static(root));


const db = new sqlite3.Database(path.join(__dirname, 'bad_drivers_2.sqlite3'), sqlite3.OPEN_READONLY, (err) => {
    if(err) {
        console.log("Error connecting to database")
    }
    else {
        console.log("Successfully connected to database")
    }
});

function dbSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

app.get('/State/:name', (req, res) => {

    let state = req.params.name;

    let p1 = dbSelect("SELECT * FROM drivers WHERE State=?", [state]);
    let p2 = fs.promises.readFile(path.join(template, 'template2.html'), 'utf-8');
    let ID, IDplus, IDminus, response;
    Promise.all([p1, p2]).then((results) => {
        console.log(p1)
        response = results[1].replace('$$STATENAME$$', results[0][0].State);
        let row = results[0][0];
        response = response.replace('$$INPUT1$$', row["Number of drivers involved in fatal collisions per billion miles"]);
        response = response.replace('$$INPUT2$$', row["Percentage Of Drivers Involved In Fatal Collisions Who Were Speeding"]);
        response = response.replace('$$INPUT3$$', row["Percentage Of Drivers Involved In Fatal Collisions Who Were Alcohol-Impaired"]);
        response = response.replace('$$INPUT4$$', row["Percentage Of Drivers Involved In Fatal Collisions Who Were Not Distracted"]);
        response = response.replace('$$INPUT5$$', row["Percentage Of Drivers Involved In Fatal Collisions Who Had Not Been Involved In Any Previous Accidents"]);
        response = response.replace('$$INPUT6$$', row["Car Insurance Premiums ($)"]);
        response = response.replace('$$INPUT7$$', row["Losses incurred by insurance companies for collisions per insured driver ($)"]);
        ID = row["ID"];
        IDplus = ID + 1;
        IDminus = ID - 1;
        let p3 = dbSelect("SELECT State FROM drivers WHERE ID = ?", [IDplus]);
        let p4 = dbSelect("SELECT State FROM drivers WHERE ID = ?", [(IDminus)]);
        return Promise.all([p3, p4]);
    }).then((results) => {
        if (ID == 1) {
            response = response.replace('$$PREV$$', "");
        }
        if (ID == 51) {
            response = response.replace('$$NEXT$$', "");
        }
        if (ID > 0 && ID < 51) {
            results[0].forEach((row) => {
                let NextState = row.State
                response = response.replace('$$NEXT$$', NextState);
            });
        } 
        
        if (ID > 1 && ID <= 51) {
            results[1].forEach((row) => {
                let PrevState = row.State
                response = response.replace('$$PREV$$', PrevState);
            });
            }
            
         
        
        res.status(200).type('html').send(response); 
    }).catch((error) => {
        console.error("Error:", error); // Log the error for debugging
        res.status(404).type('txt').send("The state " + state + " is not found");
    });
});


app.get('/Insurance/:frequency', (req, res) => { //Car insurance 

    let frequency = req.params.frequency;

    if (frequency<100) {
        res.status(404).type('txt').send('Insurance values can only be between 100 and 1300');
    }
    if (frequency>1300) {
        res.status(404).type('txt').send('Insurance values can only be between 100 and 1300');
    }

    if ((frequency % 100) >= 50) {
        frequency = frequency - ((frequency % 100)) + 100
    }
    else {
        frequency = frequency - ((frequency % 100))
    }


    let p1 = dbSelect("SELECT State, [Car Insurance Premiums ($)] FROM drivers WHERE [Car Insurance Premiums ($)] > ?", [frequency]);
    let p2 = fs.promises.readFile(path.join(template, 'template1.html'), 'utf-8');
    Promise.all([p1, p2]).then((results) => {
        let response = results[1].replace('$$STATENAME$$', 'States with Insurance Premiums over ' + frequency + " (URL Rounded to Nearest 100)");
        let table_body = '';
        results[0].forEach((row) => {
            let table_row = '<tr>';
            table_row += '<td>' + row.State + '</td>';
            table_row += '<td>' + row["Car Insurance Premiums ($)"] + '</td>';
            table_row += '</tr>';
            table_body += table_row;
        });
        response = response.replace('$$TABLE_BODY$$', table_body);
        if (frequency <= 100) {
            response = response.replace('$$PREV$$', "")
           
        }
        if (frequency >= 1300) {
            response = response.replace('$$NEXT$$', ' ');
        }
        response = response.replace('$$NEXT$$', (frequency+100));
        response = response.replace('$$PREV$$', (frequency-100));
        res.status(200).type('html').send(response);
    }).catch((error) => {
        console.error("Error:", error); // Log the error for debugging
        res.status(404).type('txt').send('File not found !!!');
    });
});


app.get('/DistractedDriving/:percentage', (req, res) => { //Car insurance 

    let Percentage = req.params.percentage;

    if (Percentage<10) {
        res.status(404).type('txt').send('Percentage values can only be between 10 and 90');
        return;
    }
    if (Percentage>90) {
        res.status(404).type('txt').send('Percentage values can only be between 10 and 90');
        return;
    }

    if ((Percentage % 10) >= 5) {
        Percentage = Percentage - ((Percentage % 10)) + 10
    }
    else {
        Percentage = Percentage - ((Percentage % 10))
    }



    let p1 = dbSelect("SELECT State, [Percentage Of Drivers Involved In Fatal Collisions Who Were Not Distracted] FROM drivers WHERE [Percentage Of Drivers Involved In Fatal Collisions Who Were Not Distracted] >= ?", [Percentage]);
    let p2 = fs.promises.readFile(path.join(template, 'template3.html'), 'utf-8');
    Promise.all([p1, p2]).then((results) => {
        let response = results[1].replace('$$STATENAME$$', 'States with percentage of drivers who were NOT distracted over ' + Percentage + "% (URL Rounded to Nearest 10)");
        let table_body = '';
        results[0].forEach((row) => {
            let table_row = '<tr>';
            table_row += '<td>' + row.State + '</td>';
            table_row += '<td>' + row["Percentage Of Drivers Involved In Fatal Collisions Who Were Not Distracted"] + '</td>';
            table_row += '</tr>';
            table_body += table_row;
        });
        response = response.replace('$$TABLE_BODY$$', table_body);
        if (Percentage <= 10) {
            response = response.replace('$$PREV$$', "")
           
        }
        if (Percentage >= 90) {
            response = response.replace('$$NEXT$$', ' ');
        }
        response = response.replace('$$NEXT$$', (Percentage+10));
        response = response.replace('$$PREV$$', (Percentage-10));
        res.status(200).type('html').send(response);
    }).catch((error) => {
        console.error("Error:", error); // Log the error for debugging
        res.status(404).type('txt').send('File not found !!!');
    });
});


app.listen(port, () => {
    console.log('Now listening on port' + port);
});
