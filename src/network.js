
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



