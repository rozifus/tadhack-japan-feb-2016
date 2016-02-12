(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){

var Main = require('./main');

var main = new Main();





},{"./main":4}],3:[function(require,module,exports){

var TestRoom = require('./testroom');
var Overlay = require('./overlay');

var GUI = module.exports = function(obj) {

  this.state = obj.state;
  this.initialize();
  this.overlay = new Overlay(obj);
  this.test();

};

GUI.prototype.initialize = function() {

  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;
  var aspect = screenWidth / screenHeight;

  var container, renderer;
  var scene, camera, cameraHelper;

  this.container = document.createElement('div');
  document.body.appendChild(this.container)

  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 10000);
  this.scene.add(this.camera);

  this.renderer = new THREE.WebGLRenderer( {antialias: true} );
  this.renderer.setSize( screenWidth, screenHeight );

  this.container.appendChild( this.renderer.domElement );

  this.animate();

  var t = this;
  function onWindowResize( event ) {
    t.resize();
  }

  window.addEventListener( 'resize', onWindowResize, false );

}

GUI.prototype.resize = function() {

  var width = window.innerWidth;
  var height = window.innerHeight;
  var aspect = width / height;

  this.renderer.setSize( width, height );
  this.camera.aspect = aspect;
  this.camera.updateProjectionMatrix();

}

GUI.prototype.test = function() {

  var mesh = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 15, 15 , 15 ),
    new THREE.MeshBasicMaterial( { color: 0xaaffcc, wireframe: true } )
  );

  mesh.position.y = 150;
  this.scene.add( mesh );

  this.camera.lookAt( mesh.position )

}

GUI.prototype.animate = function() {

  var t = this;
  function frame() {
    requestAnimationFrame(frame);
    t.update();
    t.render();
  }
  frame()

}

GUI.prototype.update = function() {

}

GUI.prototype.render = function() {

  this.renderer.render(this.scene, this.camera);

}


},{"./overlay":6,"./testroom":8}],4:[function(require,module,exports){

var Gui = require('./gui');
var Network = require('./network');
var State = require('./state');

var Main = module.exports = function() {

  this.state = new State();
  var obj = {state: this.state};
  this.gui = new Gui(obj);
  this.network = new Network(obj);

  var t = this

  function frame() {
    requestAnimationFrame(frame);
    t.update();
  }
  frame()

}

Main.prototype.update = function() {

  this.network.frame();
  this.gui.render();

}






},{"./gui":3,"./network":5,"./state":7}],5:[function(require,module,exports){

var Network = module.exports = function(obj) { 

  this.state = obj.state 
  this.frameCount = 0;
  this.framesPerFindPeers = 60 * 5;

  this.createPeer();

}

Network.prototype.findPeers = function() {

  var t = this;

  this.peer.listAllPeers(function(newList) {
    t.state.setPeerList(newList);
  });

}

Network.prototype.frame = function() {

  if ((this.frameCount % this.framesPerFindPeers) == 0) {
    this.findPeers();
  }

  this.frameCount++;
  if (this.frameCount >= Number.MAX_VALUE) {
    this.frameCount = 0
  }

}

Network.prototype.createPeer = function() {

  var t = this;

  this.peer = new Peer({key: '423dfb31-1f46-43cd-994b-d506854b95a0'});

  this.peer.on('open', function(id) {
    t.state.setPeerId(id);
  });

}




},{}],6:[function(require,module,exports){


var Overlay = module.exports = function(obj) {

  this.state = obj.state;
  this.connectEvents();

}

Overlay.prototype.connectEvents = function() {

  var t = this;

  t.state.on('new-peer-list', function(newList) {
    t.updatePeerList(t.state.getForeignPeerList());
  });

}

Overlay.prototype.updatePeerList = function(list) {

  var userList = $('#user-list');
  userList.empty();

  for (var i = 0; i < list.length; i++) {
    $('<div/>', {
      'class': 'user-button',
      'data-user-id': list[i],
      html: '<p>'+list[i]+'</p>' 
    }).appendTo($('#user-list'));
  };

}



},{}],7:[function(require,module,exports){

var peerList = new Array();
var peerId = '';
var EventEmitter = require('events').EventEmitter;

var State = module.exports = function() { 

  EventEmitter.call(this);
  this.initialize();

}

State.prototype = new EventEmitter;

State.prototype.initialize = function() {


}

State.prototype.setPeerList = function(newList) {
  peerList = newList;
  this.emit('new-peer-list', newList);
}

State.prototype.getPeerList = function() {
  return peerList;
}

State.prototype.getForeignPeerList = function() {

  var fpl = new Array();
  for (var i = 0; i < peerList.length; i++) {
    if (peerList[i] !== peerId) {
      fpl.push(peerList[i]);
    };
  };
  return fpl;

}

State.prototype.setPeerId = function(newPeerId) {

  peerId = newPeerId;
  this.emit('new-peer-id', newPeerId);

}




},{"events":1}],8:[function(require,module,exports){

module.exports = { 
  Init: function() {
    console.log("iniit");
  }
}


},{}]},{},[2]);
