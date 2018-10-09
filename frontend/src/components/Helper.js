"use strict"; 

class Helper {


	getRandomStr(len){
		return (Math.random() + 1).toString(36).substring(len);
	}
	

	serializeForm($form){
        //make sure it's a form
        if ($form.nodeName != 'FORM'){return false}

        // iterate through each element
        // inputArray
        const ia = $form.querySelectorAll('input, select, textarea, file');
        var formData = {};

        for (var i=0;i<ia.length;i++){
        	formData[ia[i].getAttribute('name')] = ia[i].value;
        }
        
        return formData;
    }
}

export default Helper;