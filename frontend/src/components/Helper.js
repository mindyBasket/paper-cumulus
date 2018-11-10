"use strict"; 

class Helper {

	getRandomStr(len){
		return (Math.random() + 1).toString(36).substring(len);
	}

    calcHeight(defaultWidth, dimension, heightIfFail){
        // TODO: this function only accepts dimension in String, 
        //       in a form of "[num]x[num]". Do I need to be more flexible?

        const di = dimension.split("x");
        let isError = false;
        let h;

        if(dimension != '' && di.length >= 2){
            try {
                h = Math.round( (defaultWidth*di[1])/di[0] );
            } catch(err){
                console.error("Height could not be calculated: " + err);
                isError = true;
                //return false;
            }
        } else { isError = true; } 

        const DEFAULT_HEIGHT = 100;
        if (isError){ return (heightIfFail === undefined ? DEFAULT_HEIGHT : heightIfFail);}
        else { return h;}

    }
	
    getTotalStripCount(data){
        // Assumes data is either array of Scene object, or a single Scene object. 
        // TODO: make this a better search

        if (Array.isArray(data)){
            // many scenes
            let count = 0; 
            for (let i=0;i<data.length;i++){
                if (data[i].hasOwnProperty('strips')) {
                    count+=data[i]['strips'].length;
                }
            }
            return count;

        } else {
            if (data.hasOwnProperty('strips')){
                return data['strips'].length;
            } else {
                return 0;
            }
        }


    }

	serializeForm($form){
        // Note: this does NOT RETURN FORMDATA. It just returns an object.

        //make sure it's a form
        //if ($form.nodeName != 'FORM'){return false}
        // the node might be a faux form, in that case, it's not a form

        // iterate through each element
        // inputArray
        const ia = $form.querySelectorAll('input, select, textarea, file');
        var formData = {};

        for (var i=0;i<ia.length;i++){
        	formData[ia[i].getAttribute('name')] = ia[i].value;
        }
        
        return formData;
    }


    makeFormData(obj){
        // Turns object into formData
        let formData = new FormData();

        for ( let key in obj ) {
            formData.append(key, obj[key]);
        }

        return formData;
    }

    getUnignoredFrames(strip){
        if(!strip.hasOwnProperty("frames") || strip.frames.length == 0){
            return [];
        }

        let unignoredFrameArr = [];
        strip.frames.forEach((f)=>{
            if(!f.ignored){unignoredFrameArr.push(f)}
        });

        return unignoredFrameArr;
    }

    reorderFrames(strip){
        // get list of frames and sort and list
        // returns list of frame objects in order referencing children_li

        // TODO: this is EXACT copy of reorderFrames inside Cards.js
        //       PLUS this function remove frames that have 'ignored' == true

        console.log("[reorderFrames] strip with frames length: " + strip.frames.length);
        if(!strip.hasOwnProperty("frames") || strip.frames.length == 0){
            console.log("This strip is empty >:C");
            return [];
        }
        if (!strip.hasOwnProperty('children_li') || !strip.children_li || strip.children_li.trim() == ''){
            // no children_li. Return frame array as is
            console.error("No valid children_li");
            return strip.frames;
        }

        const frameIdList = strip.children_li.split(",");
        if (!frameIdList || frameIdList==='') {return strip.frames;}

        let frameNewArr = Array.apply(null, Array(frameIdList.length));
        let frameLeftOver = [];

        let ignoredCount = 0;
        strip.frames.forEach((f)=>{
            if (!f.ignored){
                const insertAt = frameIdList.indexOf(String(f.id));
                if (insertAt>=0 && insertAt<frameNewArr.length){
                    frameNewArr[insertAt] = f; 
                } else if (insertAt==-1){
                    frameLeftOver.push(f);
                }
            } else { ignoredCount++; }
        });

        // Remove empty cells caused by ignored frames
        let frameNewArr_cleaned = [];
        if (ignoredCount>0){
            frameNewArr.forEach((f)=>{
                if(f){frameNewArr_cleaned.push(f)}
            });
        } else {
            frameNewArr_cleaned = frameNewArr;
        }


        // children not ref'd in children_li is just placed at the end
        if (frameLeftOver.length>0){
            frameNewArr_cleaned.push(...frameLeftOver);
        }

        console.warn(`Prepped frame for stripId=${strip.id} : frames of length ${frameNewArr_cleaned.length}`);
        return frameNewArr_cleaned;
    }


}



export default Helper;