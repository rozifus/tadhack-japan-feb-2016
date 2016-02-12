
module.exports = Network = function() { 

  var t = this;

  this.id = null;
  this.peer = new Peer({key: '423dfb31-1f46-43cd-994b-d506854b95a0'});

  this.peer.on('open', function(id) {
    t.id = id;
    console.log("connected: " + id);
  });

}

