const $startDemo = document.querySelector('#make_demo');
if($startDemo){
	$startDemo.onclick  = (e) =>{
		console.log("[Create Demo!]");

		axios({
            method: 'get',
            url: `/api/scene/1/`,
        })
        .then(response => {
            console.log("[Scene fetch successful]");
            console.log(response.data);
            //thisObj.setState({data: response.data});
            //this.firstLoad = false;
            return response;
        })
        .catch(error => {
        	console.log(error);
        });


	}
}
