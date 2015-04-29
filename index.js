var socketIo = require('socket.io-client'),
    RocketLauncher = require('./launcher').RocketLauncher,
    serverIp = process.env.SERVER_IP,
    serverPort = process.env.SERVER_PORT;

if(!serverIp)
  serverIp = '127.0.0.1'

if(!serverPort)
  serverPort = 3000

rocketLauncher = new RocketLauncher();

socket = socketIo('http://' + serverIp +':3000');
rocketLauncher.init();

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
  rocketLauncher[action]();
  console.log('performed action ' + action);
}

socket.on('keydown',
  function(data){
    performAction(data);
  }
);

socket.on('stop',
  function(data) { rocketLauncher.stop() }
);
