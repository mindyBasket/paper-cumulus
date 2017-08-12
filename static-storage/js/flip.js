
/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable
var frame_view;


$(document).ready(function(){
    console.log("---------- v.1.12 - Ajax attempt");

    //init global var
    var top_z_index = 1000;
    frame_view = $(document).find('.frame_view');

    init_frame_imgs();
    
    $('.frame_view.wide .frame_load').imagesLoaded()
    .fail( function() {
        console.log('all images loaded, at least one is broken');
    })
    .progress( function( instance, image ) {
        var result = image.isLoaded ? 'loaded' : 'broken';
        console.log( 'image is ' + result + ' for ' + image.img.src + ": instance: " + $(image.img).attr("src"));
    })
    .always( function( instance ) {
        //all images loaded
    })
    .done( function( instance ) {
        alert_msg('all images successfully loaded');
        //ready the cover
        $(document).find(".cover").children("#msg_loading").hide();
        $(document).find(".cover").children("#msg_instruction").show();
        
        
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
            
        }); //keyevent listener
        
    });
    
});



/*-----------------------------------------------------------------
-----------------------------helpers-------------------------------
-------------------------------------------------------------------*/

//...........constants............
var t_step = 400 //ms

//init_frame_imgs()...............
//Only works after img DOM has been loaded. 
//Adds proper z-index and display_order attributes to the frames
function init_frame_imgs(){
    
    var display_order = 0;
    
    $('.frame_view.wide .frame_load').find('img.frame_item').each(function(){
        //TO DO:
        // hard coded in "1000", but you must find more reliable way
        // to retrieve that information
        
        $(this).css("z-index", 1000-display_order); 
        display_order+=1;
    });
}


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
    var curr_strip;
    var next_strip;
    
    if (first_play || frame_view.find('span.strip[done=true]').length == 0){
        //already at first strip
        curr_strip = null;
        next_strip = frame_view.find('span.strip').eq(0);
    } else {
        curr_strip = $(document).find(".frame_view").find('span.strip[done=true]').last();
        next_strip =  curr_strip.next();
        
        //if there is no more next
        if (next_strip.length == 0){
            alert_msg('No more strip available. Requesting more strip.');
            load_more_strips();
            return;
        }
    }
    
    
    
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
    if (!(first_play) && curr_strip != null){
        //finish off "done" strip. 
        //hide ALL, in case user hits next before animation finishes
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