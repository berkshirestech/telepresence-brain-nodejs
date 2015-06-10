var sp = require("serialport");
sp.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
    if(port.manufacturer == 'Arduino__www.arduino.cc_') {
      main(port.comName);
      return;
    }
  });
});

var main = function(serialPortName) {
  var SerialPort = sp.SerialPort
  var serialPort = new SerialPort(serialPortName, {
    baudrate: 9600
  });
  var socketIo = require('socket.io-client'),
      serverIp = process.env.SERVER_IP,
      serverPort = process.env.SERVER_PORT;

  if(!serverIp)
    serverIp = '127.0.0.1'

  if(!serverPort)
    serverPort = 3000

  socket = socketIo('http://' + serverIp +':3000');

  socket.on('connect',
    function(){
      console.log('connected');
      socket.emit('imarobot');
    }
  );

  socket.on('event',
    function(data){ console.log('an event was received', data) }
  );

  socket.on('disconnect',
    function(){ console.log('disconnected') }
  );

  var performAction = function(action) {
    serialPort.write(action+"\n", function(err, results) {
      if(err) console.log('err ' + err);
    });
  }

  socket.on('keydown',
    function(data){
      performAction(data);
    }
  );

  socket.on('stop',
    function(data) { stop() }
  );

  serialPort.on("open", function () {
    console.log('open');
    serialPort.on('data', function(data) {
      console.log('data received: ' + data);
    });
  });

  function forward(){
    console.log("going forward");
    serialPort.write("f\n", function(err, results) {
      if(err) console.log('err ' + err);
      setTimeout(stop, 5000);
    });
  }

  function stop(){
    console.log("stopping");
    serialPort.write("s\n", function(err, results) {
      if(err) console.log('err ' + err);
    });
  }
}
