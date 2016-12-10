var Gpio = require('onoff').Gpio;
var input1 = new Gpio(23, 'out');
var input2 = new Gpio(24, 'out');
var enablePin = new Gpio(25, 'out');

input1.writeSync(0);
input2.writeSync(1);
enablePin.writeSync(1);
setTimeout(function() {
  enablePin.writeSync(0);  // Turn LED off.
  enablePin.unexport();    // Unexport GPIO and free resources
  input1.writeSync(0);  // Turn LED off.
  input1.unexport();    // Unexport GPIO and free resources
  input2.writeSync(0);  // Turn LED off.
  input2.unexport();    // Unexport GPIO and free resources
}, 110);
