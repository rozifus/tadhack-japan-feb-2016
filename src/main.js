
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





