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
const { db, admin } = require("./config/firebase")

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));



io.on('connection', (socket) => {

    socket.on('joinRoom', async ({ roomID, playerID, playerName, numOfPlayers, isHost }) => {
        try {
            const roomRef = db.collection('soccer-rooms').doc(roomID);
            const roomDoc = await roomRef.get();

            if (isHost) {
                if (!roomDoc.exists) {
                    const newRoom = {
                        roomID,
                        players: [{ playerID, playerName, socketID: socket.id, connected: true }],
                        numOfPlayers,
                        hostID: playerID,
                        hostName: playerName,
                        gameStarted: false,
                        createdAt: new Date(),
                        startTime: null,
                        selectedFlagHost: null,
                        selectedFlagPlayer: null,
                    };
                    await roomRef.set(newRoom);
                    socket.join(roomID);
                } else {
                    const roomData = roomDoc.data();
                    const hostPlayer = roomData.players.find(p => p.playerID === playerID);
                    if (hostPlayer) {
                        if (roomData.gameStarted) {
                            socket.emit('gameStarted', { message: 'Game has already started. You cannot join the room.' });
                        } else {
                            hostPlayer.connected = true;
                            hostPlayer.socketID = socket.id;
                            roomData.hostID = playerID;
                            roomData.hostName = playerName;
                            roomData.numOfPlayers = numOfPlayers;
                            roomData.startTime = new Date().getTime();
                            await roomRef.update(roomData);
                            socket.join(roomID);
                        }
                    } else {
                        socket.emit('joinRoomError', { message: 'Host player not found in the room.' });
                    }
                }
            } else {
                setTimeout(async () => {
                    const roomDoc = await roomRef.get();
                    if (!roomDoc.exists) {
                        socket.emit('joinRoomError', { message: 'Room not found' });
                    } else {
                        const roomData = roomDoc.data();
                        if (roomData.gameStarted) {
                            socket.emit('gameStarted', { message: 'Game has already started. You cannot join the room.' });
                        } else {
                            const existingPlayer = roomData.players.find(p => p.playerID === playerID);
                            if (existingPlayer) {
                                existingPlayer.connected = true;
                                existingPlayer.socketID = socket.id;
                            } else {
                                roomData.players.push({ playerID, playerName, socketID: socket.id, connected: true });
                            }
                            await roomRef.update(roomData);
                            socket.join(roomID);
                            const playersCount = roomData.players.filter(p => p.connected).length;
                            io.in(roomID).emit('waiting', { playersCount, numOfPlayers: roomData.numOfPlayers });

                            if (playersCount === roomData.numOfPlayers) {
                                roomData.gameStarted = true;
                                roomData.startTime = new Date().getTime();
                                await roomRef.update(roomData);
                                io.in(roomID).emit('startGame', {
                                    host: {
                                        hostID: roomData.hostID,
                                        hostName: roomData.hostName,
                                    },
                                    players: roomData.players,
                                });
                            }
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
        const roomsSnapshot = await db.collection('soccer-rooms').get();

        if (!roomsSnapshot.empty) {
            let roomDoc, roomData, player, roomID, playerID, startTime;
            for (let doc of roomsSnapshot.docs) {
                const data = doc.data();
                const foundPlayer = data.players.find(p => p.socketID === socket.id);

                if (foundPlayer) {
                    roomDoc = doc;
                    roomData = data;
                    player = foundPlayer;
                    break;
                }
            }

            if (player) {
                player.connected = false;
                await roomDoc.ref.update(roomData);

                const remainingPlayer = roomData.players.find(p => p.socketID !== socket.id && p.connected);
                if (remainingPlayer) {
                    roomID = roomData.roomID;
                    playerID = remainingPlayer.playerID;
                    startTime = roomData.startTime;

                    const url = 'https://us-central1-html5-gaming-bot.cloudfunctions.net/callbackpvpgame';
                    const sign = 'EvzuKF61x9oKOQwh9xrmEmyFIulPNh';

                    const mydata = {
                        gameUrl: 'soccer',
                        method: 'win',
                        roomID: roomID,
                        winnerID: playerID,
                        timeStart: startTime,
                    };

                    try {
                        io.in(roomID).emit('gameEnd');
                        await axios.post(url, mydata, {
                            headers: {
                                'sign': sign,
                            },
                        }).then(async () => {
                            io.in(roomID).emit('gamefinished');
                            await roomDoc.ref.delete();
                        });
                    } catch (error) {
                        console.log('Error sending game result:', error);
                    }
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
            const roomRef = db.collection('soccer-rooms').doc(roomID);
            const roomDoc = await roomRef.get();

            if (!roomDoc.exists) {
                socket.emit('flagSelectedError', { message: 'Room not found' });
                return;
            }

            const roomData = roomDoc.data();

            if (host !== undefined) {
                roomData.selectedFlagHost = host;
            } else if (player !== undefined) {
                roomData.selectedFlagPlayer = player;
            }

            await roomRef.update(roomData);

            if (roomData.selectedFlagHost !== null && roomData.selectedFlagPlayer !== null && roomData.players.length === 2) {
                io.in(roomID).emit('flagsSelected', {
                    selectedFlagHost: roomData.selectedFlagHost,
                    selectedFlagPlayer: roomData.selectedFlagPlayer,
                });
            }
        } catch (error) {
            console.error('Error handling flag selection:', error);
            socket.emit('flagSelectedError', { message: 'Error handling flag selection.' });
        }
    });

    socket.on("gamefinished", async (data) => {
        const roomID = data.roomID;
        const playerID = data.winnerID;
        const roomRef = db.collection('soccer-rooms').doc(roomID);
        const roomDoc = await roomRef.get();
        const roomData = roomDoc.data();
        const startTime = roomData.startTime;

        const url = 'https://us-central1-html5-gaming-bot.cloudfunctions.net/callbackpvpgame';
        const sign = 'EvzuKF61x9oKOQwh9xrmEmyFIulPNh';

        const mydata = {
            gameUrl: 'soccer',
            method: 'win',
            roomID: roomID,
            winnerID: playerID,
            timeStart: startTime,
        };

        try {
            await axios.post(url, mydata, {
                headers: {
                    'sign': sign,
                },
            })
            io.in(roomID).emit('gamefinished');
            await roomRef.delete();
        } catch (error) {
            console.log('Error sending game result:', error);
        }

    });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
