/* global $ */
/* global jQuery */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

//------------------------------------
// on sortable UI 
//------------------------------------

$(function(){
    $('.strip_flex_container').each(function(){
        $(this).sortable({
            placeholder: "ui-sortable-placeholder",
            items: ".thumb:not(.ui-state-disabled)", //cancel: ".ui-state-disabled"
            delay: 100,
            tolerance: "pointer"
        });
        
        // ................
        // SETTERS
        // ................
        
        //event setter when sorting finishes	
        $(this).on( "sortdeactivate", function( event, ui ) {
            console.error("Sorting stopped");
    
            //retrieve new order. 
            // Trying to see if I can get away with not using sortable's "serialize()"
            
            var frame_li = [];
            $(this).find('.thumb').each(function(){
                if($(this)[0].hasAttribute("frameid")){
                    frame_li.push($(this).attr("frameid"));
                }
            })
    
            var sortableData = {
                'frame_ids': frame_li.join(",")
            }
            
            //ajax call
            // Can you unify this into one function or something
            $.ajax({
                url: '/flipbooks/ajax/strips/'+ $(this).attr("stripid") +'/sort-children/',
                data: sortableData,
                method: 'GET',
                //enctype: 'multipart/form-data',
                dataType: 'json',
                // processData: false,
                contentType: false,
                success: function (data) {
                    //success message
                    console.log("sucessfully came back: " + data["frame_ids"]);
                   
                },
                error: function (data) {
                    console.error(data);
                    console.log(data.status);
                }
            });
        });
        
    });
}); 
