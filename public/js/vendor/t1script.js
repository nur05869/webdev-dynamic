var data = [
	{
		//x: [1, 2, 3, 4, 5],
		//y: [2, 1, 3, 4, 2],
    x:[$$XVAR$$],
    y:[$$YVAR$$],
		type: 'bar'
	}
];

// Define the layout for the plot
var layout = {
	title: '',
	xaxis: { title: 'States' },
	yaxis: { title: 'Premiums' }
};

// Create the plot in the "graph" div
Plotly.newPlot('graph', data, layout);