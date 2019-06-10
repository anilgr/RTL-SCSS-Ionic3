// DuplicateKeyDetectingParser.js
// ------------------------------------------------------------------
//
// created: Tue Sep 18 09:32:28 2018
// last saved: <2018-September-18 11:45:39>


// 'use strict';


var clarinet = require("clarinet");
var modJson="";

function Parser() {
  var keystack = [];
  var indent = '';
  var p = this;
  this.duplicateDetected = null;


  var parser = clarinet.parser();
  parser.onvalue = function (v) {
    //  console.log(keystack.pop()+":"+v);
    modJson+='"'+v+'",'
    console.log('"'+v+'",');
  };
  parser.onopenobject = function (key) {
    // opened an object. key is the first key.
    var seenKeys = [];
    seenKeys.push(key);
    keystack.push(seenKeys);
    // if(!key)console.log("this is disaster!!!!!!!!!!!")
    if(key){
        console.log('{"'+key+'":');
        modJson+='{"'+key+'":';
    }
    else{
        console.log('{');
        modJson+='{,';
    }
   
    // console.log("onopenobject:"+key);
  };
  parser.onkey = function (key) {
    var i = keystack.length - 1;
    var seenKeys = keystack[i];
    // got a subsequent key in an object.
    if (seenKeys.indexOf(key) != -1){
      if ( ! p.duplicateDetected) {
        p.duplicateDetected = [];
      }
      p.duplicateDetected.push(key);
    //   console.log("duplicate key:"+key);
    modJson+='"'+key+'$duplicate":';
    }
    else{
        modJson+='"'+key+'":';
    }
    seenKeys.push(key);
    
    console.log('"'+key+'":');
    
    // console.log("onkey:"+key);
  };
  parser.oncloseobject = function () {
    // closed an object.
    keystack.pop();
    indent = ' '.repeat(keystack.length);
    // console.log("oncloseobject:}");
    modJson = modJson.slice(0,modJson.lastIndexOf(','));
    modJson+="},";
    console.log("},")
  };
  parser.onopenarray = function () {
    // opened an array.
  };
  parser.onclosearray = function () {
    // closed an array.
  };
  parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    modJson = modJson.slice(0,modJson.lastIndexOf(','));

    console.log(modJson);
    let jsoncontent = JSON.parse(modJson);
    var scss = "";
    // console.log(JSON.stringify(jsoncontent))
    // console.log("this is it:   ")
    // console.log(jsoncontent['page-event-modal']['.clearfix:after']['content'])
    (() => {
        //convert to rtl compliant scss
        convert2rtl(jsoncontent);
        function convert2rtl(obj, parkey) {
            let mgn_top = null, mgn_end = null, mgn_bottom = null, mgn_start = null;
            let pad_top = null, pad_end = null, pad_bottom = null, pad_start = null;
            let pos_top = null, pos_end = null, pos_bottom = null, pos_start = null;
            let brdr_top_start = null, brdr_top_end = null, brdr_bottom_end = null, brdr_bottom_start = null;
            let brdr_left = null, brdr_right = null;
            let ltr_mxn = "@include ltr(){";
            let rtl_mxn = "@include rtl(){";

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var val = obj[key];
                    if (typeof val == 'object') {
                        convert2rtl(val, key);
                    }
                    else {
                        val = val.replace(";", "");
                        switch (key.trim()) {
                            case "float":
                                if (obj[key].indexOf("left")>=0)
                                    obj['$mixin_flt'] = "@include float(start);";
                                else if (obj[key].indexOf("right")>=0) obj['$mixin_flt'] = "@include float(end);";
                                else obj['$mixin_flt'] = "@include float(none);";
                                delete obj[key];
                                break;
                            case "text-align":
                                if (obj[key] === "left;")
                                    obj['$mixin_txtalgn'] = "@include text-align(start !important);";
                                else if (obj[key] === "right;") obj['$mixin_txtalgn'] = "@include text-align(end !important);";
                                else if (obj[key] === "center;") obj['$mixin_txtalgn'] = "@include text-align(center !important);";
                                else obj['$mixin_txtalgn'] = "@include text-align(justify !important);";
                                delete obj[key];
                                break;
                            case "margin":
                                let mgn_param = obj[key].replace(";", "").split(" ");
                                mgn_top = mgn_param[0] || null;
                                mgn_end = mgn_param[1] || mgn_top;
                                mgn_bottom = mgn_param[2] || mgn_top;
                                mgn_start = mgn_param[3] || mgn_end;
                                delete obj[key];
                                break;
                            case "margin-top": mgn_top = val; delete obj[key]; break;
                            case "margin-right": mgn_end = val; delete obj[key]; break;
                            case "margin-bottom": mgn_bottom = val; delete obj[key]; break;
                            case "margin-left": mgn_start = val; delete obj[key]; break;

                            case "padding":
                                let pad_param = obj[key].replace(";", "").split(" ");
                                pad_top = pad_param[0] || null;
                                pad_end = pad_param[1] || pad_top;
                                pad_bottom = pad_param[2] || pad_top;
                                pad_start = pad_param[3] || pad_end;
                                delete obj[key];
                                break;
                            case "padding-top": pad_top = val; delete obj[key]; break;
                            case "padding-right": pad_end = val; delete obj[key]; break;
                            case "padding-bottom": pad_bottom = val; delete obj[key]; break;
                            case "padding-left": pad_start = val; delete obj[key]; break;
                            case "top": pos_top = val; delete obj[key]; break;
                            case "right": pos_end = val; delete obj[key]; break;
                            case "bottom": pos_bottom = val; delete obj[key]; break;
                            case "left": pos_start = val; delete obj[key]; break;
                            case "border-top-left-radius": brdr_top_start = val; delete obj[key]; break;
                            case "border-top-right-radius": brdr_top_end = val; delete obj[key]; break;
                            case "boborder-bottom-right-radius": brdr_bottom_end = val; delete obj[key]; break;
                            case "border-bottom-left-radius": brdr_bottom_start = val; delete obj[key]; break;
                            case "border-left":
                                brdr_left = val;
                                ltr_mxn += "border-left:" + val + ";\n";
                                rtl_mxn += "border-right:" + val + ";\n";
                                delete obj[key];
                                break;
                            case "border-right":
                                brdr_right = val;
                                ltr_mxn += "border-right:" + val + ";\n";
                                rtl_mxn += "border-left:" + val + ";\n";
                                delete obj[key];
                                break;







                        }

                    }
                }
                if(key.trim().endsWith("$duplicate")){
                    let original_key = key.trim().slice(0,key.trim().lastIndexOf("$duplicate"));
                    obj[original_key] = {...obj[original_key],...obj[key]};
                    delete obj[key];
                }
            }
            if (mgn_top || mgn_end || mgn_bottom || mgn_start) {
                obj['$mixin_mgn'] = "@include margin(" + mgn_top + ", " + mgn_end + ", " + mgn_bottom + ", " + mgn_start + ");";
            }
            if (pad_top || pad_end || pad_bottom || pad_start) {
                obj['$mixin_pad'] = "@include padding(" + pad_top + ", " + pad_end + ", " + pad_bottom + ", " + pad_start + ");";
            }
            if (pos_top || pos_end || pos_bottom || pos_start) {
                obj['$mixin_pos'] = "@include position(" + (pos_top || "initial") + ", " + (pos_end || "initial") + ", " + (pos_bottom || "initial") + ", " + (pos_start || "initial") + ");";
            }
            if (brdr_top_start || brdr_top_end || brdr_bottom_end || brdr_bottom_start) {
                obj['$mixin_brdr_rds'] = "@include border-radius(" + brdr_top_start + ", " + brdr_top_end + ", " + brdr_bottom_end + ", " + brdr_bottom_start + ");";
            }
            if (brdr_left || brdr_right) {
                ltr_mxn += "}";
                rtl_mxn += "}";
                obj['$mixin_ltr'] = ltr_mxn;
                obj['$mixin_rtl'] = rtl_mxn;


            }
            
          

        }

    })()




    wallk(jsoncontent);
    function wallk(obj, parkey) {
        if (parkey) scss += parkey;
        scss += "{\n";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var val = obj[key];
                if (typeof val == 'object') {
                    wallk(val, key);
                }
                else {
                    if (key === "$mixin_rtl" || key === "$mixin_ltr" || key === "$mixin_mgn" || key === "$mixin_pad" || key === "$mixin_flt" || key === "$mixin_txtalgn" || key === "$mixin_pos" || key === "$mixin_brdr_rds") scss += val + "\n";
                    else scss += key + ":" + val + "\n"
                }
            }
        }
        scss += "\n}";


    }
    scss = scss.slice(scss.indexOf('{')+1,scss.lastIndexOf('}'));
    console.log("path----------"+this.path);
    fs.writeFileSync(this.path, scss);


  };

  this.parser = parser;
}


Parser.prototype.status = function() {
  //console.log('status(): ' + JSON.stringify(this.duplicateDetected));
  return this.duplicateDetected;
};


module.exports = Parser;