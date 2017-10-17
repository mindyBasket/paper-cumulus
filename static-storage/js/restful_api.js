/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable


console.log("restful_api.js ----------* v0.1");

function load_more_strips(){
    
    $.ajax({
        url: '/flipbooks/ajax/spawn/create_scene/1/',
        data: {
            'scene_order': 1,
            'num_stripset_loaded':3
        },
        dataType: 'json',
        success: function (data) {

        }
    });
}

