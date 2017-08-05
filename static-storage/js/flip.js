
/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

$(document).ready(function(){
    console.log("---------- v.1.4");
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

        $(image.img).attr("display_order", display_order);
        display_order+= 1

    })
    .always( function( instance ) {
        //all images loaded
        
        //bind keyboard event
        document.addEventListener("keydown", function(){
        
            if (event.code === "ArrowRight"){ //next

                play_frame();

            }
            else if(event.code === "ArrowLeft"){ //previous
                
                //no animation, simply jump to last frame of previous strip
                
                //return visibility of current strip
                var curr_strip = $(document).find(".frame_view span.strip[done=true").last();
                curr_strip.children(".frame_item").show();
                curr_strip.attr("done", false);
                
                //return visibility of last frame of previous strip
                //below returns 2 objects previous, instead of 1
                //$(document).find(".frame_view span.strip[done=true").last().prev().attr("revisited", true);
                curr_strip.prev().children(".frame_item").last().show();
            }
            
        });
        
    })
    .done( function( instance ) {
        console.log('all images successfully loaded');
        
    });
    
});



/*--------------------------------------------------------
---------------------helpers------------------------------*/
var t_step = 400 //ms

function play_frame(){

    var timeline = [];
    var first_play = false;
    
    //check if it is not covered
     if ($(document).find(".cover").css("display") != "none"){
        first_play =true;
        $(document).find(".frame_view .cover").css("display","none");
        $(document).find("img.frame_item").eq(0).attr("viewable",true);
    }
    
    //find last completed .strip, it is marked with done=true
    // note, done=true does not mean it is visible
    // it means it finished playing all the frames. 
    var curr_strip = first_play ? null : $(document).find(".frame_view").find('span.strip[done=true]').last();
    var next_strip = first_play ? $(document).find(".frame_view").find('span.strip').eq(0) : curr_strip.next();
    
    
    //get "timeline"
    console.log(next_strip.children(".frame_item").length);
    timeline = get_timeline(next_strip.children(".frame_item").length, t_step);
    console.log("----------Timeline GET: " + timeline);
    
    //set chain of setTimeOuts
    var total = next_strip.children(".frame_item").length-1
    next_strip.children(".frame_item").each(function(index){
        if (index == total){
            $(this).parent().attr("done", 'true'); //finished playing
        } else {
            setTimeout(hideFrame.bind(null, $(this)), timeline[index]);
        }
    });
    
    //remove "done" strip or cover, depending on what's currently on top
    if (!(first_play)){
        //finish off "done" strip
        curr_strip.children(".frame_item").hide();
    } else { first_play = false;}
    
}



//makes "timeline" for setTimeOut for reach items
function get_timeline(count, delay){
    if (delay == undefined){
        delay = 0;
    }
    var timeline = [];
    
    for (var i=0; i<count-1; i++){
        timeline.push(t_step*i + delay);
    }
    return timeline
}

//hides the frame
function hideFrame(frame_obj){

    frame_obj.hide();
    
}