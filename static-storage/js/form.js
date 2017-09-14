/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$("select[name='scene']").change(function() {
    console.log("Scene has been selected -- v 1.7");
  
    var scene_id = $(this).children('option').eq(($(this).val())).attr("value");
    
    //display avaliable/taken orders
    retrieve_scene__strip(scene_id);
 
});

function update_available_strip_id(data){
    var aval_strip_ids = [];
    
    for(var key in data) {
        if (data.hasOwnProperty(key) && key=="strip_ids") {
            aval_strip_ids = data[key];
        }
    }
    
    console.log("found available strip ids: " + aval_strip_ids);
    
    //clear
    var strip_option_obj = $('select#id_order');
    strip_option_obj.html('');
    //repopulate
    for(var i=0; i<aval_strip_ids.length;i++){
        strip_option_obj.append('<option value='+aval_strip_ids[i]+'>'+aval_strip_ids[i]+'</option>');
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
            update_available_strip_id(data);
        }
    });
}