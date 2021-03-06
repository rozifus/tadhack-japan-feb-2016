
var TestRoom = require('./testroom');
var Overlay = require('./overlay');
var Camera = require('./camera');

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

  // var container, renderer;
  // var scene, camera, cameraHelper;

  this.container = document.getElementById('main-canvas');
  // document.body.appendChild(this.container)

  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 10000);
  // this.camera.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ) )
  // this.scene.add(this.camera);

  this.renderer = new THREE.WebGLRenderer( {antialias: true} );
  this.renderer.setSize( screenWidth, screenHeight );

  this.container.appendChild( this.renderer.domElement );

  this.controls = new THREE.OrbitControls( this.camera );
  this.controls.target = new THREE.Vector3(0, 0.5, 1.5);
  this.controls.update();
  this.controls.addEventListener('change', function(){
    console.log("Moving...");
    this.render();
  }.bind(this));

  this.depthCamera = new Camera();
  this.scene.add(this.depthCamera.scene_object)

  this.render();

  // this.animate();

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

  //mesh.position.y = 150;
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

