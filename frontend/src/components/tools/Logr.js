function MissingNameSpace(message) {
  this.message = message;
  this.name = 'MissingNameSpace';
}


class Logr {
  constructor(nameSpace) {
    if (window.console) {
      if (!nameSpace || nameSpace === undefined) {
        throw new MissingNameSpace('Name space not provided for logger.');
      } else {
        this.nameSpace = nameSpace;
      }
    } 
  }

  log(msg) {
    // Adding this for now because it is too easy to make mistake using log()
    console.log(`[${this.nameSpace}] ${msg}`);
  }

  info(msg) {
    console.log(`[${this.nameSpace}] ${msg}`);
  }

  warn(msg) {
    console.warn(`[${this.nameSpace}] ${msg}`);
  }

  error(msg) {
    console.error(`[${this.nameSpace}] ${msg}`);
  }

}

export default Logr;
