/* global $ */
/* global jQuery */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable

// Namespace for Flipbook project
var flipbookLib = window.flipbookLib = {};


// Struct factory example
function makeStruct(names) {
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i];
    }
  }
  return constructor;
}

var Item = makeStruct("id speaker country");
var row = new Item(1, 'john', 'au');
//alert(row.speaker); // displays: john





// lightbox object
class LightBox {
    constructor() {
        this.clickEventFunc = function(){console.log("lightbox clicked")};
        
        this.template = `<div id="light_box_cover">
                        </div>
                        `;
        this.modalTemplate = `<div id="light_box_modal">
                              </div>
                              `;
        
        var $lightBoxCover = $(this.template).appendTo('body');
        this.$obj = $lightBoxCover;
        this.$obj.hide(); // hidden by default
        
        $lightBoxCover.click(function(){
            $(this).data("obj").turnOff(); //default behavior
            var func = $(this).data("clickEventFunc");
            func();
        });
        $lightBoxCover.data(
            "obj", this,
            "clickEventFunc", this.clickEventFunc);
    }

   // Getter
    //   get area() {
    //     return this.calcArea();
    //   }
   
    
    // Method
    setClickEventFunc(func){
        this.$obj.data("clickEventFunc", func);
        this.clickEventFunc = func;
    }

    turnOn(){
        var $lb = this.$obj;
        $lb.css( "opacity", 0);
        $lb.fadeTo(200, 1);
    }
    
    turnOff() {
        var $lb = this.$obj;
        $lb.fadeTo(200, 0, function(){
            $(this).hide();
        })
    }

}


class Spinny {
    constructor() {
        this.template = `
                            <div class="spinny">
                                <span></span>
                            </div>
                        `;
        this.defaultBackground = "#e5e5e5";
        this.defaultWidth = "100%";
        this.defaultHeight = "100%";
    }
    
    // Method
    appendSpinnyTo($target, css_options, clearHtml){
        if ($target instanceof jQuery == false){
            console.error("Cannot append to non-Jquery object.");
            return;
        }
    
        clearHtml = typeof(clearHtml) === 'boolean' ? clearHtml : clearHtml || true;
        if (clearHtml){
            $target.html('');
        }
        
        var $spinny = $(this.template);
        
        if (css_options){
            $spinny.css(css_options)
        }
        
        // Apply default to properties that was not set by css_options
        if (!cssDictHasKeyword(css_options, "background")){
            console.warn("spinny's background set to default");
            $spinny.css("background-color", this.defaultBackground);
        }
        if (!cssDictHasKeyword(css_options, "width")){
            console.warn("spinny's width set to default");
            $spinny.css("width", this.defaultWidth);
        }
        if (!cssDictHasKeyword(css_options, "height")){
            console.warn("spinny's height set to default");
            $spinny.css("height", this.defaultHeight);
        }
        
      
        
        $target.append($($spinny));
    }

}






// Popup menu
// This object relies on the fact that the popup menu is already on the page.
// The HTML object that is the popup menu is useless/inactive until this 
// object picks it up.

class PopupMenu {
    constructor($popupInitObj, popupObjType){
        // if template is not provided, it will look for partial rendered
        // right on the current page.
        
        if ($popupInitObj && $popupInitObj instanceof jQuery){
            
            if (popupObjType === "partial"){
                this.$menu = $popupInitObj;
                // hide popup if user click else where
                // This behavior is currently only for default partial popup
                this.$menu.focusout(function(){ $(this).hide() });
            } else
            if (popupObjType === "template"){
                //use template to make new one
                this.$menu = $popupInitObj.clone();
                this.$menu.css("z-index","1000");
            }
            else {
                console.warn("Popup init object's type provided ("+popupObjType+") is not valid");
            } 
        }

        this.active = this.$menu ? true : false;
        if (!this.active) { console.warn("Popup menu could not initialized to be active."); }
        this.relatedElement = [];
        
        // lightbox relationship
        this._lightBox;
        
    }
    
    // set _lightBox(lb){
    //      Warning: anything set using setter doesn't work like a 
    //      normal property. So you can't retrieve obj._lightbox.
    // }
 
    //methods
    highlightRelated(){
        for(var i=0;i<this.relatedElement.length;i++){
            var currElemDefaultStyle = {};
            var currElem = this.relatedElement[i]
                currElemDefaultStyle["z-index"] = currElem.css("z-index");
                currElem.css("z-index",1000);
            // element may have opacity applied
            if (currElem.css("opacity") < 1) {
                currElemDefaultStyle["opacity"] = currElem.css("opacity");
                currElem.css("opacity", 1);
            }
            currElem.data(currElemDefaultStyle);
        }
    }
    
    dehighlightRelated(){
        for(var i=0;i<this.relatedElement.length;i++){
            var currElem = this.relatedElement[i];
            // apply default style
            $.each(currElem.data(),function(key,styleVal){ 
                currElem.css(key, styleVal);
            });
        }
    }
    
    popupAt($target, contentIdType){
        
        var _lb = this._lightBox;
        if (this.active){
            if ($target instanceof jQuery == false){
                console.error("Cannot target popup menu non-Jquery object.");
                return;
            }
            
            //Turn on lightbox, if applicable
            if (this._lightBox && this._lightBox instanceof LightBox){
                this._lightBox.turnOn();
                this.highlightRelated();
            }
            
            // move it to the $target and show
            this.$menu.appendTo($target);
            this.$menu.show();
            this.$menu.focus(); // allows it to disappear when you click else where
            
            // Update tag information about current frame
            // TODO: currently assumes $target has attribute 'frameid'.
            //       this is not useful for 'sceneid'.
            
            var contentId = $target.attr("frameid");
            if (contentIdType){
                var parentWithContentId = crawlOutUntilAttribute($target, contentIdType);
                if (parentWithContentId){
                    contentId = parentWithContentId.attr(contentIdType);
                }
            }
            
            if (!contentId){
                console.warn("Could not extract content id");
            }
            this.$menu.attr("for", contentId);
            this.$menu.children(".header").children("span").text(contentId);
        
        } else { 
            console.log("Popup menu currently not active");
        }
        
    } //end: popupAt()
    
    
    removePopup(){
        this.$menu.remove();
        if (this._lightBox && this._lightBox instanceof LightBox){
            this._lightBox.turnOff();
        }
        this.dehighlightRelated();
    }
    
    
    appendContent(content){
        //just as it sounds, using jquery append();
        this.$menu.children('.content').append(content);    
    }
    
    cleanContent(){
        // assuming popup menu comes with .content div, empty it.
        this.$menu.children('.content').html('');
    }
    
    dislodge(){
        // Popup menu elements are nested inside delete-able containers.
        // Before the element is deleted, make sure the popup menu is
        // dislodged somewhere safe, like 'body'.
        this.$menu.appendTo('body');
    }
}










// Generic error message when making API call
var logAJAXErrors = function(data, url){
    var urlMsg = url ? ' calling to : ' + url : '';
    console.error('Error ' + data.status + ' occurred' + urlMsg);
    console.error(data);
};

flipbookLib.logAJAXErrors = logAJAXErrors


// JSON partial retriever
// Returns ajax object 
flipbookLib.getJSONPartial = function(url, method, dataType, beforeSendFunc){
    if (!url){
        console.error('You must provide URL to getJSONPartial()');
    }
    var method = method || 'GET';
    var dataType = dataType || 'json';
    
    console.log("Variable check: " + JSON.stringify({'url':url, 'method':method, 'dataType': dataType}));
    
    return $.ajax({
        url: url,
        method: method,
        dataType: dataType,
        beforeSend: function () {
            if (beforeSendFunc){beforeSendFunc();}
        },
        error: function (data) {logAJAXErrors(data, url)}
    });
}

// Submits form ajaxly
// Returns ajax object
flipbookLib.submitFormAjaxly = function($form, url, settings, beforeSendFunc){
    if (!url){
        console.error('You must provide URL to submitFormAjaxly()');
    }
    
    // set defaults
    // var dataType; //leave it to intelligent guess 
    var method = settings['method'] || 'POST';
    //var enctype // this doesn't exist?? it's basically contentType
    var processData = settings['processData'];
    var contentType = settings['contentType'];
    processData = typeof(processData) === 'boolean' ? processData : processData || true;
    contentType = typeof(contentType) === 'boolean' ? contentType : contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
    // contentType = "multipart/form-data"
    
    // Serialize data
    // Note: from observation, use '$(this).serialize()'' for text-based data, 
    //       use 'new FormData($(this)[0]);' for multipart. If not, it fails
    //       upon request. 
    var formData;
    if ($form instanceof jQuery){
        formData = $form.serialize();
        if (contentType == false || contentType == 'multipart/form-data'){
            formData = new FormData($form[0]);
        }
    } else {
        // Form data may be already serialized or extracted.
        // This happens if something in the form had to be manually appended.
        console.log("Manually appended form data");
        formData = $form;
    }
    
    if (!formData){
        console.error("Could not submitFormAjaxly. Form data is empty.");
        return;
    }
    
    console.log("Arg check: " + JSON.stringify({
        'url':url, 
        'method': method, 
        'data': JSON.stringify(formData),
        'processData': processData,
        'contentType': contentType
    }));
    
    
    return $.ajax({
        url: url,
        data: formData,
        method: method,
        processData: processData,
        contentType: contentType,
        beforeSend: function () {
            if (beforeSendFunc){beforeSendFunc();}
        },
        error: function (data) {logAJAXErrors(data, url)}
    });
    
}


function crawlOutUntilAttribute($start, attrname){
    
    var $nextParent = $start.parent();
    
    while ($nextParent.is('body') != true){
        if ($nextParent[0].hasAttribute(attrname)){
            return $nextParent;
        } else {
            $nextParent = $nextParent.parent();}
    }
    return false;
} //end: crawlOutUntilAttribute


// Checks if key exists in a dictionary of css rules.
// It will return true even if the key contains the provided keyword.
// ex) keyword = "width" will return true if one of key is "max-width"
function cssDictHasKeyword(dict, keyword){
    var cssProps = Object.keys(dict);
    
    for(var i=0;i<cssProps.length;i++){
        if (cssProps[i].indexOf(keyword) >= 0){
            return true;
        }
    }
    
    return false;
}