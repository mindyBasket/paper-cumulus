class Constants {
  MEDIA_IMAGES_URL = 'media/frame_images/';

  T_STEP = 400; // ms

  MAX_IMAGE_SIZE = 3145728 // bytes (3 mb)

  // Opera
  static isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  static isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  static isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

  // Internet Explorer 6-11
  static isIE = /* @cc_on!@ */false || !!document.documentMode;

  // Edge 20+
  // static isEdge = !this.isIE && !!window.StyleMedia;
  // TODO: the above returns error...
  static isEdge = false;

  // Chrome 1+
  static isChrome = !!window.chrome && !!window.chrome.webstore;

  // Blink engine detection
  // static isBlink = (this.isChrome || this.isOpera) && !!window.CSS;

  // Browser detection
  // ref: https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
  BROWSER = {
    isOpera: this.isOpera,
    isFirefox: this.isFirefox,
    isSafari: this.isSafari,
    isIE: this.isIE,
    isEdge: this.isEdge,
    isChrome: this.isChrome,
    // isBlink: this.isBlink,
  }
}

export default Constants;
