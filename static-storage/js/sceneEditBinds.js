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
/* global PopupMenu */
var _popupMenu       = new PopupMenu(
                            $(document).find(".popup_menu.edit").eq(0),
                            "partial"); 
var _popupMenu_strip = new PopupMenu(
                            $(document).find(".pmenu_strip").eq(0),
                            "partial");
                            
var _lbCover = new LightBox(); /* global LightBox*/
var _spinnyObj = new Spinny(); /* global Spinny*/
var _acHandler = new AJAXCRUDHandler(_lbCover, _spinnyObj); /* global AJAXCRUDHandler */

// Have some constants
var CLASS_STRIPLI = ".flex_list";

$(function() { 

    console.log("sceneEditBinds.js ---------- * v0.6.5");
    
    // Initialize popup menu partial
    make_popupMenu_frame();
    make_popupMenu_strip();
    _acHandler.popupMenu       = _popupMenu; //add reference to the popupmenu
    _acHandler.popupMenu_strip = _popupMenu_strip;
    
    // Bind features on each containers
    bind_features_onFrameContainer();
    bind_features_onStripContainer();

    // one-click-submit
    //bind_frameCreateFormButton($(document));
    bind_frameCreateCondensed();
    
    
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

        event.preventDefault();
        
        // var $frameForm = $(this);
        var $strip = $(this).closest("*[stripid]");
        var stripId = $strip.attr("stripid");
    
        if (!stripId){
            console.log("Could not find stripid to submit frame form");
            return;
        }
        
        //exit lightbox 
        _lbCover.doClick();
        
        // ajax frame create
        _acHandler.ajax_frameCreate(stripId, {"formData": $(this)});

    });
    
});






//  _____ __   _ _____ _______                     
//   |   | \  |   |      |                        
//  __|__ |  \_| __|__    |                        
                                                
//   _____   _____   _____  _     _  _____  _______
//  |_____] |     | |_____] |     | |_____] |______
//  |       |_____| |       |_____| |       ______|

function make_popupMenu_frame(){
    
    var $pmenu = _popupMenu.$menu;
    
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
     $pmenu.find('.action.delete').click(function(){
         _acHandler.ajaxFrameDeleteConfirm($pmenu.attr("for"));
     });
}


function make_popupMenu_strip(){
   
    var $pmenu = _popupMenu_strip.$menu;
    //.........................
    // c. Bind 'DELETE' action 
    //.........................
    $pmenu.find('.action.delete').click(function(){
        _acHandler.ajax_strip_DeleteConfirm($pmenu.attr("for"));
    });
}
    

/* HELPER */
/* Pass container with features, and selector describing element 
    in the container to bind. Returns the object ready to be binded. 
    Returns false if it could not find the object using the selector. 
    
    Can pass nothing for $targetContainer. It will assume $(document) */
function getValidTarget($targetContainer, targetSelector, name){
    
    $targetContainer = $targetContainer ? $targetContainer : $(document);

    if ($targetContainer instanceof jQuery == false){
        console.error("Bind target is not Jquery object.");
        return false;
    } else 
    if (!targetSelector){
        console.error((name ? "["+name+"] " : "") + "You must provide targetSelector to getValidTarget()");
    } 
    else {
        var $target = $targetContainer.find(targetSelector);
        if ($target.length > 0){return $target;}
        else { 
            console.error((name ? "["+name+"] " : "") + "Could not find target in " + $targetContainer.attr("class") + ". Target container is " + $targetContainer.html());
            return false; 
        } 
    }
        
}




function bind_frameCreateCondensed(){
    
    var $frameForm = $(document).find('#frame_create_form').eq(0);
    var $fileInput = $frameForm.find('input#id_frame_image').eq(0);
    
    if ($frameForm.length <= 0 || $fileInput.length <=0){
        console.error("Could not find #frame_create_form, or the form does not have valid input.");
        return;
    }
    
    // TODO: move this somewhere more appropriate
    $frameForm.prop('accept', 'image/jpeg, image/jpg, image/png, image/gif');
    
        
    // simulate file input click
    $('.frame_create_form_condensed').each(function(){
        $(this).click(function(event){
            event.preventDefault();
            
            if ($frameForm.closest(CLASS_STRIPLI).attr("stripid") != $(this).closest(CLASS_STRIPLI).attr("stripid")){
                console.error("StripId of frame frame and current stripId does not match.");
                return;
            }
            
            $fileInput.click();
        });
    });
    
        
    
    // bind listener for input change
    $fileInput.change(function(event){
        //$frameForm.submit();
        console.warn("[Debugging] $frameForm submit action initated!");
    });
    
}




// http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Frame
//  _______  ______ _______ _______ _______
//  |______ |_____/ |_____| |  |  | |______
//  |       |    \_ |     | |  |  | |______
 
//  ______  _____ __   _ ______                                    
//  |_____]   |   | \  | |     \                                   
//  |_____] __|__ |  \_| |_____/                                   
                                                                
//  _______ _______ _______ _______ _     _  ______ _______ _______
//  |______ |______ |_____|    |    |     | |_____/ |______ |______
//  |       |______ |     |    |    |_____| |    \_ |______ ______|

/*  If isMultiTarget = true, it means it will bind to ALL .thumb under the container.
    use isMultiTarget = false, if the container itself is a specific .thumb */  
function bind_features_onFrameContainer($targetContainer, isMultiTarget){
    
    isMultiTarget = typeof(isMultiTarget) === 'boolean' ? isMultiTarget : isMultiTarget || true;
    var t = isMultiTarget;

    //Bind "edit"
    bind_openFrameEdit($targetContainer, (t ? ".thumb" : "")  + ' a.frame_edit');
    //Bind "delete"
    bind_frameDelete($targetContainer, (t ? ".thumb" : "") + ' a.frame_delete');
    //Bind "options" (popup menu)
    bind_openPMenu_frame($targetContainer, (t ? ".thumb" : "")  + ' a.frame_options'); 
    
}



function bind_openFrameEdit($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector, "frame edit");
    if (!$target) { return; }
    
    $target.click(function(event){
        
        event.preventDefault();
        _acHandler.ajax_frameEdit($(this).parent().attr("frameid"));
    });
}


function bind_frameDelete($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector, "frame delete");
    if (!$target) { return; }
    
    $target.click(function(event){
        
        event.preventDefault();
        _acHandler.ajaxFrameDeleteConfirm($(this).parent().attr("frameid"));
    });
}

function bind_openPMenu_frame($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector, "frame popup menu");
    if (!$target) { return; }
   
    $target.click(function(event){
        
        event.preventDefault();
        // append to thumbnail base [div with ".thumb" class]
        var $parentThumb = $(this).closest(".thumb");
        if ($parentThumb) {
            _popupMenu.popupAt($parentThumb, "frameid");
        } else {
            console.log("Cannot find the thumbnail element in list of parents.");
            return;
        }
        
    });
    
} // end: bind_openPMenu_frame()





// http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Strip
//  _______ _______  ______ _____  _____ 
//  |______    |    |_____/   |   |_____]
//  ______|    |    |    \_ __|__ |      
                                       
//  ______  _____ __   _ ______                                    
//  |_____]   |   | \  | |     \                                   
//  |_____] __|__ |  \_| |_____/                                   
                                                                
//  _______ _______ _______ _______ _     _  ______ _______ _______
//  |______ |______ |_____|    |    |     | |_____/ |______ |______
//  |       |______ |     |    |    |_____| |    \_ |______ ______|

// ................................................
// bind link that opens popup menu for strip
//
// This function assumes popup menu is included in the document. 
// Currently done by including the snippet as a partial. Find it in
// flipbooks/partials/popup_menu_strip_partial.html
// ................................................

function bind_features_onStripContainer($targetContainer, isMultiTarget){
    
    isMultiTarget = typeof(isMultiTarget) === 'boolean' ? isMultiTarget : isMultiTarget || true;
    var t = isMultiTarget;

    //Bind "upload"
    bind_openUpload($targetContainer, (t ? ".strip_flex_toolbar" : "")  + ' a.strip_upload');
    //Bind "delete"
    //bind_frameDelete($targetContainer, (t ? ".thumb" : "") + ' a.frame_delete');
    //Bind "options" (popup menu)
    bind_openPMenu_strip($targetContainer, (t ? ".strip_flex_toolbar" : "")  + ' a.strip_options'); 
    
    
    
}

function bind_openUpload($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector, "strip upload");
    if (!$target) { return; }
    
    $target.click(function(event){
        event.preventDefault();
        
        var $highlightable = $(this).closest(CLASS_STRIPLI);
        
        //_acHandler.ajaxStrip_OpenUploadForm($highlightable);
        var $fileUploadCover = $highlightable.find(".cover.file_upload");
            $fileUploadCover.css("opacity", 1);
            $fileUploadCover.css("pointer-events", "auto");
        
        // Move form to current strip container
        var $frameCreateForm = $('#frame_create_form').eq(0);
            $frameCreateForm.show(); //may be hidden in beginning.
        //auto-fill the form
        var stripId = $highlightable.attr("stripId");
        
        //console.log("curr strip id: " + stripId);
        $frameCreateForm.find('#id_strip').val(String(stripId));
        //console.log("changing field val: " + $frameCreateForm.find('#id_strip').val());

        $fileUploadCover.append($frameCreateForm);
        
        _lbCover.setClickEventFunc(function(){
            $fileUploadCover.css("opacity",0);
            $fileUploadCover.css("pointer-events", "none");
        });
        
        _lbCover.turnOn($highlightable);
        
    });
    
}

function bind_stripDelete($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector, "strip delete");
    if (!$target) { return; }
    
    $target.click(function(event){
        event.preventDefault();
        _acHandler.ajaxFrameDeleteConfirm($(this).parent().attr("frameid"));
    });
}



function bind_openPMenu_strip($targetContainer, targetSelector){
    
    var $target = getValidTarget($targetContainer, targetSelector , "strip popup menu");
    if (!$target) { return; }

    $target.click(function(event){
        
        event.preventDefault();
        // append to itself [<span> with options icon]
        var $popupTarget = $(this).closest(CLASS_STRIPLI);
        _popupMenu_strip.popupAt($popupTarget, "stripid");
        
    });

}







//   ______ _______ __   _ ______  _______  ______ _______
//  |_____/ |______ | \  | |     \ |______ |_____/ |______
//  |    \_ |______ |  \_| |_____/ |______ |    \_ ______|

// Functions used to spawn new elements


// Uses json_partial view to load html template for a strip container
function renderStripContainer(data){
    
    var stripObj = data;
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
        // bind_frameCreateFormButton($(document), $newStripContainer.find('.frame_form'));
        
        // Bind events on container 
        bind_features_onStripContainer($newStripContainer, false);
        
    });
    
}

// Renders empty frame container with a loading animation
function renderNewFrameContainer(stripId){
    
    //Get new container
    var thumbResp = window.flipbookLib.getJSONPartial(
        '/flipbooks/json_partials/frame_container/empty',
    );
    thumbResp.success(function(data_partial){
        var $emptyFrameContainer = $(data_partial['html_template']);
        var targetStripContainer = $('.strip_flex_container[stripid='+stripId+']');
            
            $emptyFrameContainer.insertAfter(targetStripContainer.find(".thumb").last());
            $emptyFrameContainer.hide();
            $emptyFrameContainer.slideToggle( "fast" );

        //show loading animation
        _spinnyObj.appendSpinnyTo(
            $emptyFrameContainer, 
            {"min-width": "200px", "min-height":"120px"},
            true);
    });

}

function renderFrameContainer(data, stripId){
    
    console.log("Render new frame container");
    
    var frameObj = data;
    
    //Get new container
    var thumbResp = window.flipbookLib.getJSONPartial(
        '/flipbooks/json_partials/frame_container/'+frameObj.id,
    );
    thumbResp.success(function(data_partial){
        var $newFrameContainer = $(data_partial['html_template']);
        var targetStripContainer = $('.strip_flex_container[stripid='+stripId+']');
            
            var $loadingFrame = targetStripContainer.find(".thumb.loading");
            
            $newFrameContainer.insertAfter($loadingFrame);
            $loadingFrame.remove();
            $newFrameContainer.hide();
            $newFrameContainer.slideToggle( "fast" );
            
            //bind features
            bind_features_onFrameContainer($newFrameContainer, false);
    });

}





function renderDeleteFrameConfirm(data, frameId, args){
    
    // Make a new popup with same style as original popupmenu
    var $popupMenu = args['popupMenu'];
    var _popupDeleteMenu = new PopupMenu($popupMenu, "template");
    
    // Fill out popup
    _popupDeleteMenu.cleanContent();
    _popupDeleteMenu.appendContent($("<p>" +data['html_form'] + "</p>"));
    
    //Register object that will be lit when lights out
    var $targetThumbnail = $(document).find(".thumb[frameid="+frameId+"]");
    _popupDeleteMenu.relatedElement.push($targetThumbnail.children(".frame_image.stretch"));

    // ++++++ lights out ++++++
    _popupDeleteMenu._lightBox = _lbCover;
    _popupDeleteMenu.popupAt($targetThumbnail);
    // ++++++++++++++++++++++++
    
    _lbCover.setClickEventFunc(function(){
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
    _lbCover.setClickEventFunc(function(){
        $popupDelete.find('#delete-cancel-button').click();
    });
    
    _lbCover.turnOn();
    
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
        _lbCover.turnOff(); //don't forget the lightbox cover
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
        
        var containerObj = $(this).closest(CLASS_STRIPLI);
        var stripId = containerObj ? containerObj.attr("stripid") : "-1"
        
        
        containerObj.find(".frame_form").click();
        
        // manually append file information
        var $form = $(document).find("#frame_create_form");
        var moddedFormData = new FormData($form[0]);
        moddedFormData.append("frame_image", droppedFiles[0]);
    
        _acHandler.ajax_frameCreate(stripId, {"formData": moddedFormData});
        
    });
}
