/* global $ */
/* global jQuery */

class FlipHandler{
    
    constructor($frameScrubber, $timer) {
        this.t_step = 400; //default step size in ms 
        
        // Use this variable to distinguish prevFrame() action is done to rewind
        // or to jump to the previous strip.
        // "true" = there is a rewinded strip in queue for play
        this._rewinded = false; 
        
        // Array with SetTimeOut event objects
        this._setTimeOutArr = new Array();
        
        // DOM obj references
        this.$currStrip = -1;
        this.$frameScrubber = $frameScrubber || false;
        this.$timer = $timer || false; 
        
    }
    
    // http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Play%0APrevious
    //   _____         _______ __   __                              
    //  |_____] |      |_____|   \_/                                
    //  |       |_____ |     |    |                                 
                                                                 
    //   _____   ______ _______ _    _ _____  _____  _     _ _______
    //  |_____] |_____/ |______  \  /    |   |     | |     | |______
    //  |       |    \_ |______   \/   __|__ |_____| |_____| ______|
    
    // Use this variable to distinguish prevFrame() action is done to rewind
    // or to jump to the previous strip
    //var _rewinded = false;
    
    // No animation, simply jump to last frame of previous strip
    play_prevFrame(){
        
        var $currStrip = this.$currStrip;
        
        // identify previous strip to show
        if ($currStrip != -1){
            
            // Rewind? or Grab prev? 
            if (this._rewinded){
                // GOTO PREVIUOS STRIP
                
                //unstage currStrip
                this.unstageStrip($currStrip);
            
                var $tempPrevStrip = $currStrip.prev(".strip");
                if ($tempPrevStrip.length > 0 && $tempPrevStrip.attr("class") == "strip"){
                    $currStrip = $tempPrevStrip;
                    this.stageStrip($currStrip);
                } else {
                    $currStrip = -1; //reset
                }
    
            } else {
                // STAY ON STRIP, but REWIND
                console.log("REWIND");
                this.resetStrip($currStrip);
                
                this._rewinded = true;
       
            }
            
            //Update timer. Small icon right beneath the main stage
            this.updateTimer($currStrip);
            this.updateScrubberFill($currStrip);

        } else { 
            // User at the beginning. Do Nothing.
            return; 
        }
        
        // Remember the current strip, whatever happened to it.
        this.$currStrip = $currStrip;
    }
    
    
    
    // http://patorjk.com/software/taag/#p=display&f=Cyberlarge&t=Play%0ANext
    //   _____         _______ __   __
    //  |_____] |      |_____|   \_/  
    //  |       |_____ |     |    |   
                                   
    //  __   _ _______ _     _ _______
    //  | \  | |______  \___/     |   
    //  |  \_| |______ _/   \_    |   
                                   
    play_nextFrame(){
        
        var t_step = this.t_step;
        var $currStrip = this.$currStrip;

        var timeline = [];
       
        // Play Current? or Grab next?
        if ($currStrip == -1){
            //No currStrip. Select the first one in the queue
            $currStrip = $(document).find(".frame_load").find(".strip").eq(0);
        } else  {
            if (!this._rewinded){
                // Grab next one if not in rewinded state
                var $nextStrip = $currStrip.next(".strip");
                if ($nextStrip.length <= 0){
                    console.log("NO MORE STRIP");
                    return;
                }
                $currStrip = $currStrip.next(".strip");
            }
        }       
        
        this._rewinded = false; // undo rewinded state because strip will be played
        
        
        // a. Update timer and scrubber Fill
        this.updateTimer($currStrip);
        this.updateScrubberFill($currStrip);
        // b. Reset visibility of current strip's frames
        this.resetStrip($currStrip);
        // c. Unstage every strip
        $(document).find(".strip").css("z-index", 1); 
        // d. except the current strip. Stage's z-index is 1000
        this.stageStrip($currStrip);
        
        // e. get "timeline"
        console.log("Playing strip " + $currStrip.attr("stripid") + ", has " + $currStrip.children(".frame_item").length + " frames");
        timeline = this.get_timeline($currStrip.children(".frame_item").length, t_step);
        console.log("----------Timeline GET: " + timeline);
        
        //set chain of setTimeOuts
        // It must be done in reverse, because item that is spawned the latest is on top
        var total = $currStrip.children(".frame_item").length-1;
        var thisObj = this; 
        $currStrip.children(".frame_item").each(function(index){
            if (index > 0) {
                // Add reference to stop it later
                thisObj._setTimeOutArr.push(setTimeout(thisObj.playFrame.bind(thisObj, $(this)), timeline[total-index]));
            }
        });
        
        // f. fill the first timer icon
        this.$timer.find('.frame_icon').eq(0).addClass('on');

        // Remember the current strip, whatever happened to it.
        this.$currStrip = $currStrip;
        console.log($currStrip.attr("stripid"));
        
    }
    
    
    
    //makes "timeline" for setTimeOut for reach items
    get_timeline(count, delay){
        if (delay == undefined){
            delay = 0;
        }
        var timeline = [];
        
        for (var i=0; i<count-1; i++){
            timeline.push(this.t_step*i + delay);
        }
        return timeline
    }
    
    
    // 'Plays the frame by hiding the given frame_obj, revealing the
    // one right beneath it. It creates an illusion of image update.
    playFrame(frame_obj){
    
        frame_obj.hide();
        
        //update timer
        // Note: frame_obj is spawned in document in reverse order 
        var reverseCount = frame_obj.parent().find('.'+frame_obj.attr("class")).index(frame_obj);
            reverseCount = Number(reverseCount)*(-1);
 
        this.$timer.find('.frame_icon').eq(reverseCount).addClass('on');
        
    }
    
    // Clears all setTimeout objects in the array
    stopFrame(){

        for(var i=0;i<this._setTimeOutArr.length;i++){
            clearTimeout(this._setTimeOutArr[i]);
        }
        
        // Dump array
        // the array only gets new entry in play_nextFrame()
        this._setTimeOutArr = new Array();
        
    }
    
    updateTimer(currStrip){
        var $timer = this.$timer;
        var $currStrip = currStrip || this.$currStrip;
        
        $timer.html('');
        
        if ($currStrip != -1){
            var stepCount = $currStrip.children('img').length;
            console.log("update timer: " + stepCount + " frames");
            for (var i=0; i<stepCount; i++){
                $('<span class="frame_icon"></span>').appendTo($timer);
            }
        }
        return;
       
    }
    
    updateScrubberFill(currStrip){
        var $currStrip = currStrip || this.$currStrip;
        var $frameScrubber = this.$frameScrubber;
        
        if ($currStrip == -1){
            $frameScrubber.children('.cell_fill').css('width', '0%');
            return;
        }
    
        var stripIndex = $currStrip.parent().find('.strip').index($currStrip);
        var stripCount = $frameScrubber.find('.cell').length;
        var percentWatched = ((stripIndex+1)/stripCount)*100;
        
        $frameScrubber.children('.cell_fill').css('width', percentWatched.toString()+'%');
    
    }
    
    resetStrip($currStrip){
        $currStrip.find('img').show();    
    }
    
    unstageStrip(strip_obj){
        strip_obj.css("z-index", 1);
    }
    
    stageStrip(strip_obj){
        strip_obj.css("z-index", 1001);
        strip_obj.find('.frame_item').show();
    }
}