const express = require('express')
const process = require('process')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('a user connected');
  socket.broadcast.emit('hi');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

app.set('port', process.env.PORT || 3000);

http.listen(app.get('port'), () => {
  console.log('listening on *:%d', server.address().port);
});
