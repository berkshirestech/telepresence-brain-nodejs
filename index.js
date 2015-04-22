var socketIo = require('socket.io-client'),
    RocketLauncher = require('./launcher').RocketLauncher;

rocketLauncher = new RocketLauncher();

socket = socketIo('http://192.168.1.24:3000');
rocketLauncher.init();

rocketLauncher.testFunctions();

socket.on('connect',
  function(){
    console.log('connected');
    socket.emit('imarobot', { named: 'Joe' });
  }
);

socket.on('event',
  function(data){ console.log('an event was received', data) }
);

socket.on('disconnect',
  function(){ console.log('disconnected') }
);

socket.on('keypress',
  function(data){
    switch(data) {
      case 'shoot':
        rocketLauncher.shoot();
        setTimeout(
          function() { rocketLauncher.boom() }, 8000
          );
        break;
      case 'left':
        rocketLauncher.left();
        setTimeout(
          function() { rocketLauncher.stop() }, 100
        );
        break;
      case 'right':
        rocketLauncher.right();
        setTimeout(
          function() { rocketLauncher.stop() }, 100
        );
        break;
      case 'up':
        rocketLauncher.up();
        setTimeout(
          function() { rocketLauncher.stop() }, 100
        );
        break;
      case 'down':
        rocketLauncher.down();
        setTimeout(
          function() { rocketLauncher.stop() }, 100
        );
        break;
    }
  }
);

