(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


var Gui = require('./gui');
var Network = require('./network');
var State = require('./state');

function init () {
  console.log('init main');
}

var gui = new Gui();
var network = new Network();





},{"./gui":2,"./network":3,"./state":4}],2:[function(require,module,exports){

var TestRoom = require('./testroom')

module.exports = GUI = function() {

  this.initialize();
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


},{"./testroom":5}],3:[function(require,module,exports){

module.exports = Network = function() { 

  var t = this;

  this.id = null;
  this.peer = new Peer({key: '423dfb31-1f46-43cd-994b-d506854b95a0'});

  this.peer.on('open', function(id) {
    t.id = id;
    console.log("connected: " + id);
  });

}


},{}],4:[function(require,module,exports){

module.exports = { 
  Init: function() {
    console.log("iniit");
  }
}


},{}],5:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}]},{},[1]);
