# telepresence-brain-nodejs

This is an application that will live on a Raspberry Pi attached to the body of
a telepresence robot. The Raspberry Pi will be connected by serial connection
to one or two Arduinos that will be used to control the robot's wheels and the
camera movement. This application will control these two subsystems and
communicate with a central webserver that will relay messages from a user
directing the robot.

**Note:** Right now this code is based off of code that was used to control a
USB rocket launcher. In the future the rocket launcher related code will be
removed in favor of code that interfaces with the camera swivel system.

## Requirements

- [Node.js](https://nodejs.org/)
- [The web server](https://github.com/berkshirestech/telepresence-webserver)
  (optional)
- [Rocket launcher](http://dreamcheeky.com/thunder-missile-launcher) See note
  above. This is temporary.

## Installation

- `npm install`

## Usage

``` bash
# use your IP and port here
SERVER_IP=192.168.1.24 SERVER_PORT=3001 node index.js
```

The script will connect as a client to a webserver running socket.io at the
provided IP and port. If the server sends a socket.io message of 'keydown' the
data for the message will be passed to the rocket launcher class.
