/* global $ */
/* global jQuery */

class AJAXImageHandler {
    
    constructor(stripId) {
        //Handles ajax calls for grabbing image from frame objects
        this.stripId = stripId ? Number(stripId) : -1;
        this.$cellContainer;
    }
    
    // ------------------------------
    // Methods
    // ------------------------------
    ajaxFrameCellLoad(frameId){
        
        if (!frameId || !Number(frameId)>0){
            return;
        }
        
        // Extract properties
        var $cellContainer = this.$cellContainer;
        
        var loadFrameResp = window.flipbookLib.getJSONPartial(
            '/api/frame/'+ frameId,
            'GET',
            'json'
        );
        
        loadFrameResp.success(function(data){
            console.log("image retrieved: " + data['frame_image']);
            // This function assumes the container for the cell image is 
            // already provided. This is because the timing of .success
            // is not reliable to match the actual order of the frame. 
            // var frameId = data['id'];
            // var frameCell = $('<img/>');
            //     frameCell.attr('src', data['frame_image']);
            //     frameCell.appendTo($cellContainer.find('.cell[id='+frameId+']'));
            // TODO: 
            // OH NO these are not thumbnails. These are actual iamges T_T 
        }); 
       
    }

    
}