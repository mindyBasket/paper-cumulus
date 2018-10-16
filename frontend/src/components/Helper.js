"use strict"; 

class Helper {

	getRandomStr(len){
		return (Math.random() + 1).toString(36).substring(len);
	}
	

	serializeForm($form){
        // Note: this does NOT RETURN FORMDATA. It just returns an object.

        //make sure it's a form
        if ($form.nodeName != 'FORM'){return false}

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


    reorderFrames(strip){
        // get list of frames and sort and list
        // returns list of frame objects in order referencing children_li

        // TODO: this is EXACT copy of reorderFrames inside Cards.js
        //       PLUS this function remove frames that have 'ignored' == true


        if(!strip.hasOwnProperty("frames") || strip.frames.length == 0){
            return []
        }
        if (!strip.hasOwnProperty('children_li') || !strip.children_li || strip.children_li.trim() == ''){
            // no children_li. Return frame array as is
            console.warn("No valid children_li");
            return strip.frames
        }

        const frameIdList = strip.children_li.split(",");
        if (!frameIdList || frameIdList==='') {return strip.frames;}

        let frameOrderedArr = Array.apply(null, Array(frameIdList.length));
        let frameLeftOver = [];

        strip.frames.forEach((f)=>{
            if (!f.ignored){
                const insertAt = frameIdList.indexOf(String(f.id));

                if (insertAt>=0 && insertAt<frameOrderedArr.length){
                    frameOrderedArr[insertAt] = f; 
                } else if (insertAt==-1){
                    frameLeftOver.push(f);
                }
            }
            
            
        });

        // children not ref'd in children_li is just placed at the end
        if (frameLeftOver.length>0){
            frameOrderedArr.push(...frameLeftOver);
        }

        console.warn("Reordered frames with: " + frameIdList);
        console.warn(JSON.stringify(frameOrderedArr));
        return frameOrderedArr;
    }


}



export default Helper;