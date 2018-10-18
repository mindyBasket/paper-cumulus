import Helper from "./../Helper"
const h = new Helper();


class XhrHandler {

	getCSRFToken(formId){
        // This function require django rendered form in the template
        const possibleForms = ["#scene_create_form", "#strip_create_form", "#frame_create_form"];


        let $form = null;
        if (formId === undefined){
       
        	let grabbed;
        	for (let i=0; i<possibleForms.length;i++){
        		grabbed = document.querySelector(possibleForms[i]);
        		if (grabbed != null){
        			$form = grabbed;
        			break;
        		}

        	}

        	if ($form == null){
        		console.error("Cannot find any form to grab CSRFToken!");
        		return false;
        	}
        	
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

		if (csrfToken === undefined){
			csrfToken = this.getCSRFToken();
		}
		
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

	createScene(chapterId, formData, csrfToken){
		return this.makeXHR('post', formData, `/api/chapter/${chapterId}/scene/create/`, csrfToken);
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
	            return response;
	        })
	        .catch(error => {
	        	console.log(error);
	        	// TODO: add better error message that is visible on frontend
	        })
	    )
	}

	destoryFrame(frameId, csrfToken){
		console.log("[Internal] CSRF token grabbed for FrameDelete: " + this.getCSRFToken());

		return (
			axios({
	            method: 'delete',
	            url: `/api/frame/${frameId}/`,
	            headers: {"X-CSRFToken": csrfToken}
	        })
	        .then(response => {
	            return response;
	        })
	        .catch(error => {
	        	console.log(error);
	        	// TODO: add better error message that is visible on frontend
	        })
	    )
	}

	destroyStrip(stripId, csrfToken){
		return this.makeXHR('delete', null, `/api/strip/${stripId}/`, csrfToken);
	}



	// Attempt at generic
	makeXHR(method, data, endpoint, csrfToken){

		// TODO: investigate why using this.getCSRFToken gets 403 error
		// if (csrfToken === undefined) {const csrfToken = this.getCSRFToken();}

		return (
			axios({
	            method: method,
	            url: endpoint,
	            data: data,
	            headers: {"X-CSRFToken": csrfToken}
	        })
	        .then(response => {
	            return response;
	        })
	        .catch(error => {
	        	console.log(error);
	        	// TODO: add better error message that is visible on frontend
	        	return false;
	        })
	    )

	}



}


export default XhrHandler;