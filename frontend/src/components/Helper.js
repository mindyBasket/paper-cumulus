class Helper {
  getRandomStr(len) {
    return (Math.random() + 1).toString(36).substring(len);
  }

  string2List(stringyList) {
    // assumes items are listed with "," only (for now)
    const li = stringyList.split(',');
    return li.map(item => String(item).trim());
  }

  calcHeight(defaultWidth, dimension, heightIfFail) {
    // TODO: this function only accepts dimension in String, 
    //       in a form of "[num]x[num]". Do I need to be more flexible?

    const di = dimension.split('x');
    let isError = false;
    let h;

    if (dimension !== '' && di.length >= 2) {
      try {
        h = Math.round((defaultWidth * di[1]) / di[0]);
      } catch (err) {
        console.error("Height could not be calculated: " + err);
        isError = true;
        // return false;
      }
    } else { isError = true; }

    const DEFAULT_HEIGHT = 100;
    if (isError) { return (heightIfFail === undefined ? DEFAULT_HEIGHT : heightIfFail); }
    else { return h; }

  }

  getTotalSceneCount(data) {
    // For now, data is assumed to be a single Scene object, or many
    if (Array.isArray(data)) {
      // many scenes
      // check first object if it is scene
      if (data[0].hasOwnProperty('strips')) {
        return data.length;
      } else {
        return 0;
      }
    } else {
      if (data.hasOwnProperty('strips')) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  getTotalStripCount(data) {
    // Assumes data is either array of Scene object, or a single Scene object. 
    // TODO: make this a better search

    if (Array.isArray(data)) {
      // many scenes
      let count = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].hasOwnProperty('strips')) {
          count += data[i]['strips'].length;
        }
      }
      return count;

    } else {
      if (data.hasOwnProperty('strips')) {
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

        if(!strip.hasOwnProperty("frames") || strip.frames.length == 0){
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

        // console.warn(`Prepped frame for stripId=${strip.id} : frames of length ${frameNewArr_cleaned.length}`);
        return frameNewArr_cleaned;
    }

    reorderChildren(obj, children_li){
        // This functin accepts two form of "obj". 
        // A. It's an object with children nested inside
        // B. It's an Array of objects. If this is the case, children_li MUST be passed.

        if (Array.isArray(obj) && !children_li){
            console.error("[reorderChildren] children_li is required to order an array.");
            return [];
        }

        let childrenArr = null;
        // get Array of children
        if (children_li){
            console.warn("children_li is passed");
            childrenArr = obj;
        } else {
            // identify what the object is
            let childrenName = null;
            if        (obj.hasOwnProperty("frames")) {
                childrenName = "frames";
            } else if (obj.hasOwnProperty("strips")) {
                childrenName = "strips";
            } else if (obj.hasOwnProperty("scenes")) {
                childrenName = "scenes";
            }

            if (childrenName == null || obj[childrenName].length == 0){
                // object has no valid children
                return [];
            }

            if (!obj.hasOwnProperty('children_li') || !obj.children_li || obj.children_li.trim() == ''){
                // no children_li. Return frame array as is
                console.error("No valid children_li");
                return obj[childrenName];
            }

            // define variable that will be used when reordering
            children_li = obj.children_li;
            childrenArr = obj[childrenName];
        }

        console.log("ChildrenArr extracted. Length = " + childrenArr.length);

        // Check validity of children_li
        const childrenIdList = children_li.split(",");
        if (!childrenIdList || childrenIdList==='') {return childrenArr;}

        // Reorder childrenArr based on children_li
        let childrenNewArr = Array.apply(null, Array(childrenIdList.length));
        let childrenLeftOver = [];

        let ignoredCount = 0;
        childrenArr.forEach((c)=>{
            if (!c.hasOwnProperty("ignored") || (c.hasOwnProperty("ignored") && !c.ignored) ){
                const insertAt = childrenIdList.indexOf(String(c.id));
                if (insertAt>=0 && insertAt<childrenNewArr.length){
                    childrenNewArr[insertAt] = c; 
                } else if (insertAt==-1){
                    childrenLeftOver.push(c);
                }
            } else { ignoredCount++; }
        });

        // Remove empty cells caused by ignored frames
        let childrenNewArr_cleaned = [];
        if (ignoredCount>0){
            childrenNewArr.forEach((c)=>{
                if(c){childrenNewArr_cleaned.push(c)}
            });
        } else {
            childrenNewArr_cleaned = childrenNewArr;
        }

        // children not ref'd in children_li is just placed at the end
        if (childrenLeftOver.length>0){
            childrenNewArr_cleaned.push(...childrenLeftOver);
        }

        // console.warn(`Prepped frame for stripId=${strip.id} : frames of length ${frameNewArr_cleaned.length}`);
        return childrenNewArr_cleaned;
    }


}



export default Helper;