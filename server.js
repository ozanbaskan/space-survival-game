
const Rock = require("./game-server/game-objects/rock.js")

const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const helmet = require('helmet')

const app = express();
const cors = require('cors');

app.use(cors({origin: '*'}));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());


app.use(function (req, res, next) {
  res.setHeader( 'X-Powered-By', 'PHP 7.4.3' );
  next();
});


// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);




let playerName;





//Game rooms
app.route('/room')
  .post(function(req,res){
    if (req.body.gameName.length < 4 || req.body.gameName.length > 8){
      
      return res.redirect('/');
    }
    return res.redirect('/' + req.body.gameName + '?playerName=' + req.body.playerName);
  })
  
  app.route('/:room')
  .get(function(req,res){
    if (req.params.room.length < 4 || req.params.room.length > 8 || !req.query.playerName || req.query.playerName.length > 9 || req.query.playerName.length < 3 || req.query.playerName.includes('=')){
      return res.json('Not valid');
    }
    playerName = req.query.playerName
    return res.sendFile(process.cwd() + '/views/game.html');
    server()
  });
    


// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});




const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});


const io = socket(server);
let gameStates = {}
let rocks = {}
let levels = {}
let players = {}
let allFires = {}
let colors = {}
io.on('connect', function(socket){

  socket.on('joinRoom', function(roomName){

    socket.join(roomName)
    io.to(roomName).emit('welcome', playerName)
    
    for (let c = 0; c < 4;c++){
      if (!colors[roomName]){
        colors[roomName] = []
      }
      if (!colors[roomName].includes(c)){
        colors[roomName].push(c)
        io.to(socket.id).emit('color', c)
        break;
      }
    }

    if (players[roomName] && players[roomName].length > 3){
      io.to(socket.id).emit('server-full', 1)
      socket.disconnect()
    }
    if (!rocks[roomName]){
      rocks[roomName] = [];
    }
    
    gameStates[roomName] = true;
    
    function manageLevels(){
      
      if (!levels[roomName] || (levels[roomName] > 1) && (!players[roomName] && players[roomName].length < 1)){
        let timeOutLevels;
        levels[roomName] = 1
          const levelFunction = () =>  {
          if (players[roomName] && players[roomName].length !== 0){
          levels[roomName] += 1;
          timeOutLevels = setTimeout(levelFunction, (levels[roomName] * 1000) + 9000)
        } else {
          levels[roomName] = undefined
          delete levels[roomName]
        }
          };

          const createRock = () => {
            if (rocks[roomName]){

            
            if (levels[roomName] > 9){
              let rock = new Rock(true)
              rocks[roomName].push(rock)
            } else {
              let rock = new Rock(false)
              rocks[roomName].push(rock)
            }
            if (players[roomName] && players[roomName].length !== 0){
            setTimeout(createRock, 1000 / (levels[roomName] * 1 || 1));
          }
          }}

          const moveRockAndCollide = () => {
            if (!gameStates[roomName]){
              rocks[roomName] = [];
              levels[roomName] = 1;
              gameStates[roomName] = true;
              clearTimeout(timeOutLevels)
              timeOutLevels = setTimeout(levelFunction, 10000);

            }
            for (let i = 0;i <rocks[roomName].length;i++) {
              rocks[roomName][i].move(1 + (levels[roomName] / 10))
              rocks[roomName][i].destroy(allFires[roomName])
              if (rocks[roomName][i].y + rocks[roomName][i].h > 630){
                if (gameStates[roomName]) gameStates[roomName] = false
              }
              rocks[roomName] = rocks[roomName].filter(rock => !rock.destroyValue);
            }
           
              
           
            if (players[roomName] && players[roomName].length !== 0){
          setTimeout(moveRockAndCollide, 1000 / 60);
          }}
          if (players[roomName] && players[roomName].length !== 0){
          setTimeout(moveRockAndCollide, 1000 / 60);
          setTimeout(createRock, 1000 / (levels[roomName] * 1 || 1));
          setTimeout(levelFunction, (levels[roomName] * 1000) + 9000);
        }
          
      }

    }


    socket.on('new-player', function(player){
      if(!players[roomName]){
        players[roomName] = []
      }
      players[roomName].push(player)
    })
    socket.on('info', function({player: currentPlayer, fires: fires, playerId: playerId}){
      
      players[roomName] = players[roomName].map(function(player){
        if (player.id === currentPlayer.id){
          return currentPlayer
        } else{
          return player
        }
      })
      if (!allFires[roomName]){
        allFires[roomName] = {}
      }
      
        allFires[roomName][playerId] = fires
      io.to(roomName).emit('level', levels[roomName])
      io.to(roomName).emit('gameState', gameStates[roomName])
      io.to(roomName).emit('rocks', rocks[roomName])
      io.to(roomName).emit('allFires', allFires[roomName])
      io.to(roomName).emit('allPlayers', players[roomName])
        
        })
        
        setTimeout(manageLevels, 3000);

      
     
     socket.on('disconnect', function(){
       colors[roomName] = colors[roomName].filter(function(color){
         if (players[roomName].find(player => player.id === socket.id).color){
           players[roomName].find(player => player.id === socket.id).color !== color
         } 
       } 
        
      )
      players[roomName] = players[roomName].filter(player => player.id !== socket.id);
      delete allFires[roomName][socket.id]
      if (players[roomName].length === 0){
        if (gameStates[roomName]) delete gameStates[roomName];
        if (rocks[roomName]) delete rocks[roomName];
        if (levels[roomName]) delete levels[roomName];
        if (players[roomName]) delete players[roomName];
        if (allFires[roomName]) delete allFires[roomName];
        if (colors[roomName]) delete colors[roomName];
      }
    })

  })

 
  setTimeout(() => console.log('Open rooms:' + Object.keys(players)), 3000)

})

module.exports = app; // For testing
