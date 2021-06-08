
class Fire {
  constructor({x, y, owner, id}){
    this.x = x;
    this.y = y;
    this.w = 3;
    this.h = 6;
    this.owner = owner;
    this.id = id;
    this.destroy = false
  }

  moveFire(speed) {
    this.y -= speed;
  }

}


export default Fire;