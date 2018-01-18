/* global $ */
/* global jQuery */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

// Project specific libraries
// window.flipbookLib

/*-----------------------------------------------------
----------------------- MAIN  -------------------------
-------------------------------------------------------*/

$(function() { 

    console.log("ajax_crud.js ---------- * v0.4.11");
    
    // "+frame" button appends frame create form
    bind_frameCreateFormButton($(document));
    
    // mini_menu link opens popup_menu
    bind_openMiniMenu($(document)); 
    // elements inside the popup_menu. Has Edit and Delete.
    bind_popupMenu_elems($(document).find(".popup_menu.edit").eq(0));
    
    
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
        
        //prep form data
        var formData = $(this).serialize();
        
        $.ajax({
            url: '/api/scene/'+scenePk+'/strip/create/',
            data: formData,
            method: 'POST',
            success: function (data) {
                console.log("CREATED: Successfully created a new strip [id=" + data.id + "]");
                renderStripContainer(data);
            },
            error: function (data) {
                window.flipbookLib.showGenericAJAXErrors(data, $(this).url);
            }
        });
    });
    
    // //Animation test
    // $('#strip_create_form').submit(function(event){
    //     event.preventDefault();
        
    //     addNewStrip({'id':0});
        
    // });
    
 
    //......................
    // on frame_form submit
    //.......................
    $('#frame_create_form').submit(function(event){
        // disable default form action
        event.preventDefault();
        var $frameForm = $(this);
        
        //prep form data
        //var formData = $(this).serialize();
        var formData = new FormData($(this)[0]);
        var stripPk = $(this).parent().attr("stripid");

        //ajax call
        $.ajax({
            url: '/api/strip/'+stripPk+'/frame/create/',
            data: formData,
            method: 'POST',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            success: function (data) {
                console.log("sucessfully created frame");
                //Hide the form and return add button
                $frameForm.hide();
                $('.frame_form').show();
                addFrameContainer(data, stripPk);
            },
            error: function (data) {
                console.error(data);
                console.log(data.status);
            }
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
    
    
    //test
    // $(this).find(".frame_form").click(function(){
        
    //     var data = {'id': 12, 'frame_image_native':"/media/frame_images/scene_4_/strip_1-1.png.300x300_q85_autocrop.png"};
    //     addNewFrame(data, 33);
        
    // });
        
    

}


// ................................................
// bind link that opens mini menu
//
// This function assumes mini menu is included in the document. 
// Currently done by including the snippet as a partial. Find it in
// flipbooks/partials/popup_menu_partial.html
// ................................................

function bind_openMiniMenu($doc, $targetOptional){
    var $target = $targetOptional
    
    if ($target == null){
        //do for all mini menus if target not specified
        $target = $doc.find('.thumb .mini_menu.edit');
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot bind mini menu even to non-Jquery object.");
        return false;
    }
    
    // ...............
    // open mini menu
    // ...............
    $target.click(function(event){
        event.preventDefault();
        
        // Grab partial and append to the current thumb location
        var $popupMenu = $doc.find(".popup_menu.edit").eq(0);
        $popupMenu.appendTo($(this).parent());
        $popupMenu.show();
        
        // Update tag information about current frame
        var frameid = $(this).parent().attr("frameid");
        $popupMenu.attr("for", frameid);
        $popupMenu.children(".header").children("span").text(frameid);
        
        // This allows popupMenu to disappear when you click else where
        $popupMenu.focus();
        
    });
    
    
    
}


// ................................................
// Various behaviors and buttons on the popup menu
// ................................................

var lightboxCover = `
<div id="light_box_cover">
</div>
`
var lightboxModal = `
<div id="light_box_modal">
</div>
`

function bind_popupMenu_elems($popupMenu){
    
    // a. Bind close event. The popup menu closes when you are out of focus. 
    $popupMenu.focusout(function(){
        $(this).hide();
    });
    
    // b. Bind 'EDIT' action .........................
    $popupMenu.find(".action.edit").click(function(){
        // Retrieve frame information
        var frameid = $popupMenu.attr("for");
        if (frameid=="-1"){return;} //STOP, if frameid is not set.
        
        //open modal
        var $lbModal = $(lightboxModal);
        var $lbCover = $(lightboxCover);
        $lbCover.appendTo('body');
        $lbModal.appendTo('body');
        $lbCover.click(function(){
            $(this).remove();
            $lbModal.remove();
        });
        
        //json_partial 
        $.ajax({
            url: '/flipbooks/json_partials/frame_edit_form/'+frameid,
            method: 'GET',
            dataType: 'json',
            beforeSend: function () {
                console.log("Attempt to retrieve form partial");
            },
            success: function (data_partial) {
                var $frameEditForm = $(data_partial['html_template']);
                $lbModal.append($frameEditForm);
                
                // This form has each individual field as its own form
                // Bind note submit button
                $('#frame_note_form').submit(function(event){
                    // disable default form action
                    event.preventDefault();
                    var $frameForm = $(this);
                    
                    //prep form data
                    var formData = $(this).serialize();
                   // var formData = new FormData($(this)[0]);

                    // Ajax API call
                    $.ajax({
                        url: '/api/frame/'+frameid+'/update/',
                        data: formData,
                        method: 'PATCH',
                        // enctype: 'multipart/form-data',
                        // processData: false,
                        // contentType: false,
                        success: function (data) {
                            $frameForm.find('#field_note').children('.field_value').text(data['note']);
                        },
                        error: function (data) {
                            console.error(data);
                            console.log(data.status);
                        }
                    });
                });
                
                // Bind frame_image submit button
                $('#frame_frame_image_form').submit(function(event){
                    // disable default form action
                    event.preventDefault();
                    var $frameForm = $(this);
                    
                    //prep form data
                    //var formData = $(this).serialize();
                    var formData = new FormData($(this)[0]);

                    //ajax call
                    $.ajax({
                        url: '/api/frame/'+frameid+'/update/',
                        data: formData,
                        method: 'PATCH',
                        enctype: 'multipart/form-data',
                        processData: false,
                        contentType: false,
                        beforeSend: function (){
                            console.log($(this));
                        },
                        success: function (data) {
                            var $frameImageContainer = $frameForm.find('#field_frame_image').children('.field_value');
                            $frameImageContainer.html('');
                            $frameImageContainer.append('<img src="' + data['frame_image_native']+ '"/>');
                        },
                        error: function (data) {
                            console.error(data);
                            console.log(data.status);
                        }
                    });
                });
                
                
                
            },
            
            error: function (data) {
                console.error(data);
                console.log(data.status);
            }
        });
        
    });
    
    
    // c. Make cover
    // TODO: makes current frame as the "cover" for the Scene.
    

    // d. Bind 'DELETE' action .........................
    $popupMenu.find('.action.delete').click(function(){
        event.preventDefault();
        
        // Retrieve frame information
        var frameid = $popupMenu.attr("for");
        if (frameid=="-1"){return;} //STOP, if frameid is not set.
        
        //ajax call: GET delete confirm
        //           To see POST delete, see ajax_frame_delete()
        $.ajax({
            url: '/flipbooks/frame/'+ frameid +'/delete/',
            method: 'GET',
            dataType: 'json',
            beforeSend: function () {
                console.log("DELETE");
                //hide the popup edit menu 
                $popupMenu.focusout();
            },
            success: function (data) {
                
                // ...............
                //new popup for the (actual) delete form
                // ...............
                var $popupDelete = $popupMenu.clone().appendTo($popupMenu.parent()); //This might be slow
                
                $popupDelete.children('.content').html(''); //clear unnecessary cloned content
                
                //make objects to appear above lightbox
                $popupDelete.attr('style','z-index:1000');
                $popupMenu.parent().children('img').attr('style','z-index:1000');
                
                addDeleteConfirmForm(data, $popupDelete, $popupDelete.children('.content'));
                
                //a lightbox cover, that acts as a giant "close" button
                var $lbCover = $(lightboxCover)
                $lbCover.appendTo('body');
                $lbCover.click(function(){
                    $popupDelete.find('#delete-cancel-button').click();
                })
       
                // Bind "confirm" button
                $popupDelete.find('#delete-confirm-button').click(function(event){
                    // Note: #delete-confirm-button is a <a> that acts
                    //       like a submit() for the form  #delete-confirm.
                    event.preventDefault();
                    $popupDelete.find('#delete-cancel-button').click(); //clean up
                    var $deleteForm = $popupDelete.find('#delete-confirm');
                    return ajax_frame_delete($deleteForm, frameid);
                });
                
                // Bind "cancel" button
                $popupDelete.find('#delete-cancel-button').click(function(event){
                    
                    //clean up
                    $popupDelete.remove();
                    $lbCover.remove(); //don't forget the lightbox cover
                    $popupMenu.parent().children('img').attr('style','');
                });
                
                
            },
            error: function (data) {
                console.error(data);
                console.log(data.status);
            }
        });
                
    }); //end: bind 'delete'

}


var ajax_frame_delete = function($form, frameid){ 
    
    $.ajax({
        url: '/flipbooks/frame/'+ frameid +'/delete/',
        method: 'POST',
        data: $form.serialize(),
        dataType: 'json',
        beforeSend: function () {
            console.log("Actual Deletion in progress");
        },
        success: function (data) {
            //show animation of deletion
            $(document).find('.thumb[frameid='+ frameid +']').animate({
                opacity: 0,
            }, 300, function() {
                //actually delete
                $(this).remove();
            });
        },
        error: function (data) {
            console.error(data);
            console.log(data.status);
        }
    });
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


var thumbTemplate_ = `
<div class='thumb'>
    <img src="" width='200px'/>
    <a href="" class="mini_menu edit">frame[{}]</a>
</div>
`

function addFrameContainer(data, stripId){
    
    var frameObj = data;
    
    //need to add it in the right place
    var newFrameThumb = $(thumbTemplate_);
   
    //fill in id
    var id_label = newFrameThumb.children('a').text();
    id_label = id_label.split("{}")[0] + frameObj.id + id_label.split("{}")[1]
    newFrameThumb.children('a').text(id_label);
    //fill in image
    newFrameThumb.children("img").attr("src", frameObj.frame_image_native);
    
    var targetStripContainer = $('.strip_flex_container[stripid='+stripId+']');
    newFrameThumb.insertBefore(targetStripContainer.find('.frame_form'));
    
    //animate
    newFrameThumb.toggle();
    newFrameThumb.slideToggle( "fast" );
}


function addDeleteConfirmForm(data, $popup, $targetOptional){
    
    var $target = $targetOptional
    if ($target == null){
        // Select whole content of $popup
        $target=$popup
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot append delete form to a non-Jquery object.");
        return false;
    }

    //var combinedHtmlContent = $popup.html() + "<p>" +data['html_form'] + "</p>";
    $target.append($("<p>" +data['html_form'] + "</p>"));
    // $popup.html(combinedHtmlContent);
    
    
    
   
}