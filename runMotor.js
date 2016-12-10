var Gpio = require('onoff').Gpio;
var input1 = new Gpio(23, 'out');
var input2 = new Gpio(24, 'out');
var enablePin = new Gpio(25, 'out');

enablePin.writeSync(1);
input1.writeSync(0);
input2.writeSync(1);
setTimeout(function() {
  input1.writeSync(0);  // Turn LED off.
  input1.unexport();    // Unexport GPIO and free resources
  input2.writeSync(0);  // Turn LED off.
  input2.unexport();    // Unexport GPIO and free resources
  enablePin.writeSync(0);  // Turn LED off.
  enablePin.unexport();    // Unexport GPIO and free resources
}, 110);
