/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$(document).ready(function(){
    console.log("ajax_crud.js ---------- * v0.1.2");
    
    var scenePk = $('#strip_form').find('select#id_scene').val()
    //------------------------------------
    // on submit
    //------------------------------------
    $('#strip_form').submit(function(event){
        // disable default form action
        event.preventDefault();
        
        //prep form data
        var formData = $(this).serialize()

        //ajax call
        $.ajax({
            url: '/api/scene/'+scenePk+'/strip/create/',
            data: formData,
            method: 'POST',
            success: function (data) {
                console.log("sucessfully posted new strip");
                console.log(data);
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