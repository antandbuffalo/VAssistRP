var http = require('http');
var express = require('express');
var Gpio = require('onoff').Gpio;
var gpioPins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];

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
    db.run("CREATE TABLE DEVICE (p_id TEXT, d_status TEXT)");
    var stmt = db.prepare("INSERT INTO DEVICE VALUES (?, ?)");
    //Insert random data
    var input;
    stmt.run("11", "closed");
    stmt.run("12", "off");
    stmt.finalize();
    db.each("SELECT rowid AS id, p_id, d_status FROM DEVICE", function(err, row) {
      console.log(row);
    });
  }
});
db.close();

var inputs = [{ pin: '11', gpio: '17', value: 1 },
              { pin: '12', gpio: '18', value: 0 }];
app.get('/inputs/:id', function(req, res) {
  console.log(req.params.id);
  res.status(200).send(inputs[req.params.id]);
});

function glowLedFor5Sec(gpioPin) {
  var led =  new Gpio(gpioPin, 'out');
  led.writeSync(1);
  setTimeout(function() {
    led.writeSync(0);
    led.unexport();
  }, 5000);
};

//give power supply for 5 seconds to open the door
function openDoor() {
  var led =  new Gpio(17, 'out');
  led.writeSync(1);
  setTimeout(function() {
    led.writeSync(0);
    led.unexport();
  }, 5000);
};

//give power supply for 5 seconds to close the door
function closeDoor() {
  var led =  new Gpio(24, 'out');
  led.writeSync(1);
  setTimeout(function() {
    led.writeSync(0);
    led.unexport();
  }, 5000);
};

app.post('/glowled/:pinNo', function(req, res) {
  var output = {'error': 'Port not configured'};
  if(req.params.pinNo >= 2 && req.params.pinNo <= 27) {
    console.log("glowing LED");
    output = {'success': true};
    glowLedFor5Sec(req.params.pinNo);
  }
  res.status(200).send(output);
});

app.post('/actions', function(req, res) {
  console.log(req);
  res.send(req.body);
});

app.post('/dooraccess/:command', function(req, res) {
  //console.log();
  var output = {'error': 'Port not configured'};
  if(req.params.command === "open") {
    console.log("opening door");
    output = {'success': true};
    openDoor();
  }
  else if(req.params.command === "close") {
    console.log("closing door");
    output = {'success': true};
    closeDoor();
  }
  else if(req.params.command === "on") {
    console.log("opening door");
    output = {'success': true};
    openDoor();
  }
  else if(req.params.command === "off") {
    console.log("closing door");
    output = {'success': true};
    closeDoor();
  }
  res.status(200).send(output);
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
