/* global $ */
/* global jQuery */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable



var _spinnyObj = new Spinny(); /* global Spinny*/
var _imgHandler = new AJAXImageHandler(); /* global AJAXImageHandler */
var _flipper = new FlipHandler(); /* global FlipHandler */

// DOMs that will be referenced frequently
var $frameView;

$(function(){
    console.log("* ------- flip.js loaded4 -------v.1.20 *");
    var $doc = $(document);
    
    //init global var
    $frameView = $doc.find('.frame_view');

    _flipper.$frameScrubber = $doc.find(".frame_scrubber");
    _flipper.$timer = $doc.find(".frame_scrubber").find(".timer");
    
    //connect DOM obj to ajax handlers
    _imgHandler.$cellContainer = $doc.find('.cell_container').eq(0); 
    
    var first_frame_loaded = false;
    var imageLoadCount = 0;
    var imageTotalCount = $('.frame_view .frame_load').find("img").length;
    
    // show loading
    _spinnyObj.appendSpinnyTo(
        $('#msg_loading').eq(0),
        {"background-color": "transparent"},
        false);
    

    $('.frame_view .frame_load').imagesLoaded()
    .fail( function() {
        console.log('all images loaded, at least one is broken');
    })
    .progress( function( instance, image ) {
        // Set width and height of the container
        // This is done here to ensure the width and height of image is avaliable
        if(!(first_frame_loaded)){
            var frame_item = $frameView.find("img.frame_item");
            $frameView.css({"width":frame_item.width()+"px", "height":frame_item.height()+"px"});
            first_frame_loaded = true;
            
            // make all strip visible
            $frameView.find(".strip").css("opacity",1);
        }
    
        imageLoadCount = (image.isLoaded ? 1 : 0) + imageLoadCount;
        // console.log( 'image is ' + result + ' for ' + image.img.src + ": instance: " + $(image.img).attr("src"));
        // console.log("Loaded [ " + imageLoadCount + "/" + imageTotalCount + " ]");
        
        // progress bar
        var $loadingBar = $(document).find('#loading_bar');
        $loadingBar.css("width", (imageLoadCount/imageTotalCount)*100 + "%");
        
    })
    .always( function( instance ) {
        //all images loaded
    })
    .done( function( instance ) {
        //load_more_strips();
        
        //hide cover
        $(document).find(".cover").children("#msg_loading").hide();
        $(document).find(".cover").children("#msg_instruction").show();

        //bind keyboard event
        document.addEventListener("keydown", function(){
            
            // clear any unfinished timeout animation
            _flipper.stopFrame();
        
            if (event.code === "ArrowRight"){ //next
                _flipper.play_nextFrame();
            }
            else if(event.code === "ArrowLeft"){ //previous
                _flipper.play_prevFrame();
            }
            
        }); //keyevent listener
        
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
            // TODO: alert_msg function will not work
            //       due to removal of the alert container
            // alert_msg("Retrieving more frames")
            add_strips(data);
            // alert_msg("More frames retrieved")
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
        var last_frame = $frameView.find('img.frame_item').last()
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