 //include express framework
 const express = require('express')
     //include body-parser for form request
 const bodyParser = require('body-parser');
 //include sqlite3 for the database
 const sqlite3 = require('sqlite3').verbose();
 //include multiparty middleware
 const multipart = require('connect-multiparty');
 //include bcrypt module
 const bcrypt = require('bcrypt');

 //set application to run on port 5000;
 const PORT = process.env.PORT || 5000;
 //instantiate express
 const app = express();
 const multipartMiddleware = multipart();
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
     if (req.body.name.length == 0 || req.body.email.length == 0 ||
         req.body.company_name.lenght == 0 || req.body.password.length == 0) {
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

         //check if email is correct and return error message
         if (rows.length == 0) {
             return res.json({
                 status: false,
                 message: "wrong credentials provided. Please retry"
             });
         }
         //storing rows in a variable user
         let user = rows[0];

         //comparing passwords and storing in variable authenticated
         let authenticated = bcrypt.compareSync(req.body.password, user.password);

         //delete user password for security
         delete user.password;

         //if passwords match,return user view
         if (authenticated) {
             return res.json({
                 status: true,
                 user: user
             });
         }
         //if passwords do not match, return error message
         return res.json({
             status: false,
             message: "wrong credentials provided. Please retry*"
         });
     });
 });

 app.post('/invoice', multipartMiddleware, (req, res) => {
     let db = new sqlite3.Database("./database/invoyce.db");
     //check if invoice name is empty
     if ((req.body.name.length == 0)) {
         return res.json({
             status: false,
             message: "Invoice needs a name"
         });
     } else {
         //check if email already exists
         let column = `SELECT * from invoices where name='${req.body.name}'`;

         db.all(column, [], (err, rows) => {

             if (err) {
                 throw err;
             }

             //check if invoice already exixts
             if (rows.length != 0) {
                 return res.json({
                     status: false,
                     message: "invoice already created"
                 });
             } else {

                 //insert new invoice into invoice table
                 let sql = `INSERT INTO invoices(name,user_id,paid) VALUES(
                                                                    '${req.body.name}',
                                                                    '${req.body.user_id}',
                                                                    0
                                                                )`;
                 db.serialize(() => {
                     //run invoice query
                     db.run(sql, (err) => {
                         if (err) {
                             throw err;
                         }

                         //get the last invoice ID created 
                         let invoice_id = this.lastID;

                         //loop through the number of transactions
                         for (let i = 0; i < req.body.txn_names.length; i++) {

                             //insert transaction into the transaction table
                             let query = `INSERT INTO transactions(name,price,invoice_id) VALUES(
                '${req.body.txn_names[i]}',
                '${req.body.txn_prices[i]}',
                '${invoice_id}'
            )`;
                             //run transaction query
                             db.run(query);
                         }

                         //return message to user
                         return res.json({
                             status: true,
                             id: invoice_id,
                             message: "Invoice created"
                         });
                     });

                 });
             }
         });
     }
 });

 app.get('/invoice/user/:user_id', multipartMiddleware, (req, res) => {
     //connect to the database
     let db = new sqlite3.Database("./database/invoyce.db");

     //get all invoices
     let sql = `SELECT * FROM invoices WHERE user_id='${req.params.user_id}'`;
     db.all(sql, [], (err, rows) => {
         console.log(rows);
         if (err) {
             throw err;
         }
         //return rows of transaction
         return res.json({
             status: true,
             transactions: rows
         });
     });
 });

 app.get('/invoice/user/:user_id/:invoice_id', multipartMiddleware, (req, res) => {
     //connect to database
     let db = new sqlite3.Database("./database/invoyce.db");

     //get invoice with specific id number and user id
     let sql = `SELECT * FROM invoices LEFT JOIN transactions ON invoices.id=transactions.invoice_id WHERE user_id='${
        req.params.user_id
      }' AND invoice_id='${req.params.invoice_id}'`;
     db.all(sql, [], (err, rows) => {
         if (err) {
             throw err;
         }
         //return row
         return res.json({
             status: true,
             transactions: rows
         });
     });
 });

 app.post('/invoice/send', (req, res) => {
     res.send("send an invoice");
 });

 //listening to PORT 5000 for incoming routes
 app.listen(PORT, function() {
     console.log(`App running on localhost:${PORT}`);
 });