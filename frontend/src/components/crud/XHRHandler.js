"use strict"; 

class XhrHandler {

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
	
}


export default XhrHandler;