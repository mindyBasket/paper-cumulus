

function getCSRFToken(){
    // This function require django rendered form in the template

    const $form = document.querySelector('#demo_chapter_create_form');
    if ($form == null){
        console.error("Cannot find any form to grab CSRFToken!");
        return false;
    }

    return $form.querySelector("input[name='csrfmiddlewaretoken']").value;
}



const $startDemo = document.querySelector('#make_demo');


if($startDemo){
	$startDemo.onclick  = (e) =>{
		console.log("[Create Demo!]");

        // grab CSRF token
        const csrfToken = getCSRFToken();

        if (csrfToken){
            axios({
                method: 'get', // should be POST?
                url: `/flipbooks/demo_chapter/create/`,
            })
            .then(res => {
                console.log("[Copy Demo Chapter]");
                if (!res || !res.data){
                	console.error("No valid response ):");
                }

                // redirect to the newly created chapter

            })
            .catch(error => {
                console.log(error);
            });
        }

		


	}
}
