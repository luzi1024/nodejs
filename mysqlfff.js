var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data


app.get('/', function (req, res) {
  console.log(JSON.stringify(req.headers,null,4));
  res.send('Hello World')
 
})
app.listen(3000)

var admin = express(); // the sub app

admin.post('/', function (req, res) {
  console.log(admin.mountpath); // /admin
  console.log(JSON.stringify(req.headers,null,4));
  console.log(JSON.stringify(req.body,null,4));
  res.send('Admin Homepage');
})


app.use('/admin', admin); // mount the sub app
