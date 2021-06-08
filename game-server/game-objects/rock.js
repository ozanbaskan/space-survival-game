class Rock {
  constructor(hardcore){
    this.x = (Math.random() * 585) + 15;
    this.y = (Math.random() * 20) + 55;
    this.w = (Math.random() * 5) + 10;
    this.h = (Math.random() * 5) + 15;
    this.destroyValue = false;
    this.hardcore = hardcore
  }

  destroy(fires){
    let fireArray = [];

    for (const array in fires){
      fireArray = fireArray.concat(fires[array])
  }
  for (let i = 0; i < fireArray.length;i++) {
    if (((fireArray[i].x >= this.x - 5) && fireArray[i].x <= (this.x + this.w + 5)) && ((fireArray[i].y <= this.y + this.h && fireArray[i].y >= this.y))) {
      this.destroyValue = true;
    }
        
  }  
  }

  move(speed) {
    this.y += speed;
    if (this.hardcore) {
      let rightOrLeft = Math.floor(Math.random() * 2)
      if (rightOrLeft){
        this.x += speed;
      } else {
        this.x -= speed;
      }
      if (this.x > 600){
      this.x -= speed;
    }
    if (this.x < 20){
      this.x += speed;
    }}
  }

  
}

module.exports = Rock