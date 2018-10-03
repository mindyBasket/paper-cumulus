"use strict"; 

class Helper {


	getRandomStr(len){
		return (Math.random() + 1).toString(36).substring(len);
	}
	
}

export default Helper;