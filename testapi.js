var http = require('http');
var express = require('express');

var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

//DBHelper Starts here
console.log("DB Helper");
var fs = require("fs");
var file = "./vassist.db";
var exists = fs.existsSync(file);
if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
db.serialize(function() {
  if(!exists) {
    //Device TABLE
    db.run("CREATE TABLE DEVICE (p_id TEXT, d_status TEXT)");
    var stmt = db.prepare("INSERT INTO DEVICE VALUES (?, ?)");
    stmt.run("11", "closed");
    stmt.run("12", "off");
    stmt.finalize();
    db.each("SELECT rowid AS id, p_id, d_status FROM DEVICE", function(err, row) {
      console.log(row);
    });

    //Actions TABLE
    db.run("CREATE TABLE ACTION (p_id TEXT, d_action TEXT, pins TEXT)");
    var stmtAction = db.prepare("INSERT INTO ACTION VALUES (?, ?, ?)");
    stmtAction.run("11", "activate", "24");
    stmtAction.run("11", "deactivate", "17");
    stmtAction.run("12", "activate", "24");
    stmtAction.run("12", "deactivate", "17");
    stmtAction.finalize();
    db.each("SELECT * FROM ACTION", function(err, row) {
      console.log(row);
    });
  }
});

var inputs = [{ pin: '11', gpio: '17', value: 1 },
              { pin: '12', gpio: '18', value: 0 }];
app.get('/inputs/:id', function(req, res) {
  console.log(req.params.id);
  res.status(200).send(inputs[req.params.id]);
});

function updateDeviceStatus() {
  db.serialize(function() {
    //Device TABLE
    db.run("UPDATE DEVICE SET d_status = ? WHERE p_id = ?", req.body.action, req.body.deviceId);
  });
}

app.post('/access', function(req, res) {
  var output = {
    status: false
  };
  console.log(req.body.deviceId);
  db.serialize(function() {
    db.run("UPDATE DEVICE SET d_status = ? WHERE p_id = ?", req.body.action, req.body.deviceId);
    db.get("SELECT p_id, d_status FROM DEVICE WHERE p_id = " + req.body.deviceId, function(err, row) {
      console.log(row);
      if(row) {
        output.device = row;
        output.status = true;
      }
      else {
        output.device = err;
        output.status = false;
        output.error = err;
      }
      res.status(200).send(output);
    });
  });
});

app.get('/device/:id', function(req, res) {
  console.log(req.params.id);
  var response = {
    status: false
  };
  db.serialize(function() {
    //Device TABLE
    db.get("SELECT p_id, d_status FROM DEVICE WHERE p_id = " + req.params.id, function(err, row) {
        console.log(row);
        if(row) {
          response.device = row;
          response.status = true;
        }
        else {
          response.device = err;
          response.status = false;
          response.error = err;
        }
        res.status(200).send(response);
    });
  });
});

// Express route for any other unrecognised incoming requests
app.get('*', function(req, res) {
  res.status(404).send('Unrecognised API call');
});

// Express route to handle errors
app.use(function(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send('Oops, Something went wrong!');
  } else {
    next(err);
  }
});

app.listen(3000);
console.log('App Server running at port new 3000');
