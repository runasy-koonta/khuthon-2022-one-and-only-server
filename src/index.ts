const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mysql = require('mysql2')
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const connection = mysql.createConnection({
  host: '141.164.42.243',
  user: 'oneandonly',
  password: 'qwerasdfzxcv',
  database: 'khuthon',
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
  connection.execute(
    'SELECT * FROM boards',
    function(err, results, fields) {
      if (err) console.log(err);
      else {
        socket.emit('updateBoard', results);
        console.log(results);
      }
    }
  );

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

  socket.on('registerBoard', (data) => {
    connection.execute(
      'INSERT INTO boards (title, content, creationDate) VALUES (?, ?, NOW());',
      [data.title, data.content],
      function(err, results, fields) {
        if (err) console.log(err);
      }
    );

    connection.execute(
      'SELECT * FROM boards',
      function(err, results, fields) {
        if (err) console.log(err);
        else {
          io.socket.emit('updateBoard', results);
        }
      }
    );
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
