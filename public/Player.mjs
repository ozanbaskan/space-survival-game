class Player {
  constructor({id, name}) {
    this.x = (Math.random() * 600) + 20;
    this.y = (Math.random() * 600) + 20;
    this.w = 10;
    this.h = 10;
    this.score = 0;
    this.id = id;
    this.speed = 5;
    this.fireSpeed = 8;
    this.destroy = false;
    this.color = 0;
    this.name = name;
  }

  movePlayer(dir, speed) {
    if (dir.includes('right')){
      this.x += speed
    }
    if (dir.includes('left')){
      this.x -= speed
    }
    if (dir.includes('up')){
      this.y -= speed
    }
    if (dir.includes('down')){
      this.y += speed
    }
  }

  collision(speed) {
    if (this.x > 610){
      this.x -= speed;
    }
    if (this.x < 10){
      this.x += speed;
    }
    if (this.y > 610){
      this.y -= speed
    }
    if (this.y < 60){
      this.y += speed
    }
  }

  

}




export default Player;
