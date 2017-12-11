/* global $ */
/* global jQuery */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable


$(function() { //Short hand for $(document).ready(function(){

    console.log("ajax_crud.js ---------- * v0.4.5");
    
    // "+frame" button appends frame create form
    bind_frameCreateFormButton($(document));
    
    // mini_menu link opens popup_menu
    bind_miniMenu($(document));
    
    // elements inside the popup_menu
    bind_popupMenu_elems($(document).find(".popup_menu.edit").eq(0));
    
    // Append forms
    $('#frame_create_form').hide();
    $(".popup_menu.edit").hide();
    // form #frame_create_form is rendered through template. 
    
    
    var scenePk = $('#strip_create_form').find('select#id_scene').val();
    //------------------------------------
    // on strip_form submit
    //------------------------------------
    $('#strip_create_form').submit(function(event){
        
        // disable default form action
        event.preventDefault();
        
        //prep form data
        var formData = $(this).serialize();

        //ajax call
        $.ajax({
            url: '/api/scene/'+scenePk+'/strip/create/',
            data: formData,
            method: 'POST',
            success: function (data) {
                console.log("sucessfully posted new strip");
                addStripContainer(data);
            },
            error: function (data) {
                console.error(data);
                console.log(data.status);
            }
        });
    });
    
    // //Animation test
    // $('#strip_create_form').submit(function(event){
    //     event.preventDefault();
        
    //     addNewStrip({'id':0});
        
    // });
    
 
    //------------------------------------
    // on frame_form submit
    //------------------------------------
    $('#frame_create_form').submit(function(event){
        // disable default form action
        event.preventDefault();
        var $frameForm = $(this);
        
        //prep form data
        //var formData = $(this).serialize();
        var formData = new FormData($(this)[0]);
        var stripPk = $(this).find('select#id_strip').val();

        //ajax call
        $.ajax({
            url: '/api/strip/'+stripPk+'/frame/create/',
            data: formData,
            method: 'POST',
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            success: function (data) {
                console.log("sucessfully created frame strip");
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
    // See list of binding functions below.
    
    
    
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
        console.log("binding form create for whole page");
        $target = $doc.find('.strip_flex_container .frame_form');
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot bind mini menu even to non-Jquery object.");
        return false;
    }
    
    $target.click(function(){

        // Hide only the current form request button
        var $formRequestBtn_ = $(this);
        $doc.find('.frame_form').show();
        $formRequestBtn_.hide();
        
        var stripid = $formRequestBtn_.attr("for");
        
        // Form is already appended into the page. Move it around to 
        // the appropriate strip container
        var currStripContainer = $('.strip_flex_container[stripid='+stripid+']');
        var targetForm = $doc.find("#frame_create_form").eq(0); //the one and only
        targetForm.hide();
        targetForm.slideToggle();
        targetForm.appendTo(currStripContainer);
        
        //auto-fill the form
        console.log("curr strip id: " + stripid);
        targetForm.find('#id_strip').val(stripid);
        
    });
    
    
    //test
    // $(this).find(".frame_form").click(function(){
        
    //     var data = {'id': 12, 'frame_image_native':"/media/frame_images/scene_4_/strip_1-1.png.300x300_q85_autocrop.png"};
    //     addNewFrame(data, 33);
        
    // });
        
    

}


// ................................................
// Button for opening frame create form in a desginated strip container
// ................................................
function bind_miniMenu($doc, $targetOptional){
    var $target = $targetOptional
    
    if ($target == null){
        //do for all mini menus if target not specified
        $target = $doc.find('.thumb .mini_menu.edit');
    } else if ($targetOptional instanceof jQuery == false){
        console.error("Cannot bind mini menu even to non-Jquery object.");
        return false;
    }
    
    $target.click(function(event){
        event.preventDefault();
        
        // popup_menu is a partial already included in the template
        // Append it to the current thumb location
        var $popupMenu = $doc.find(".popup_menu.edit").eq(0);
        $popupMenu.appendTo($(this).parent());
        $popupMenu.show();
        
        // Tag information about current frame
        var frameid = $(this).parent().attr("frameid");
        $popupMenu.attr("for", frameid);
        $popupMenu.find("li.header > span").text(frameid);
        
        // This allows popupMenu to disappear when you click else where
        $popupMenu.focus();
    });
    
}


// ................................................
// Various behaviors and buttons on the popup menu
// ................................................
var popupTemplate = `
<div href="" class="popup_menu edit" tabindex="1" for="-1">
    <span class="tickmark"></span>
</div>
`

function bind_popupMenu_elems($popupMenu){
    
    // a. Bind close event. The popup menu closes when you are out of focus. 
    $popupMenu.focusout(function(){
        $(this).hide();
    });
    
    // b. Bind 'delete' action
    $popupMenu.find('.action.delete').click(function(){
        event.preventDefault();
        
        // Retrieve frame information
        var frameid = $popupMenu.attr("for");
        console.log("popup menu for frame id: " + frameid);
        
        if (frameid=="-1"){return;} //STOP, if frameid is not set.
        
        //ajax call: GET delete confirm
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
                //new popup for the (actual) delete form
                var $popupDelete = $(popupTemplate);
                $popupDelete.appendTo($popupMenu.parent());
                
                addDeleteConfirmForm(data, $popupDelete);
                
                // Bind "confirm" button
                $popupDelete.find('#delete-confirm-button').click(function(event){
                    // Note: #delete-confirm-button is a <a> that acts
                    //       like a submit() for the form  #delete-confirm.
                    
                    event.preventDefault();
                    var $deleteForm = $popupDelete.find('#delete-confirm');
                    return ajax_frame_delete($deleteForm, frameid);
                });
                
                // Bind "cancel" button
                $popupDelete.find('#delete-cancel-button').click(function(event){
                    event.preventDefault();
                    var $deleteForm = $popupDelete.find('#delete-confirm');
                    $popupDelete.remove();
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

var ajax_frame_delete_test = function(frameid){
    //animation test
    console.log("actual deletion");
    $(document).find('.thumb[frameid='+ frameid +']').animate({
        opacity: 0,
    }, 300, function() {
        //actually delete
        $(this).remove();
    });
}





/*-----------------------------------------------------------------
---------------------- rendering functions ------------------------
-------------------------------------------------------------------*/



var popupEditMenuTemplate = `
<div href="" class="popup_menu edit" tabindex="1">
    <span class="tickmark"></span>
    <ul>
        <li class="header">Frame: {{frame.id}}</li>
        <li><a class="action delete">Delete</a></li>
    </ul>
</div>
`

// Uses json_partial view to load html template for a strip container
function addStripContainer(data){
  
    var stripObj = data
    var $stripList = $('ul.list_strips');
    
    //json_partial
    $.ajax({
        url: '/flipbooks/json_partials/strip_container/'+stripObj.id,
        method: 'GET',
        dataType: 'json',
        beforeSend: function () {
            //empty
        },
        success: function (data_partial) {

            var $newStripContainer = $(data_partial['html_template']);
            $newStripContainer.appendTo($stripList);
            $newStripContainer.hide();
            
            // Bind Button Events
            bind_frameCreateFormButton($(document), $newStripContainer.find('.frame_form'));
            
            // Show
            $newStripContainer.slideToggle( "slow" );
            
        },
        
        error: function (data) {
            console.error(data);
            console.log(data.status);
        }
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


function addDeleteConfirmForm(data, $popup){
    
    var combinedHtmlContent = $popup.html() + "<p>" +data['html_form'] + "</p>";
    $popup.html(combinedHtmlContent);
   
}