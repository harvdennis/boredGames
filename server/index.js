const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const path = require('path');

sockets = {};
people = {};
peopleWaiting = {};

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

function roomMatch(room, ownId) {
    let i = 0;
    for (socketId in peopleWaiting) {
        if (peopleWaiting[socketId].room === room && ownId !== socketId) {
            return socketId;
        }
    }
    return false;
}

function getARoom(user1, user2) {
    return '' + user1.name + '' + user2.name + '';
}

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ user, room }) => {
        people[socket.id] = { name: user, room: room };
        socket.emit('joinedRoom', true);
    });
    socket.on('waiting', ({ user, room }) => {
        sockets[socket.id] = { socket: socket };
        socket.emit('loading', true);
        peopleWaiting[socket.id] = { name: user, room: room };
        let size = Object.keys(peopleWaiting).length;
        if (size > 1) {
            let opponentId = roomMatch(room, socket.id);
            console.log(socket.id, opponentId);

            if (opponentId) { 
                let opponent = peopleWaiting[opponentId];
                let room = getARoom(peopleWaiting[socket.id], opponent);

                sockets[opponentId].socket.join(room);
                socket.join(room);

                io.sockets.in(room).emit('joinedMatch', room);

                socket.to(room).emit('player', 'white');
                socket.emit('player', 'black');

                delete peopleWaiting[socket.id];
                delete peopleWaiting[opponentId];
                socket.emit('loading', false);
                sockets[opponentId].socket.emit('loading', false);
            }
        }
    });

    socket.on('sendMove', ({ currentmove, matchRoom }) => {
        socket.to(matchRoom).emit('sendMove', currentmove);
    });

    socket.on('disconnect', function () {
        delete people[socket.id];
        delete peopleWaiting[socket.id];
        delete sockets[socket.id];
        console.log('disconnect');
    });

    socket.on('disconnected', function () {
        delete people[socket.id];
        delete peopleWaiting[socket.id];
        delete sockets[socket.id];
        console.log('disconnected');
    });
});

server.listen(port, () => console.log(`listening on port: ${port}`));
