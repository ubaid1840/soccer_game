const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'your_mongodb_uri';

app.use(express.static(path.join(__dirname)));

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const roomSchema = new mongoose.Schema({
    roomID: String,
    players: [{
        playerID: String,
        playerName: String,
        socketID: String,
        connected: { type: Boolean, default: true }
    }],
    numOfPlayers: Number,
    createdAt: { type: Date, default: Date.now },
    hostID: String,
    hostName: String,
    gameStarted: { type: Boolean, default: false },
    startTime: String,
    selectedFlagHost: { type: Number, default: null } ,
    selectedFlagPlayer: { type: Number, default: null } ,
    
});

const Room = mongoose.model('Room', roomSchema);

io.on('connection', (socket) => {

    socket.on('joinRoom', async ({ roomID, playerID, playerName, numOfPlayers, isHost }) => {
        try {
            let room = await Room.findOne({ roomID });
           
            if (isHost) {
                if (!room) {
                    room = new Room({
                        roomID,
                        players: [{ playerID, playerName, socketID: socket.id, connected: true }],
                        numOfPlayers,
                        hostID: playerID,
                        hostName: playerName,
                        gameStarted: false
                    });
                    await room.save();
                    socket.join(roomID);
                } else {

                    const hostPlayer = room.players.find(p => p.playerID === playerID);
                    if (hostPlayer) {
                        if (room.gameStarted) {
                            socket.emit('gameStarted', { message: 'Game has already started. You cannot join the room.' });
                        } else {
                            hostPlayer.connected = true;
                            hostPlayer.socketID = socket.id;
                            room.hostID = playerID;
                            room.hostName = playerName;
                            room.numOfPlayers = numOfPlayers;
                            room.startTime = new Date().getTime()
                            await room.save();
                            socket.join(roomID);
                        }
                    } else {
                        socket.emit('joinRoomError', { message: 'Host player not found in the room.' });
                        return;
                    }
                }
            } else {
                setTimeout(async () => {
                    room = await Room.findOne({ roomID });
                    if (!room) {
                        socket.emit('joinRoomError', { message: 'Room not found' });
                    } else if (room.gameStarted) {
                        socket.emit('gameStarted', { message: 'Game has already started. You cannot join the room.' });
                    } else {
                        const existingPlayer = room.players.find(p => p.playerID === playerID);
                        if (existingPlayer) {
                            existingPlayer.connected = true;
                            existingPlayer.socketID = socket.id;
                        } else {
                            room.players.push({ playerID, playerName, socketID: socket.id, connected: true });
                        }
                        await room.save();
                        socket.join(roomID);
                        const playersCount = room.players.filter(p => p.connected).length;
                        io.in(roomID).emit('waiting', { playersCount, numOfPlayers: room.numOfPlayers });

                        if (playersCount === room.numOfPlayers) {
                            room.gameStarted = true;
                            room.startTime = new Date().getTime()
                            await room.save();
                            io.in(roomID).emit('startGame',  {
                                host: {
                                    hostID: room.hostID,
                                    hostName: room.hostName
                                },
                                players: room.players
                            });
                        }
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('joinRoomError', { message: 'Error joining room. Please try again.' });
        }
    });

    socket.on('playerDisconnectData', async () => {
        const room = await Room.findOne({ 'players.socketID': socket.id });
        if (room) {
            const player = room.players.find(p => p.socketID === socket.id);
            if (player) {
                player.connected = false;
                await room.save();
                const remainingPlayer = room.players.find(p => p.socketID !== socket.id && p.connected);
                if (remainingPlayer) {
                    const roomID = room.roomID
                    const playerID = remainingPlayer.playerID
                    const startTime = room.startTime
            
                    const url = ' https://us-central1-html5-gaming-bot.cloudfunctions.net/callbackpvpgame';
                    const sign = 'EvzuKF61x9oKOQwh9xrmEmyFIulPNh';
            
                    const mydata = {
                        gameUrl : 'soccer',
                        method: 'win',
                        roomID: roomID,
                        winnerID: playerID,
                        timeStart: startTime
                    };
                    try {
                        io.in(room.roomID).emit('gameEnd');
                        await axios.post(url, mydata, {
                            headers: {
                                'sign': sign
                            }
                        }).then(async () => {
                            io.in(room.roomID).emit('gamefinished');
                            await Room.deleteOne({ roomID })
                        })
            
                    } catch (error) {
                        console.log('Error sending game result:', error);
                    }

                    // io.in(room.roomID).emit('singlePlayerDisconnected', { remainingPlayer });
                }
            }
        }
    });

    socket.on("kick", (data) => {
        io.in(data.roomID).emit('kickBy', data);
    });

    socket.on("launchPenalty", (data) => {
        io.in(data.roomID).emit('launchPenaltyBy', data);
    });

    socket.on('flagSelected', async ({ roomID, host, player }) => {
        try {
            const room = await Room.findOne({ roomID });
            if (!room) {
                socket.emit('flagSelectedError', { message: 'Room not found' });
                return;
            }
    
            if (host !== undefined) {
                room.selectedFlagHost = host;
            } else if (player !== undefined) {
                room.selectedFlagPlayer = player;
            }
    
            await room.save();
    
            // Check if both players have selected flags
            if (room.selectedFlagHost !== null && room.selectedFlagPlayer !== null && room.players.length === 2) {
                io.in(roomID).emit('flagsSelected', {
                    selectedFlagHost: room.selectedFlagHost,
                    selectedFlagPlayer: room.selectedFlagPlayer
                });
            }
    
        } catch (error) {
            console.error('Error handling flag selection:', error);
            socket.emit('flagSelectedError', { message: 'Error handling flag selection.' });
        }
    });

    socket.on("gamefinished", async (data) => {
        const roomID = data.roomID
        const playerID = data.winnerID
        const room = await Room.findOne({ roomID });
        const startTime = room.startTime

        const url = ' https://us-central1-html5-gaming-bot.cloudfunctions.net/callbackpvpgame';
        const sign = 'EvzuKF61x9oKOQwh9xrmEmyFIulPNh';

        const mydata = {
            gameUrl : 'soccer',
            method: 'win',
            roomID: roomID,
            winnerID: playerID,
            timeStart: startTime
        };
        try {
            await axios.post(url, mydata, {
                headers: {
                    'sign': sign
                }
            }).then(async () => {
                io.in(data.roomID).emit('gamefinished');
                await Room.deleteOne({ roomID })
            })

        } catch (error) {
            console.log('Error sending game result:', error);
        }

    });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
