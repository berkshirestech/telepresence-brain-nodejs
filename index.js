"use strict";

var sp = require("serialport");
var Q = require("q");

var DeviceType = {
  LEGS: "l",
  HEAD: "h"
}

/**
 * Given a serial port name, makes a connection to that name, and uses
 * the "WHO" protocol to discover which device this serial port belongs to
 *
 * @return A promise for the device object which has a type and serial port
 */
function connectToDevice(serialPortName) {
  console.log("connecting to device: " + serialPortName);
  var SerialPort = sp.SerialPort
  var serialPort = new SerialPort(serialPortName, {
    baudrate: 9600
  });
  var deferred = Q.defer();
  serialPort.on("open", function () {
    console.log('serial port open');

    //register to listen for serial data coming from
    //the device
    serialPort.on('data', function(data) {
      data = data.toString().trim();
      clearInterval(pingTimer);
      if(data === DeviceType.LEGS){
        //we know this connection is for the "legs"
        console.log('found legs');
        deferred.resolve({
          port: serialPort,
          type: DeviceType.LEGS
        });
      }else if(data === DeviceType.HEAD){
        //we know this connection is for the "head"
        console.log('found head');
        deferred.resolve({
          port: serialPort,
          type: DeviceType.HEAD
        });
      }else{
        console.log("data: " + data);
      }
    });

    console.log('initiating WHO protocol');
    var pingTimer = setInterval(function(){
      serialPort.write('h',function(err, results) {
        if(err) console.log('err ' + err);
      });
    }, 100);
  });
  return deferred.promise;
}

/**
 * After the head and leg devices have successfully been found and
 * connected to, we can connect to the web server and listen for instructions
 * to control the head and legs
 */
function connectToServer(headPort, legsPort){
  console.log("head:" + headPort);
  console.log("legs:" + legsPort);
  console.log("connecting to server");
  var socketIo = require('socket.io-client'),
      serverIp = process.env.SERVER_IP || '127.0.0.1',
      serverPort = process.env.SERVER_PORT || 3000;

  console.log("connecting to: " + 'http://' + serverIp +':'+serverPort);
  var socket = socketIo('http://' + serverIp +':'+serverPort);

  socket.on('keydown',
    function(data){
      performAction(data);
    }
  );

  socket.on('stop',
    function(data) { stop() }
  );

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
    var serialPort = action === action.toUpperCase()?headPort:legsPort;
    serialPort.write(action, function(err, results) {
      if(err) console.log('err ' + err);
    });
  }

  var stop = function(){
    console.log("stopping");
    legsPort.write("s", function(err, results) {
      if(err) console.log('err ' + err);
    });
    headPort.write("S", function(err, results) {
      if(err) console.log('err ' + err);
    });
  }
}

//Get a list of all the connected devices
var listSerial = Q.nfbind(sp.list);
listSerial()
.then(function(ports){
  var serialPromises = [];
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
    if(port.manufacturer.indexOf('Arduino') >= 0) {
      serialPromises.push(connectToDevice(port.comName));
    }
  });
  console.log(serialPromises.length + " serial promises");
  return Q.all(serialPromises);
})
.then(function(devices){
  var head, legs;
  devices.forEach(function(d){
    if(d.type === DeviceType.HEAD){
      head = d.port;
    }else if(d.type === DeviceType.LEGS){
      legs = d.port;
    }
  });
  connectToServer(head, legs);
})
