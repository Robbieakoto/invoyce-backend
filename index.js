 //include express framework
 const express = require('express')
     //include body-parser for form request
 const bodyParser = require('body-parser');
 //include sqlite3 for the database
 const sqlite3 = require('sqlite3').verbose();
 //include bcrypt module
 const bcrypt = require('bcrypt');

 //set application to run on port 5000;
 const PORT = process.env.PORT || 5000;
 //instantiate express
 const app = express();
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

     //connecting to the database
     let db = new sqlite3.Database("./database/invoyce.db");

     //check to make sure none of the field/fields are empty
     if (req.body.name == '' || req.body.email == '' ||
         req.body.company_name == '' || req.body.password == '') {
         return res.json({
             'status': false,
             'message': 'All fields are required'
         });
     } else {
         //check if email already exists

         let column = `SELECT * from users where email='${req.body.email}'`;
         db.all(column, [], (err, rows) => {

             if (err) {
                 throw err;
             }
             if (rows.length != 0) {
                 return res.json({
                     status: false,
                     message: "user already exists"
                 });
             } else {

                 //creates a user if no email exists
                 bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                     let sql = `INSERT INTO users(name,email,company_name,password) VALUES('${
                    req.body.name
                  }','${req.body.email}','${req.body.company_name}','${hash}')`;
                     db.run(sql, (err) => {
                         if (err) {
                             throw err;
                         } else {
                             //creates user
                             return res.json({
                                 status: true,
                                 message: "user created"
                             });
                         }
                     })
                 });
             }
         });
     }
     // db.close();
 });


 //hashing password 

 app.post('/login', (req, res) => {

     //connects to the database
     let db = new sqlite3.Database("./database/invoyce.db");

     //store a query in sql
     let sql = `SELECT * from users where email='${req.body.email}'`;
     db.all(sql, [], (err, rows) => {
         if (err) {
             throw err;
         }
         db.close();

         //check if email is correct
         if (rows.length == 0) {
             return res.json({
                 status: false,
                 message: "Sorry, wrong email"
             });
         }
     });
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