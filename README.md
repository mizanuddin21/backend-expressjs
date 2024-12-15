# Back-End Service For Invoice User

# Description
This project is a backend service built with Node.js (v16.20.2), Express (v4.19.2), and PostgreSQL (v8.13.1). It provides an API for managing user invoices and their products. The project is designed to be easy to set up and run locally, making it ideal for development and testing purposes.

# Prerequisites
Before running the project, ensure you have the following installed:

1. Node.js (v16.20.2): A JavaScript runtime built on Chrome's V8 JavaScript engine.
    You can check your version using node -v in the terminal.
    Download it from: Node.js [Download](https://nodejs.org/en/download/package-manager).


2. Express (v4.19.2): A fast, unopinionated, minimalist web framework for Node.js.
    Express is installed as part of the project dependencies.

3. PostgreSQL (v8.13.1): An open-source relational database system.
    Download from: PostgreSQL [Download](https://www.postgresql.org/download/).
    Ensure PostgreSQL is running on your machine.

# Setup and Installation
Follow these steps to clone and run the project locally:
1. Clone the Repository
Start by cloning the repository to your local machine:
<div class="code-container">
  <pre id="command-text">
    git clone https://github.com/your-username/your-project-name.git
    cd your-project-name/express
  </pre>
</div>

2. Install Dependencies
Ensure that Node.js and npm (Node Package Manager) are installed on your machine. If not, follow the [Node.js installation guide.](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)

Run the following command to install all project dependencies:
<div class="code-container">
  <pre id="command-text">
    npm install -> if using npm
    yarn install -> if using yarn
  </pre>
</div>
This will install the required dependencies listed in package.json.<br><br>

3. Set Up PostgreSQL
Ensure you have PostgreSQL running locally. You can use a database management tool like [pgAdmin](https://www.pgadmin.org/) or command-line tools to create a database for your project.
- Create a Database: Create a new database using the PostgreSQL command line or GUI:
<div class="code-container">
  <pre id="command-text">
    createdb your_database_name
  </pre>
</div>

- Set Up Environment Variables: Create a .env file in the root directory of the project to configure database connection settings. Example:
<div class="code-container">
  <pre id="command-text">
    PORT=your_port -> for localhost port
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_postgres_user
    DB_PASSWORD=your_postgres_password
    DB_NAME=your_database_name
  </pre>
</div>
Replace the values with your actual PostgreSQL credentials.

4. Run the Application
Once you have installed dependencies and set up the database, run the application from the terminal using:
<div class="code-container">
  <pre id="command-text">
    nodemon
  </pre>
</div>
This will start the Express server. By default, it will be running on http://localhost:3000. <br><br

You can test if everything is working by visiting the endpoint http://localhost:3000 in your browser or using tools like Postman.

5. Feature : Upload file XLSX
To use this feature , you can use the template given on folder XLSX_template

# Submission
## Section 1 – Develop a CRUD API for invoice page
To check the submission for section 1 , codes are inside Express folder.  
## Section 2 – Import and parse XLSX file to MySQL / PostgresSQL
To check the submission for section 2, codes are inside Express folder.
## Section 3 – Problem solving
To check the submission for section 3, codes are inside Algorithm folder.<br><br>
To run the code, use your terminal and run command :
<div class="code-container">
  <pre id="command-text">
    node algorithm.js
  </pre>
</div>
If you are using JS module type, u can change the code below :
<div class="code-container">
  <pre id="command-text">
    // import readline from 'readline' -> comment this
    const readline = require('readline') -> use this instead
  </pre>
</div>

