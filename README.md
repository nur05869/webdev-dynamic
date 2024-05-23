# webdev-rest

## Description

This repository contains starter code for a REST API project for my web development class. The project is built using JavaScript, Node.js, and Express.js to set up a RESTful API that handles HTTP requests for creating, reading, updating, and deleting resources. It is a foundational project for learning how to implement RESTful services in web development.

## Structure

- **public**: Contains static files served by the server.
- **src**: Contains the main server script and route handlers.
  - **rest_server.mjs**: Main server script handling HTTP requests and routing.
  - **other server files**: Additional scripts for handling specific routes and middleware.
- **package.json**: Lists project dependencies and scripts necessary for running the project.
- **package-lock.json**: Auto-generated file that describes the exact dependency tree and versions used.
- **.gitignore**: Specifies files and directories to be ignored by Git, such as `node_modules`.

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/nur05869/webdev-rest.git
    ```
2. Navigate into the project directory:
    ```sh
    cd webdev-rest
    ```
3. Install the necessary dependencies:
    ```sh
    npm install
    ```
4. Start the server:
    ```sh
    node src/rest_server.mjs
    ```

