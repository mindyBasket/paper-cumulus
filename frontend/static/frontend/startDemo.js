
const EXPIRE_TIME = 3 // days

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

function bind_makeNewDemo(){

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
                            stor.setItem("demoTimestamp", res.data.timestamp);
                            window.location.href = res.data.url;
                        } else {
                            displayErrorMessage("Cloned demo chapter was a mutant!");
                        }
                        
                    } else {
                        displayErrorMessage("Could not complete the cloning process!");
                    }
                })
                .catch(error => {
                    if(error.response){
                        // console.log(error.response.data);
                        // console.log(error.response.status);
                        // console.log(error.response.headers);
                        displayErrorMessage("Something went wrong on server side!")
                    } else {
                        displayErrorMessage("Response from the server was a mutant!");
                    }
                });
            }

            // display loader
            $startDemo.setAttribute("style", "display:none;");
            document.querySelector("#loading_msg").className="active";

        }
    }
}






function timeSince(date) {

  const seconds = Math.floor((new Date() - date) / 1000.00);
  // console.log("starting with: " + seconds);

  let timeUnit = Math.floor(seconds / 31536000.00);
  if (timeUnit >= 1) {
    return timeUnit + " years";
  }

  timeUnit = Math.floor(seconds / 2592000.00);
  if (timeUnit >= 1) {
    return timeUnit + " months";
  }

  timeUnit = Math.floor(seconds / 86400.00);
  if (timeUnit >= 1) {
    const days = timeUnit;
    const remainder = seconds - 86400*timeUnit;
    let hours = Math.floor( remainder / 3600.00);
    return days + " days and " + hours + " hours"; 
  }

  timeUnit = Math.floor(seconds / 3600.00);
  if (timeUnit >= 1) {
    return timeUnit + " hours";
  }

  timeUnit = Math.floor(seconds / 60); 
  if (timeUnit >= 1) {
    return timeUnit + " minutes";
  }

  return Math.floor(seconds) + " seconds";
}


function isExpired(date){
    const seconds = Math.floor((new Date() - date) / 1000.00);
    const days = Math.floor(seconds / 86400.00);

    if (days >= EXPIRE_TIME){
        return true;
    } else {
        return false;
    }
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



function checkDemoObject(id64){

    fetch('/api/chapter/id64/'+id64+'/')
      .then(response => {
        if (response.status !== 200) {
          return false
        }

        return response.json();
      })
      .then(data => {
        
        if (data==false){
            // Remove existing message and allow user to create new chapter
            showMessage("#msg_new");

            const $msgNewContainer = document.querySelector("#msg_new");
            const $msg = $msgNewContainer.querySelector("#msg");
            
            $msg.textContent = `A demo you made ${timeago} ago expired. \nMake a new one that will be available for 3 days?`
            window.localStorage.clear();

            // Make button for creating new demo 
            bind_makeNewDemo();

        }
        
        
      });

}








// ███╗   ███╗███████╗███████╗███████╗ █████╗  ██████╗ ███████╗███████╗
// ████╗ ████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝ ██╔════╝██╔════╝
// ██╔████╔██║█████╗  ███████╗███████╗███████║██║  ███╗█████╗  ███████╗
// ██║╚██╔╝██║██╔══╝  ╚════██║╚════██║██╔══██║██║   ██║██╔══╝  ╚════██║
// ██║ ╚═╝ ██║███████╗███████║███████║██║  ██║╚██████╔╝███████╗███████║
// ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝

// Check localstorage
if (window.localStorage){

    // check if there has been a demo object
    stor = window.localStorage;

    const demoChapterId = stor.getItem("demoChapterId");
    // Note: month counts from 0 to 11!
    const pythonTimestamp = stor.getItem("demoTimestamp");
    const testDate = new Date(2018, 9, 29, 5, 30, 0, 0);
    var demoIsExpired = null;
    var timeago = null;
    if (pythonTimestamp != null){
        demoIsExpired = isExpired(pythonTimestamp*1000);
        timeago = timeSince(pythonTimestamp*1000);
    }


    // Case 1: Live demo chapter exists
    if (demoChapterId && demoIsExpired == false){

        // But wait! It COULD be expired! [Async]
        checkDemoObject(demoChapterId);

        // Demo Chapter Exists
        // put id and date
        const $msgReturningContainer = document.querySelector("#msg_returning");
        if($msgReturningContainer){

            const $msg = $msgReturningContainer.querySelector("#msg");
            const msgText = $msg.textContent;
            const msgVars = [timeago, demoChapterId];
            
            let counter = 0;
            let outputText = null;
            msgText.split("$$").forEach((txt)=>{
                if (!outputText){
                    outputText = txt;
                } else {
                    outputText += msgVars[counter] + txt;
                    counter++;
                }
            }); 
            $msg.textContent = outputText;

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
            displayErrorMessage("Something went wrong while rendering the page. Try refresh.")
        }


    } else { // Case 2: There is no demo chapter in record, or it expired

        showMessage("#msg_new");

        const $msgNewContainer = document.querySelector("#msg_new");
        const $msg = $msgNewContainer.querySelector("#msg");
        
        if (demoIsExpired){
            $msg.textContent = `A demo you made ${timeago} ago expired. \nMake a new one that will be available for 3 days?`
            window.localStorage.clear();
        }

        // Make button for creating new demo 
        bind_makeNewDemo();



    }

} else {
    console.warn("NO LOCAL STORAGE");
}


// for debug
const $testReset = document.querySelector("#testreset");
if ($testReset){
    $testReset.onclick=(e)=>{
        window.localStorage.clear();
    }
}
