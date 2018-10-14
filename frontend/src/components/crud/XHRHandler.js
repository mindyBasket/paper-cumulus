import Helper from "./../Helper"
const h = new Helper();


class XhrHandler {

	getCSRFToken(formId){

        // This function require django rendered form in the template
        let $form;
        if (formId === undefined){
        	$form = document.querySelector("#strip_create_form");
        } else {
        	$form = document.querySelector(formId);
        }
        
        const formData = h.serializeForm($form);
        const csrfToken = formData ? (formData.hasOwnProperty("csrfmiddlewaretoken") ? formData.csrfmiddlewaretoken : null) : null;

        return csrfToken;
    }
	

	fetchScene(sceneId){
		return (
			axios({
	            method: 'get',
	            url: `/api/scene/${sceneId}/`,
	        })
	        .then(response => {
	            console.log("[Scene fetch successful]");
	            //thisObj.setState({data: response.data});
	            //this.firstLoad = false;
	            return response;
	        })
	        .catch(error => {
	        	console.log(error);
	        })
	    )
	}



	createStrip(sceneId, formData, csrfToken){
		return (
			axios({
	            method: 'post',
	            url: `/api/scene/${sceneId}/strip/create/`,
	            data: formData,
	            headers: {"X-CSRFToken": csrfToken}
	        })
	        .then(response => {
	            console.log("[New Strip created]");
	            //thisObj.setState({data: response.data});
	            //this.firstLoad = false;
	            return response;
	        })
	        .catch(error => {
	        	console.log(error);
	        })
	    )
	}


	editFrame(frameId, formData, csrfToken){
		return (
			axios({
	            method: 'patch',
	            url: `/api/frame/${frameId}/update/`,
	            data: formData,
	            headers: {"X-CSRFToken": csrfToken}
	        })
	        .then(response => {
	            console.log("[New Strip created]");
	            //thisObj.setState({data: response.data});
	            //this.firstLoad = false;
	            return response;
	        })
	        .catch(error => {
	        	console.log(error);
	        })
	    )
	}

	
}


export default XhrHandler;