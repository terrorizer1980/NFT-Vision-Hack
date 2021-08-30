class MomentClass {
    constructor(id, team, name, price, serialNumber) {
      this._id = id
      this.team = team
      this.name = name
      this.price = price || 0
      this.serialNumber = serialNumber || 0
    }
  
    get type() {
      return "Moment"
    }
  
    get id() {
      return `Moment${this._id}`;
    } 
  
    get image() {
      return `${process.env.PUBLIC_URL}/assets/${this.id}.png`
    }
  }
  
  export default MomentClass