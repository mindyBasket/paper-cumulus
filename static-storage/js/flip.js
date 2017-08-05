
/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$(document).ready(function(){
    console.log("---------- v.1.2");
    var display_order = 0;
    var curr_order = 0;
    var top_z_index = 1000;
    
    var first_frame
    
    $('.frame_view.wide .frame_load').imagesLoaded()

    .fail( function() {
        console.log('all images loaded, at least one is broken');
    })
    .progress( function( instance, image ) {
        var result = image.isLoaded ? 'loaded' : 'broken';
        console.log( 'image is ' + result + ' for ' + image.img.src + ": instance: " + $(image.img).attr("src"));
        
        if(display_order == 0){
            //first image. grab z-index
            top_z_index = $(image.img).css("z-index");
        } else{
            $(image.img).css("z-index", top_z_index-display_order);
        }

        $(image.img).attr("display_order", display_order)
        $(image.img).attr("class", "frame_item")
        display_order+= 1

    })
    .always( function( instance ) {
        //all images loaded
        //unblur first image and remove cover
        first_frame = $(document).find("img.frame_item").eq(0)
        first_frame.attr("viewable",true)
        $(document).find(".frame_view .cover").css("display","none")
        
        
        
    })
    .done( function( instance ) {
        console.log('all images successfully loaded');
    });
    
    
    //bind keyboard event
    document.addEventListener("keydown", function(){
        
        console.log("** keycode: " + event.code)
        
        if (event.code === "ArrowRight"){
            //next
            
            //a little not safe using curr_order
            // not only curr_order COULD potentially get mismatched
            // but I am not flipping frame one by one
            curr_order+= 1
            $(document).find("img.frame_item").each(function(index){
                //hide everything excluding curr_order
                if(index >= curr_order){
                    return false;
                } else{
                    $(this).hide();
                }
            });
            
        }
        else if(event.code === "ArrowLeft"){
            //previous
        }
        
    });

    
});



