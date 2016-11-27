var Gpio = require('onoff').Gpio;
var input1 = new Gpio(25, 'out');
input1.writeSync(1);
setTimeout(function() {
  input1.writeSync(0);  // Turn LED off.
  input1.unexport();    // Unexport GPIO and free resources
}, 5000);

