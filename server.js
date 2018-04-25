let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
mongoose = require('mongoose');
 
mongoose.connect('mongodb://vikas.info:1857@ds135917.mlab.com:35917/chat',function(err){
  if(err) { console.log(err)
  }else{
    console.log('Connected to mongodb!');
  }
  });

var chatSchema = new mongoose.Schema({
text: String,
from: String,
created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

io.on('connection', (socket) => {
  Chat.find( {}, function(err, docs){
   if(err) throw err;
  //  console.log('sending old messages');
   socket.emit('load old msgs', docs);
  });
  
  socket.on('disconnect', function(){
    io.emit('users-changed', {user: socket.nickname, event: 'left'});   
  });
 
  socket.on('set-nickname', (nickname) => {
    socket.nickname = nickname;
    io.emit('users-changed', {user: nickname, event: 'joined'});    
  });
  
  socket.on('add-message', (message) => {
    
    
    var newMsg = new Chat({text: message.text, from: socket.nickname, created: new Date()});
    newMsg.save(function(err){
     if(err) throw err;
    });


    io.emit('message', {text: message.text, from: socket.nickname, created: new Date()});    
  });
});
 
var port = process.env.PORT || 3001;
 
http.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});