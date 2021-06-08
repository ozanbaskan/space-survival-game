import Player from './Player.mjs';
import Fire from './Fire.mjs'


var socket = io()
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
let colors = ['kırmızı.png', 'mavi.png', 'mor.png', 'yesil.png']
let colorNo;
let level = 1;
let rocks = []
let fireCount = 1
let allPlayers = [];
let dirs = [];
let fires = [];
let otherFires = [];
let lastRenderTime = 0;
let gamePeriod = 1/80;
let player;
let playerId;
let roomName = window.location.href.split('/')[window.location.href.split('/').length - 1].split('?')[0]
let playerName = window.location.href.split('=')[window.location.href.split('=').length - 1]

socket.on('connect', function(){
playerId = socket.id

socket.on('color', function(c){
  player.color = c
})
  player = new Player({id: playerId, name: playerName})


socket.emit('joinRoom', roomName);
socket.emit('new-player', player);


socket.on('welcome', function(message){
  console.log(message)
})


socket.on('allPlayers', function(data){
  allPlayers = data
})
socket.on('allFires', function(data){
  let otherFiresUpdate = []
  for (const key in data){
    if (key !== playerId){
      otherFiresUpdate = otherFiresUpdate.concat(data[key])
    }
  }
  otherFires = otherFiresUpdate;
})

socket.on('rocks', function(incomingRocks){
    rocks = incomingRocks
})

socket.on('level', function(updateLevel){
  level = (updateLevel || 1)
})

socket.on('server-full', function(num){
  window.alert('Room is full')
  setInterval(window.location.href = 'https://boilerplate-project-secure-real-time-multiplayer-game.ozanbakan.repl.co', 2000)
})





document.addEventListener('keydown', function(e){
  switch(e.keyCode){
    case 65:
    if (!dirs.includes('left')) {dirs.push('left')};
    break;
    case 68:
    if (!dirs.includes('right')) {dirs.push('right')};
    break;
    case 83:
    if (!dirs.includes('down')) {dirs.push('down')};
    break;
    case 87:
    if (!dirs.includes('up')) {dirs.push('up')};
    break;
  }
  
});

document.addEventListener('keyup', function(e){
  switch(e.keyCode){
    case 65:
    if (dirs.includes('left')) {dirs.splice(dirs.indexOf('left'), 1)};
    break;
    case 68:
    if (dirs.includes('right')) {dirs.splice(dirs.indexOf('right'), 1)};
    break;
    case 83:
    if (dirs.includes('down')) {dirs.splice(dirs.indexOf('down'), 1)};
    break;
    case 87:
    if (dirs.includes('up')) {dirs.splice(dirs.indexOf('up'), 1)};
    break;
  }
})

document.addEventListener('keypress', function(e){
  if (fires.length < 10){
  if (e.keyCode === 32){
    let fire = new Fire({x: player.x + 8, y: player.y, owner: player.id, id: fireCount})
    fires.push(fire)
    fireCount++
    }
  if (fireCount > 10) {
    fireCount = 1
  }
  }
    
})

function main(time){
  
  let secondsSinceLast = (time - lastRenderTime) / 1000
window.requestAnimationFrame(main);
if (gamePeriod > secondsSinceLast) return
lastRenderTime = time

update()
draw()
socket.emit('info', {player: player, fires: fires, playerId: playerId, level: level})

}



function update(){
  player.movePlayer(dirs, player.speed)
  player.collision(player.speed)
  fires.forEach(fire =>
  fire.moveFire(player.fireSpeed))
  fires = fires.filter(fire => fire.y > 55 && !fire.destroy)

}


function draw(){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#9999e4';
  context.fillRect(0, 0, canvas.width, canvas.height);


  //game frame
  context.strokeStyle = 'white';
  context.strokeRect(10, 60, 620, 570);

  

  context.strokeStyle = 'white';
  context.strokeRect(14, 4, 70, 50);

  
  context.fillStyle = 'white';
  context.font = `9px 'Press Start 2P'`;
  context.textAlign = 'right';
  context.fillText('Controls: WASD, Space', 280, 32.5);

  context.fillStyle = 'white';
  context.font = `11px 'Press Start 2P'`;
  context.textAlign = 'center';
  context.fillText(`Level: ${level}`, 350, 25);

  // logo field
  context.clearRect(15, 5, 68, 48);
  context.fillStyle = '#220';
  context.fillRect(15, 5, 68, 48);

  // play field
  context.clearRect(11, 61, 617, 567);
  context.fillStyle = '#220';
  context.fillRect(11, 61, 617, 567);

  const gameImage = new Image(40,40);
  gameImage.src = 'public/images/' + colors[player.color];
  context.drawImage(gameImage, 30,10,40,40)
  context.clearRect(527, 7, 24, 24);
    context.fillStyle = '#220';
    context.fillRect(528, 8, 22, 22);
    context.drawImage(gameImage, 530,10,18,18)
    context.strokeStyle = 'white';
    context.strokeRect(528, 7, 24, 24);
    context.fillStyle = 'white';
    context.font = `11px 'Courier New Bold'`;
    context.textAlign = 'center';
    context.fillText(`${player.name}`, 590, 25);
    context.drawImage(gameImage, player.x,player.y,20,20)
    if (allPlayers){
      for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].id !== player.id){
      const otherPlayer = allPlayers[i];
      const otherGameImage = new Image(40,40);
      otherGameImage.src = 'public/images/' + colors[otherPlayer.color];
      context.drawImage(otherGameImage, otherPlayer.x,otherPlayer.y,20,20)
      if (i === 0){
      context.clearRect(527, 33, 24, 24);
      context.fillStyle = '#220';
      context.fillRect(528, 34, 22, 22);
      context.drawImage(otherGameImage, 530,36,18,18)
      context.strokeStyle = 'white';
      context.strokeRect(528, 33, 24, 24);
      context.fillStyle = 'white';
      context.font = `11px 'Courier New Bold'`;
      context.textAlign = 'center';
      context.fillText(`${otherPlayer.name}`, 590, 51);
      }
      if (i === 1){
      context.clearRect(427, 7, 24, 24);
      context.fillStyle = '#220';
      context.fillRect(428, 8, 22, 22);
      context.drawImage(otherGameImage, 430,10,18,18)
      context.strokeStyle = 'white';
      context.strokeRect(427, 7, 24, 24);
      context.fillStyle = 'white';
      context.font = `11px 'Courier New Bold'`;
      context.textAlign = 'center';
      context.fillText(`${otherPlayer.name}`, 490, 25);
      }
      if (i === 2 || i === 3){
      context.clearRect(427, 33, 24, 24);
      context.fillStyle = '#220';
      context.fillRect(428, 34, 22, 22);
      context.drawImage(otherGameImage, 430,36,18,18)
      context.strokeStyle = 'white';
      context.strokeRect(427, 33, 24, 24);
      context.fillStyle = 'white';
      context.font = `11px 'Courier New Bold'`;
      context.textAlign = 'center';
      context.fillText(`${otherPlayer.name}`, 490, 51);
      }
      
    }
      }
      
    }
  for (let i =0; i < fires.length;i++) {
    context.fillStyle = 'white';
    context.fillRect(fires[i].x,fires[i].y,fires[i].w, fires[i].h)
  
  }
    
  for (let i =0; i < otherFires.length;i++) {
    context.fillStyle = 'white';
    context.fillRect(otherFires[i].x,otherFires[i].y,otherFires[i].w, otherFires[i].h)
  
  }

  for (let i =0; i < rocks.length;i++) {
    context.fillStyle = 'white';
    context.fillRect(rocks[i].x,rocks[i].y,rocks[i].w, rocks[i].h);
  
  }

}

window.requestAnimationFrame(main);


});



