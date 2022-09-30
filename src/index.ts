const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players: {
  playerId: string;
  x: number;
  y: number;
}[] = [];
io.on('connection', (socket) => {
  io.sockets.emit('newPlayer', {
    playerId: socket.id,
    x: 0,
    y: 0,
  });
  for (const player of players) {
    socket.emit('newPlayer', player);
  }

  players.push({
    playerId: socket.id,
    x: 0,
    y: 0,
  });

  socket.on('playerMove', (data) => {
    io.sockets.emit('playerMove', {
      ...data,
      playerId: socket.id,
    });

    const player = players.find(player => player.playerId === socket.id);
    player.x = data.x;
    player.y = data.y;
  });

  socket.on('disconnect', () => {
    const index = players.findIndex(player => player.playerId === socket.id);
    players.splice(index, 1);

    io.sockets.emit('playerDisconnect', socket.id);
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
