# Getting Started

Run the server

```bash
npm run start
```

Following is the example how the URL parameters should be passed for host and for other players

### For Host

http://localhost:5000/?roomID=2&playerID=1&playerName=abc&numOfPlayers=2&isHost=true

### For other players

http://localhost:5000/?roomID=2&playerID=2&playerName=john

## Additional Information

Player Disconnection Handling: If a player disconnects from the game, the remaining player is declared the winner.

End of Game Notification: When the game concludes, the following message is sent to the parent window: window.parent.postMessage({ type: 'finished_soccer' }, '*').

Winner Notification: To declare a winner, the following message is sent to the parent window: window.parent.postMessage({ type: "win_soccer", winner: PLAYER_ID }, "*"), where PLAYER_ID represents the ID of the winning player.

API Post Request: A POST request is made to the API with the following details:

gameUrl: 'soccer'
method: 'win'
roomID: The ID of the room where the game was played
winnerID: The ID of the winning player
timeStart: The start time of the game
