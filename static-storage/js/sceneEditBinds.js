/* global $ */
/* global jQuery */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable




// Project specific libraries
// window.flipbookLib

/*-----------------------------------------------------
----------------------- MAIN  -------------------------
-------------------------------------------------------*/

// init components
var _popupMenu = new PopupMenu(null); /* global PopupMenu */
var $lbCover = new LightBox(); /* global LightBox*/
var _spinnyObj = new Spinny(); /* global Spinny*/
var _acHandler = new AJAXCRUDHandler($lbCover, _spinnyObj); /* global AJAXCRUDHandler */

$(function() { 

    console.log("sceneEditBinds.js ---------- * v0.6.5");
    
    // "+frame" button appends frame create form
    // TODO: remove this form, and make one-click-submit
    bind_frameCreateFormButton($(document));
    
    // Initialize popup menu partial
    bind_popupMenu_elems($(document).find(".popup_menu.edit").eq(0));
    _acHandler.popupMenu = _popupMenu; //add reference to the popupmenu
    
    // Bind features on frame/thumbnail container
    bind_features_onFrameContainer();

    // popup menu for strip 
    bind_openPMenu_strip($(document));
    
    // drag and drop events
    bind_dragAndDrop($(document), '.strip_flex_container');
   
    

    //------------------------------------
    // Form submit
    //------------------------------------
    
    //......................
    // on strip_form submit
    //.......................
    var scenePk = $('#strip_create_form').find('select#id_scene').val();
    
    
    $('#strip_create_form').submit(function(event){
        
        // disable default form action
        event.preventDefault();
        
        var createStripResp = window.flipbookLib.submitFormAjaxly(
            $(this), 
            '/api/scene/'+scenePk+'/strip/create/', 
            {'method': 'POST'},
            );
            
        createStripResp.success(function(data){
            
            console.log("CREATED: Successfully created a new strip [id=" + data.id + "]");
            /////// RENDER ///////
            renderStripContainer(data);
            //////////////////////
            
            // I decided to leave the strip_id field in frame_create_form as select.
            // So I have to add new option after a Strip is created.
            var $frameCreateForm = $(document).find("#frame_create_form").eq(0); //the one and only
            $frameCreateForm.find("#id_strip").append($('<option>', {
                value: data.id,
                text: 'ajaxly created strip #' + data.id
            }));
        });
   
    });
    
  
 
    //......................
    // on frame_form submit
    //.......................
    $('#frame_create_form').submit(function(event){
        // disable default form action
        event.preventDefault();
        var $frameForm = $(this);
        var stripPk = $(this).parent().attr("stripid");

        //ajax call
        var frameCreateResp = window.flipbookLib.submitFormAjaxly(
            $(this),
            '/api/strip/'+stripPk+'/frame/create/',
            {'method': 'POST',
             'processData': false,
             'contentType': false
            });
        frameCreateResp.success(function(data){
            
            console.log("sucessfully created frame");
            //Hide the form and return add button
            $frameForm.hide();
            $('.frame_form').show();
            
            /////// RENDER ///////
            renderFrameContainer(data, stripPk);
            //////////////////////
        });                

    });
    
      
    //------------------------------------
    // on frame delete 
    //------------------------------------
    
    // Because this isn't rendered into the template, this will have to be 
    // binded upon append. Delete button/link is appended at bind_miniMenu().
    
    // See section 'd' at bind_popupMenu_elems()
    
    //......................
    // on frame_update submit
    //.......................  
    
    // Another one that is rendered by partial through ajax request.
    
    // See section 'b' at bind_popupMenu_elems()
    
    
});




/*-----------------------------------------------------------------
----------------------- binding functions -------------------------
-------------------------------------------------------------------*/

// ................................................
// Button for opening frame create form in a desginated strip container
// ................................................
function bind_frameCreateFormButton($doc, $targetOptional){
   
    var $target = $targetOptional
    
    if ($target == null){
        //do for all mini menus if target not specified
        $target = $doc.find('.strip_flex_container .frame_form');
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot bind mini menu even to non-Jquery object.");
        return false;
    }
    
    $target.click(function(){
        
        // Hide only the current form request button
        $doc.find('.frame_form').show(); //show all
        var $formRequestBtn_ = $(this);
        $formRequestBtn_.hide(); //hide this
        
        var stripid = $formRequestBtn_.attr("for");
        
        // Form is already appended into the page. Move it around to 
        // the appropriate strip container
        var currStripContainer = $('.strip_flex_container[stripid='+stripid+']');
        var targetForm = $doc.find("#frame_create_form").eq(0); //the one and only
        targetForm.hide();
        targetForm.appendTo(currStripContainer);
        targetForm.slideToggle();
        
        //auto-fill the form
        console.log("curr strip id: " + stripid);
        targetForm.find('#id_strip').val(String(stripid));
        console.log("changing field val: " + targetForm.find('#id_strip').val());
    });
    

}





// ┌─┐┌─┐┌─┐┬ ┬┌─┐  ┌─┐┌─┐┬─┐  ┌─┐┬─┐┌─┐┌┬┐┌─┐
// ├─┘│ │├─┘│ │├─┘  ├┤ │ │├┬┘  ├┤ ├┬┘├─┤│││├┤ 
// ┴  └─┘┴  └─┘┴    └  └─┘┴└─  └  ┴└─┴ ┴┴ ┴└─┘

function bind_popupMenu_elems($popupMenu){
    
    // ............................
    // a. Bind 'EDIT' action 
    // ............................
    // currently already on overlay menu. redundent?
       
    //............................
    // b. Bind 'MAKE COVER' 
    //
    // TODO: makes current frame as the "cover" for the Scene.
    //............................
    
    //.........................
    // c. Bind 'DELETE' action 
    //.........................
     $popupMenu.find('.action.delete').click(function(){
         _acHandler.ajaxFrameDeleteConfirm($popupMenu.attr("for"));
     });
}


/* HELPER */
/* This function crawls up hiearchy until its parent's name is 
   specified in argument classname */
function crawlOutUntilClassname($start, classname){
    
    var $nextParent = $start.parent();
    
    while ($nextParent.is('body') != true){
        if ($nextParent.attr("class") == classname || $nextParent.attr("class").indexOf(classname) !== -1){
            return $nextParent;
        } else {
            $nextParent = $nextParent.parent();}
    }
    return false;
} //end: crawlOutUntilClassname


/* HELPER */
/* Pass container with features, and selector describing element 
    in the container to bind. Returns the object ready to be binded. 
    Returns false if it could not find the object using the selector. 
    
    Can pass nothing for $targetContainer. It will assume $(document) */
function getValidTarget($targetContainer, targetSelector){

    $targetContainer = $targetContainer ? $targetContainer : $(document);

    if ($targetContainer instanceof jQuery == false){
        console.error("Bind target is not Jquery object.");
        return false;
    } else {
        var $target = $targetContainer.find(targetSelector);
        if ($target.length > 0){return $target;}
        else { 
            console.error("Could not find target in " + $targetContainer.attr("class"));
            return false; 
        } 
    }
        
}


/*  If isMultiTarget = true, it means it will bind to ALL .thumb under the container.
    use isMultiTarget = false, if the container itself is a specific .thumb */  
function bind_features_onFrameContainer($targetContainer, isMultiTarget){
    
    isMultiTarget = typeof(isMultiTarget) === 'boolean' ? isMultiTarget : isMultiTarget || true;
    var t = isMultiTarget;
    var targetArr = ['a.frame_edit', 'a.frame_delete', 'a.frame_options'];
    
    
    //Bind "edit"
    bind_openFrameEdit($targetContainer, (t ? ".thumb" : "")  + ' a.frame_edit');
    //Bind "delete"
    bind_frameDelete($targetContainer, (t ? ".thumb" : "") + ' a.frame_delete');
    //Bind "options" (popup menu)
    bind_openPMenu_frame($targetContainer, (t ? ".thumb" : "")  + ' a.frame_options'); 
    
}



function bind_openFrameEdit($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector);
    if (!$target) { return; }
    
    $target.click(function(event){
        
        event.preventDefault();
        _acHandler.ajax_frame_edit($(this).parent().attr("frameid"));
    });
}


function bind_frameDelete($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector);
    if (!$target) { return; }
    
    $target.click(function(event){
        
        event.preventDefault();
        _acHandler.ajaxFrameDeleteConfirm($(this).parent().attr("frameid"));
    });
}

function bind_openPMenu_frame($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector);
    if (!$target) { return; }
   
    $target.click(function(event){
        
        event.preventDefault();
        // append to thumbnail base [div with ".thumb" class]
        var $parentThumb = crawlOutUntilClassname($(this), "thumb");
        if ($parentThumb) {
            _popupMenu.popupAt($parentThumb);
        } else {
            console.log("Cannot find the thumbnail element in list of parents.");
            return;
        }
        
    });
    
} // end: bind_openPMenu_frame()

//  _______  _______  ______    ___   _______    
// |       ||       ||    _ |  |   | |       |   
// |  _____||_     _||   | ||  |   | |    _  |   
// | |_____   |   |  |   |_||_ |   | |   |_| |   
// |_____  |  |   |  |    __  ||   | |    ___|   
//  _____| |  |   |  |   |  | ||   | |   |       
// |_______|  |___|  |___|  |_||___| |___|       

// ................................................
// bind link that opens popup menu for strip
//
// This function assumes popup menu is included in the document. 
// Currently done by including the snippet as a partial. Find it in
// flipbooks/partials/popup_menu_strip_partial.html
// ................................................

function bind_openPMenu_strip($doc, $targetOptional){
    var $target = $targetOptional
    
    if ($target == null){
        //do for all mini menus if target not specified
        $target = $doc.find('.menu_strip');
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot bind mini menu even to non-Jquery object.");
        return false;
    }
    
    // ...............
    // open mini menu
    // ...............
    var $popupMenu = $doc.find(".pmenu_strip").eq(0);
    
    $target.click(function(event){
        event.preventDefault();
        
        // Grab partial and append to the current thumb location
        $popupMenu.appendTo($(this));
        $popupMenu.show();
        
        // Update tag information about current object
        var obj_id = $(this).parent().attr("stripid");
        $popupMenu.attr("for", obj_id);
        $popupMenu.children(".header").children("span").text(obj_id);
        
        // This allows popupMenu to disappear when you click else where
        $popupMenu.focus();
        
    });
    
    
    // ...............
    // click events within the menu 
    // ...............
    
    //.........................
    // _. Bind Strip 'DELETE' action 
    //.........................
    $popupMenu.find('.action.delete').click(function(){
        event.preventDefault();
        
        // Retrieve frame information
        var stripId = $popupMenu.attr("for");
        if (stripId=="-1"){return;} //STOP, if frameid is not set.
        
        // DELETE happens in 2 parts.
        // First is GET, and then POST. To see POST delete
        
        var deleteResponce = window.flipbookLib.getJSONPartial(
            '/flipbooks/strip/'+ stripId +'/delete/', 
            'GET', 
            'json',
            function(){
                console.log("DELETE CONFIRM");
                $popupMenu.focusout()});
        
        deleteResponce.success(function(data){
            
            //////////////////////
            /////// RENDER ///////
            console.log("display confirm delete for strip");
            renderStripDeleteConfirm(data, stripId, {'popupMenu': $popupMenu});
            /////////////////////
        });
        
    }); //end: bind 'delete'
    
}






/*-----------------------------------------------------------------
---------------------- rendering functions ------------------------
-------------------------------------------------------------------*/


// Uses json_partial view to load html template for a strip container
function renderStripContainer(data){
    
    var stripObj = data
    var $stripList = $('ul.list_strips');
    
    var responce = window.flipbookLib.getJSONPartial(
        '/flipbooks/json_partials/strip_container/'+stripObj.id,
    );
    responce.success(function(data_partial){
        var $newStripContainer = $(data_partial['html_template']);
        $newStripContainer.appendTo($stripList);
        
        $newStripContainer.hide();
        $newStripContainer.slideToggle( "slow" );
        
        // Bind Button Events
        bind_frameCreateFormButton($(document), $newStripContainer.find('.frame_form'));
    });
    
}



function renderFrameContainer(data, stripId){
    
    var frameObj = data;
    
    //Get new container
    var thumbResp = window.flipbookLib.getJSONPartial(
        '/flipbooks/json_partials/frame_container/'+frameObj.id,
    );
    thumbResp.success(function(data_partial){
        var $newFrameContainer = $(data_partial['html_template']);
        var targetStripContainer = $('.strip_flex_container[stripid='+stripId+']');
            
            $newFrameContainer.insertBefore(targetStripContainer.find('.frame_form'));
            $newFrameContainer.hide();
            $newFrameContainer.slideToggle( "fast" );
            
            //bind features
            bind_features_onFrameContainer($newFrameContainer, false);
    });

}





function renderDeleteFrameConfirm(data, frameId, args){
    
    // Make a new popup with same style as original popupmenu
    var $popupMenu = args['popupMenu'];
    var _popupDeleteMenu = new PopupMenu($popupMenu, 1);
    
    // Fill out popup
    _popupDeleteMenu.cleanContent();
    _popupDeleteMenu.appendContent($("<p>" +data['html_form'] + "</p>"));
    
    //Register object that will be lit when lights out
    var $targetThumbnail = $(document).find(".thumb[frameid="+frameId+"]");
    _popupDeleteMenu.relatedElement.push($targetThumbnail.children(".frame_image.stretch"));

    // ++++++ lights out ++++++
    _popupDeleteMenu._lightBox = $lbCover;
    _popupDeleteMenu.popupAt($targetThumbnail);
    // ++++++++++++++++++++++++
    
    $lbCover.setClickEventFunc(function(){
        _popupDeleteMenu.$menu.find('#delete-cancel-button').click();
    });

    // Bind "confirm" button
    _popupDeleteMenu.$menu.find('#delete-confirm-button').click(function(event){
        event.preventDefault();
        _popupDeleteMenu.$menu.find('#delete-cancel-button').click(); //close immediately
        var $deleteForm = _popupDeleteMenu.$menu.find('#delete-confirm');
        
        /////////////////////
        _acHandler.ajaxFrameDelete($deleteForm, frameId);
        /////////////////////
        
    });
    
    // Bind "cancel" button
    _popupDeleteMenu.$menu.find('#delete-cancel-button').click(function(event){
        _popupDeleteMenu.removePopup(); 
    });
        
}



// Function used to fillout delete confirm form, in the response data
// from an ajax call to delete url. 
// This function currently used for Strip.
function addDeleteConfirmForm(data, $popup, $targetOptional){
    
    var $target = $targetOptional;
    if ($target == null){
        // Select whole content of $popup
        $target=$popup;
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot append delete form to a non-Jquery object.");
        return false;
    }

    $target.append($("<p>" +data['html_form'] + "</p>"));
}


function renderStripDeleteConfirm(data, stripId, args){
    
    var $popupMenu = args['popupMenu'];
    var $popupDelete = $popupMenu.clone().appendTo($popupMenu.parent()); //This might be slow
    
    $popupDelete.children('.content').html(''); //clear unnecessary cloned content
    
    // Change click event to LightBox so that it closes Strip Delete Confirm form
    $lbCover.setClickEventFunc(function(){
        $popupDelete.find('#delete-cancel-button').click();
    });
    
    $lbCover.turnOn();
    
    //make objects to appear above lightbox
    $popupDelete.attr('style','z-index:1000');
    //$popupMenu.parent().attr('style','z-index:1000');
    
    // TODO:
    // I don't think this benefits from being a function
    addDeleteConfirmForm(data, $popupDelete, $popupDelete.children('.content'));
    

    // Bind "confirm" button
    $popupDelete.find('#delete-confirm-button').click(function(event){
        // Note: #delete-confirm-button is a <a> that acts
        //       like a submit() for the form  #delete-confirm.
        event.preventDefault();
        $popupDelete.find('#delete-cancel-button').click(); //clean up
        var $deleteForm = $popupDelete.find('#delete-confirm');
        
        //>>>>>>>>>>>>>>>>>>>>
        //>>>>>> SUBMIT >>>>>>
        //ajax_strip_delete($deleteForm, stripId);
        var deleteStripResp = window.flipbookLib.submitFormAjaxly(
            $deleteForm,
            '/flipbooks/strip/'+ stripId +'/delete/',
            {'method': 'POST'},
            function(){console.log("Attempt Ajax delete strip");});
        deleteStripResp.success(function(data){
            
            /////// RENDER ///////
            //show animation of deletion
            $(document).find('.flex_list[stripid='+ stripId +']').animate({
                opacity: 0,
            }, 300, function() {
                // Problem: if you delete this, you are removing everything 
                //          in it with it, like popup menu. ],: 
                // Rescue the popup menu
                $(this).find(".pmenu_strip").eq(0).appendTo('body');
                $(this).remove(); //actually delete
            });
            //////////////////////
        });
        //>>>>>>>>>>>>>>>>>>>>
        
    });
    
    // Bind "cancel" button
    $popupDelete.find('#delete-cancel-button').click(function(event){
        //clean up
        $popupDelete.remove();
        $lbCover.turnOff(); //don't forget the lightbox cover
    });
        
}








function bind_dragAndDrop($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector);
    if (!$target) { return; }

    $target.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
    .on('dragover dragenter', function() {
        $(this).addClass('is-dragover');
    })
    .on('dragleave dragend drop', function() {
        $(this).removeClass('is-dragover');
    })
    .on('drop', function(e) {
        var droppedFiles = e.originalEvent.dataTransfer.files;
        var containerObj = crawlOutUntilClassname($(this), "flex_list");
        var stripId = containerObj ? containerObj.attr("stripid") : "?"
        var $form = $(document).find("#frame_create_form");
        
        containerObj.find(".frame_form").click();
        
        // manually append file information
        var formData = new FormData($form[0]);
        console.log(droppedFiles[0]);
        formData.append("frame_image", droppedFiles[0]);
        
         var frameCreateResp = window.flipbookLib.submitFormAjaxly(
            formData,
            '/api/strip/'+stripId+'/frame/create/',
            {'method': 'POST',
             'processData': false,
             'contentType': false
            });
        frameCreateResp.success(function(data){
            console.log("sucessfully created frame");
            //Hide the form and return add button
            $form.hide();
            $('.frame_form').show();
            
            /////// RENDER ///////
            renderFrameContainer(data, stripId);
            //////////////////////
        });
        
    });
}
