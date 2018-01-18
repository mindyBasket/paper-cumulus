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


//JSON partial retriever

// Generic error message when making API call
var showGenericAJAXErrors = function(data, url){
    var urlMsg = url ? ' calling to : ' + url : '';
    console.error('Error ' + data.status + ' occurred' + urlMsg);
    console.error(data);
};

flipbookLib.showGenericAJAXErrors = showGenericAJAXErrors

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
        error: function (data) {showGenericAJAXErrors(data, url)}
    });
}

