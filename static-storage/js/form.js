/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$( "select[name='scene']").change(function() {
  console.log("Scene has been selected -- v 1.2");
  
  //display avaliable/taken orders
  retrieve_scene__strip();
 
});


// Requests more strip through a function-view.
// Once successful, appends them.
function retrieve_scene__strip(){

    $.ajax({
        url: '/flipbooks/ajax/retrieve_scene__strip',
        data: {
            'scene_id': 1,
        },
        dataType: 'json',
        success: function (data) {
            console.log("Scene (id=1) has strips with ids of the following: " + JSON.stringify(data));
        }
    });
}