
// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ ███████╗
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔════╝
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝███████╗
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║███████║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝
                                                        


function getCSRFToken(){
    // This function require django rendered form in the template

    const $form = document.querySelector('#demo_chapter_create_form');
    if ($form == null){
        console.error("Cannot find any form to grab CSRFToken!");
        return false;
    }

    return $form.querySelector("input[name='csrfmiddlewaretoken']").value;
}


function showMessage(domId){
    document.querySelectorAll(".hideable_content").forEach((msgBox)=>{
        msgBox.setAttribute("style", "display: none");
    });

    const $targetMessage = document.querySelector(domId);
    if($targetMessage){
        $targetMessage.setAttribute("style","display: inline-block");
    }


}
                                                 
function displayErrorMessage(msg){
    const $errorMsg = document.querySelector("#msg_error");
    if ($errorMsg){
        showMessage("#msg_error");
        $errorMsg.querySelector("#msg").textContent = msg;
    }
}






// ███╗   ███╗███████╗███████╗███████╗ █████╗  ██████╗ ███████╗███████╗
// ████╗ ████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝ ██╔════╝██╔════╝
// ██╔████╔██║█████╗  ███████╗███████╗███████║██║  ███╗█████╗  ███████╗
// ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║██╔══██║██║   ██║██╔══╝  ╚════██║
// ██║ ╚═╝ ██║███████╗███████║███████║██║  ██║╚██████╔╝███████╗███████║
// ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝

// Check localstorage
if (window.localStorage){
    console.warn("Local storage exists");

    // check if there has been a demo object
    stor = window.localStorage;

    const demoChapterId = stor.getItem("demoChapterId");
    if (demoChapterId){
        // Demo Chapter Exists
        showMessage("#msg_returning");

        const $returnToDemo = document.querySelector("#return_to_demo");
        if($returnToDemo){
            $returnToDemo.onclick=(e)=>{
                const demoChapterId = stor.getItem("demoChapterId");
                if (demoChapterId){
                    // make url
                    const demoChapterUrl =  `/flipbooks/chapter/${demoChapterId}/`;
                    window.location.href = demoChapterUrl;
                }

            }
        }


    } else {
        // No demo chapter exists, let user create new one
        showMessage("#msg_new");

        // Bind startDemo button 
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
                            const demoChapterId = res.data.hasOwnProperty('demoChapterId') ? res.data['demoChapterId'] : false;
                            if (demoChapterId && demoChapterId.length == 8){
                                // store chapter info before locating you there
                                stor.setItem("demoChapterId", demoChapterId);
                                window.location.href = res.data.url;
                            } else {
                                displayErrorMessage("Cloned demo chapter was a mutant!");
                            }
                            
                        } else {
                            displayErrorMessage("Could not complete the cloning process!");
                        }
                    })
                    .catch(error => {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                        displayErrorMessage("Something went wrong communicating with the server!");
                    });
                }

                // display loader
                $startDemo.setAttribute("style", "display:none;");
                document.querySelector("#loading_msg").className="active";

            }
        }



    }

} else {
    console.warn("NO LOCAL STORAGE");
}