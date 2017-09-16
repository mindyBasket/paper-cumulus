/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$("select[name='scene']").change(function() {
    console.log("Scene has been selected -- v 2.0");
  
    var scene_id = $(this).children('option').eq(($(this).val())).attr("value");
    
    //display avaliable/taken orders
    retrieve_scene__strip(scene_id);
 
});

function show_available_strip_id(data){
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
    // TODO: check if the container exists already
    var strip_display_container = $('<div class="flimstrip_view"/>');
    
    $("select[name='scene']").parent().append(strip_display_container);
    $('<h4>Existing strips:</h4>').appendTo(strip_display_container);

 
    // add images
    for(var i=0; i<aval_strip_frames.length; i++){
        strip_display_container.append('<img src="'+ aval_strip_frames[i] +'"/>')
    }
  
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
            console.log("Scene (id="+scene_id+") has strips with ids of the following: " + JSON.stringify(data));
            show_available_strip_id(data);
        }
    });
}