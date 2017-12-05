/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$(document).ready(function(){
    console.log("ajax_crud.js ---------- * v0.1.8");
    
    bindButtons($(this));
    
    var scenePk = $('#strip_form').find('select#id_scene').val()
    
    //------------------------------------
    // on strip_form submit
    //------------------------------------
    $('#strip_form').submit(function(event){
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
                addNewStrip(data);
            },
            error: function (data) {
                console.error(data);
                console.log(data.status);
            }
        });
    });
    
 
    //------------------------------------
    // on frame_form submit
    //------------------------------------
    $('#frame_form_disabled').submit(function(event){
        // disable default form action
        event.preventDefault();
        
        //prep form data
        var formData = $(this).serialize();

        var stripPk = $(this).find('select#id_strip').val();
        
        console.log($(this))
    
        //ajax call
        $.ajax({
            url: '/api/strip/'+stripPk+'/frame/create/',
            data: formData,
            method: 'POST',
            enctype: 'multipart/form-data',

            success: function (data) {
                console.log("sucessfully created frame strip");
                //addNewFrame(data, stripPk);
            },
            error: function (data) {
                console.error(data);
                console.log(data.status);
            }
        });
    });
    
});









/*-----------------------------------------------------------------
-----------------------------helpers-------------------------------
-------------------------------------------------------------------*/

// Basic button binding function

function bindButtons($doc){
    
    $doc.find('.strip_flex_container').each(function(){
        
        
        // Button that open new frame form ----------- 
        $(this).find(".frame_form").click(function(){
            // In the template, the dynamic form for frame-create should exist.
            // Relocate the form into the appropriate strip container
            
            $doc.find('.frame_form').show();
            $(this).toggle();
            
            // Warning: this assumes the button is located only a single depth into the 
            //          .strip_flex_container, but it may not be the case in the future. 
            var currStripContainer = $(this).parent();
            var targetForm = $doc.find("#frame_form").eq(0)
            targetForm.appendTo(currStripContainer);
            
            //auto-fill the form
            var currStripId = $(this).attr("for").split("strip_")[1]; 
            console.log("curr strip id: " + currStripId);
            targetForm.find('#id_strip').val(currStripId);
            
        });
        
        
        
    }); 
    
}


// animation test
function addNewStrip(data){
  
    
    var stripObj = data
    
    var stripList = $('ul.list_strips');
    
    var stripTemplate = stripList.children('li').last().clone();
    
    stripTemplate.appendTo(stripList);
    stripTemplate.toggle();
    
    //update index
    var last_index = stripTemplate.find(".header").children('span').eq(0).text();
    stripTemplate.find(".header").children('span').eq(0).text(Number(last_index)+1);
    
    //update id info
    var id_span = stripTemplate.find(".header").children('span').eq(1);
    id_span.text("id:" + stripObj.id); //text
    stripTemplate.attr("stripid", stripObj.id); //attribute
    
    
    //update button "for" attribute that contain strip id
    stripTemplate.find(".tile[displaytype='add']").attr("for", "strip_"+stripObj.id)
    

    // Show
    stripTemplate.slideToggle( "slow" );
    
}


function addNewFrame(data, stripId){
    
    var frameObj = data;
    
    //need to add it in the right place
    var newFrameThumb = $('<div class="thumb"></div>');
    newFrameThumb.append();
    $('.strip_flex_container[stripid='+stripId+']').append()
    
}

// Requests more strip through a function-view.
// Once successful, appends them.
function load_more_strips(){
    
    $.ajax({
        url: '/flipbooks/ajax/load_more_strips',
        data: {
            'scene_order': 1,
            'num_stripset_loaded':3
        },
        dataType: 'json',
        success: function (data) {
            alert_msg("Retrieving more frames")
            add_strips(data);
            alert_msg("More frames retrieved")
        }
    });
}

// Adds additional frames retrieved from the ajax call
function add_strips(data){

    var frame_load_container = $(document).find(".frame_view > .frame_load");
    
    var new_strip;
    $.each(data, function(key, img_url){
        //prep strip container
        new_strip = $('<span class="strip"></span>');
        new_strip.appendTo(frame_load_container);
         
        //get information on the last displayable frame
        var last_frame = frame_view.find('img.frame_item').last()
        var last_z_index = last_frame.css("z-index")-1;
        
        //parse
        $.each(img_url, function(i, url){
            console.log("appending strip: " + url);
            
            var new_frame = $('<img class="frame_item"/>');
            new_frame.attr("src", url);
            new_frame.css("z-index", last_z_index);
            new_frame.appendTo(new_strip);
            
            last_z_index-=1;
        });
        
    });
}
    
/* alert box related*/
function alert_msg(msg){
    var msg_box = $(document).find('.alert.alert-info');
    if(msg_box.length >= 1){
        console.log("msg box found");
        msg_box.children('.msg').text(msg);
        return true;
    } else {return false;}
}