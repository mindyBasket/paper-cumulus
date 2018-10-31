

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
	$startDemo.onclick = (e) =>{

        // grab CSRF token
        const csrfToken = getCSRFToken();

        if (csrfToken){
            axios({
                method: 'post', // should be POST?
                data: null,
                url: '/flipbooks/demo_chapter/create/',
                headers: {"X-CSRFToken": csrfToken}
            })
            .then(res => {
   
                if (res.data && res.data.hasOwnProperty('url') && res.data.url ) {
                    window.location.href = res.data.url;
                } else {
                    console.error("Something went wrong while cloning a demo chapter. ): ");
                }
            })
            .catch(error => {
                console.log(error);
            });
        }

        // display loader
        $startDemo.setAttribute("style", "display:none;");
        document.querySelector("#loading_msg").className="active";


		


	}
}
