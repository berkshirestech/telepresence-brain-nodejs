var sp = require("serialport");

function scanForArduino(callback){
  sp.list(function (err, ports) {
    if(err){
      callback(err);
    }
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
      if(port.manufacturer.indexOf('Arduino') >= 0) {
        callback(null, port.comName);
        return;
      }
    });
  });
}

function connectToArduino(err, serialPortName) {
  if(err){
    console.error(err);
    process.exit(1);
  }
  var SerialPort = sp.SerialPort
  var serialPort = new SerialPort(serialPortName, {
    baudrate: 9600
  });
  var socketIo = require('socket.io-client'),
      serverIp = process.env.SERVER_IP || '127.0.0.1',
      serverPort = process.env.SERVER_PORT || 3000;

  console.log("connecting to: " + 'http://' + serverIp +':'+serverPort);
  socket = socketIo('http://' + serverIp +':'+serverPort);

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
    console.log("action: " + action);
    serialPort.write(action, function(err, results) {
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

  function stop(){
    console.log("stopping");
    serialPort.write("s", function(err, results) {
      if(err) console.log('err ' + err);
    });
  }
}

scanForArduino(connectToArduino);
