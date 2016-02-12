

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


