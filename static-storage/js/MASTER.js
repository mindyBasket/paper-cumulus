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
        console.log("function set: " + this.clickEventFunc);
        
        this.template = `<div id="light_box_cover">
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
                        `
        this.defaultBackground = "#e5e5e5"
    }
    
    
    
    // Method
    appendSpinnyTo($target, css_options, clearHtml){
        if ($target instanceof jQuery == false){
            console.error("Cannot append to non-Jquery object.");
        }
    
        clearHtml = typeof(processData) === 'boolean' ? clearHtml : clearHtml || true;
        if (clearHtml){
            $target.html('');
        }
        
        var $spinny = $(this.template);
            $spinny.css(css_options);
            // default css
            $spinny.css("background-color", this.defaultBackground);
            
        $target.append($($spinny));
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
    var formData = $form.serialize();
    if (contentType == false || contentType == 'multipart/form-data'){
        formData = new FormData($form[0]);
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
    
    
    
    
    $.ajax({
        url: '/api/frame/'+frameId+'/update/',
        data: formData,
        method: 'PATCH',
        //enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        beforeSend: function (){
            console.log($(this));
        },
        success: function (data) {
            var $frameImageContainer = $frameForm.find('#field_frame_image').children('.field_value');
            $frameImageContainer.html('');
            $frameImageContainer.append('<img src="' + data['frame_image_native']+ '"/>');
        }
    });
}

