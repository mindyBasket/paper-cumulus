/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$(".form.create select[name='scene']").change(function() {
    console.log("Scene has been selected -- v 2.4");
  
    var scene_id = $(this).children('option').eq(($(this).val())).attr("value");
    
    //display avaliable/taken orders
    retrieve_scene__strip(scene_id);
 
});

function show_available_strip_id(data){
    console.log("*** Data recieved: " + JSON.stringify(data));
    
    var aval_strip_ids = [];
    var aval_strip_frames = [];
    
    for(var key in data) {
        if (data.hasOwnProperty(key) && key=="strip_ids") {
            aval_strip_ids = data[key];
        }
        else if (data.hasOwnProperty(key) && key=="strip_frames") {
            aval_strip_frames = data[key];
        }
    }
    
    // Show it right under the scene selection
    // Check if the container exists already
    var strip_display_container = $("select[name='scene']").parent().find('.flimstrip_view');
    if (strip_display_container.length <= 0){
        $('<h4>Existing strips:</h4>').appendTo($("select[name='scene']").parent());
        strip_display_container = $('<div class="flimstrip_view"/>');
        $("select[name='scene']").parent().append(strip_display_container);
        
    } else {
        strip_display_container = strip_display_container.eq(0);
    }
 
    // Add images
    strip_display_container.html('');
    
    for(var i=0; i<aval_strip_frames.length; i++){
        if (aval_strip_frames[i] != "placeholder"){
            strip_display_container.append('<img src="'+ aval_strip_frames[i] +'"/>')
        }
        else {
            var placeholder_box = $('<span class="placeholder"/>');
            strip_display_container.append(placeholder_box);
        }
        
    }
    
    strip_display_container.append('<span class="placeholder new"/>');
    strip_display_container.append('<p>This new strip will be at order ' + (aval_strip_ids.length+1) +'</p>');
  
}

// Requests more strip through a function-view.
// Once successful, appends them.
function retrieve_scene__strip(scene_id){
 
    $.ajax({
        url: '/flipbooks/ajax/retrieve_scene__strip',
        data: {
            'scene_id': scene_id,
        },
        dataType: 'json',
        success: function (data) {
            show_available_strip_id(data);
        }
    });
}