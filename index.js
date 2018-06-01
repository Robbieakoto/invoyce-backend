 //include express framework
 const express = require('express')

 //include body-parser for form request
 const bodyParser = require('body-parser');

 //include sqlite3 for the database
 const sqlite3 = require('sqlite3').verbose();

 //set application to run on port 5000;
 const PORT = process.env.PORT || 5000;

 //instantiate express
 const app = express();
 const bcrypt = require('bcrypt')
 const saltRounds = 10;

 // disable urlencoded form request
 app.use(bodyParser.urlencoded({ extended: false }));

 // enable json form request
 app.use(bodyParser.json());


 //home route(http://localhost:5000/)
 app.get('/', (req, res) => {
     res.send("Welcome to invoyce ");
 });

 app.post('/register', (req, res) => {
     if (req.body.name || (req.body.email) ||
         (req.body.company_name) || (req.body.password)) {
         return res.json({
             'status': false,
             'message': 'All fields are required'
         });
     }

     //hashning password 
     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

         //connecting to the database
         let db = new sqlite3.Database("./database/InvoicingApp.db");

         //storing a query in the variable sql
         let sql = `INSERT INTO users(name,email,company_name,password) VALUES('${
          req.body.name
        }','${req.body.email}','${req.body.company_name}','${hash}')`;

         //running the query
         db.run(sql, function(err) {
             if (err) {
                 //throw an error if sql failed
                 throw err;
             } else {

                 //return json if sql successfull
                 return res.json({
                     status: true,
                     message: "User Created"
                 });
             }
         });
         //closes the database connection
         db.close();
     });
 });

 app.post('/login', (req, res) => {
     res.send("Login here");
 });

 app.post('/invoice', (req, res) => {
     res.send("Create and Send an invoice");
 });

 app.get('/invoice/user/:user_id', (req, res) => {
     res.send("View all invoices");
 });

 app.get('/invoice/user/:user_id/:invoice_id', (req, res) => {
     res.send("view user and certain invoice id");
 });

 app.post('/invoice/send', (req, res) => {
     res.send("send an invoice");
 });

 //listening to PORT 5000 for incoming routes
 app.listen(PORT, function() {
     console.log(`App running on localhost:${PORT}`);
 });