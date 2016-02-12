
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



