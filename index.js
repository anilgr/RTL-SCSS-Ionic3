fs = require('fs');
var path = require('path');
var Parser = require('./jsonparser');
var srcDir = '/Users/anil/Projects/mobileapp/transport_latest/src/';
var pageKey = "";
var langFilePath = "/Users/anil/Projects/mobileapp/transport_latest/src/assets/i18n/en.json";
var langFileContent = fs.readFileSync(langFilePath, 'utf8');
var en_json = JSON.parse(langFileContent);
(function () {
    var param = process.argv[2];
    if(param === "updatedata"){
        updateLangFile();
    }
    else if(param === "-scss"){
        updatescss(srcDir, process.argv[3]+".scss");
    }
    else
    {
      pageKey = param.split('-').join('_');
      getPath(srcDir, param+".html");
    }


    
    // console.log(content);

})()


function updatescss(startPath, filter) {
//    console.log("path:"+startPath);
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }
    var filename = "";
    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        // console.log(filename.slice(filename.lastIndexOf('/')))
        if (stat.isDirectory()) {
            updatescss(filename, filter); //recurse
        }
        else if (filename.slice(filename.lastIndexOf('/')+1).indexOf(filter) == 0) {
            console.log('-- found: ', filename);
            rewritescss(filename);
            return;
        };
    };
};

function rewritescss(path){
    if (!path || path === "") return;
    var content = fs.readFileSync(path, 'utf8');
    let temppath = path.slice(0,path.lastIndexOf('.'))+"_backup.scss";
    fs.writeFileSync(temppath, content);
    var jsoncontent;
    (async () => {

        content = await content.replace(/\/\*.+\*\//g, function replacer(match) {

            // console.log(match);
            return ""
        });
        content = await content.replace(/\/\/.*/g, function replacer(match) {
            // console.log(match);
            return ""
        });
        content = await content.replace(/}/g, function replacer(match) {

            // console.log(match);
            return "},"
        });
        content = await content.replace(/}[,.\s]+}/g, function replacer(match) {

            // console.log(match);
            return "}\n}"
        });
        content = await content.replace(/,\s+$/g, function replacer(match) {

            // console.log(match);
            return ""
        });
        //[^\s]?(.+): (.+;)
        content = await content.replace(/[^\s]?(.+):\s?(.+;)/g, function replacer(match, $1, $2) {
            $2 = $2.replace(/"/g, "'");
            return '"' + $1.trim() + '":' + '"' + $2.trim() + '",';
        });
        // console.log(content)
        //[^\s]?(.+){
        content = await content.replace(/([^\s]?.+){/g, function replacer(match, $1) {
            $1 = $1.replace(/"/g, "'");
            return '"' + $1.trim() + '":' + '{';
        });
        content = await content.replace(/,\s*}/g, function replacer(match) {

            // console.log(match);
            return "}"
        });
        content = await content.replace(/,\s*$/g, function replacer(match) {

            // console.log(match);
            return ""
        });
        console.log("{" + content + "}")
        console.log("\n\n\n\n\n")
        var p = new Parser();
        p.parser.path = path;
        p.parser.write("{" + content + "}").close();

        return;

        
    })()
}


function getPath(startPath, filter) {

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }
    var filename = "";
    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            getPath(filename, filter); //recurse
        }
        else if (filename.indexOf(filter) >= 0) {
            console.log('-- found: ', filename);
            replace(filename);
            return;
        };
    };
};

function updateEnJson(page, key, val) {
    if (!en_json[page]) en_json[page] = {};
    en_json[page][key] = val;

}

async function replace(path) {
    if (!path || path === "") return;
    var REGEX = />([^{}<>]+)<\//g;

    var fileContent = fs.readFileSync(path, 'utf8');

    fileContent = await fileContent.replace(REGEX, function replacer(match, $1) {

        if ($1 === null || $1.match(/^\s*$/) !== null)
            return match;
        // console.log('matched sub group :'+$1.trim())
        console.log();
        console.log("match:  " + match)
        let key = $1.trim().toLowerCase().split(" ").join('_');
        let val = $1.trim();
        updateEnJson(pageKey, key, val);
        console.log(key + ": " + val)
        return ">{{ '" + pageKey + "." + key + "' | translator }}</";
    });

    fs.writeFileSync(path, fileContent);
    fs.writeFileSync(langFilePath, JSON.stringify(en_json));
}

function updateLangFile() {
    var fileContent = fs.readFileSync('/Users/anil/Projects/fedena_connect_client_develop/src/assets/i18n/en.json', 'utf8');
    var jsonContent = JSON.parse(fileContent);
    walk(jsonContent);
    console.log(jsonContent);
    fs.writeFileSync('/Users/anil/Projects/fedena_connect_client_develop/src/assets/i18n/jp.json', JSON.stringify(jsonContent));

}
function walk(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var val = obj[key];
            if (typeof val == 'object') walk(val);
            else obj[key] = getRandomJpString(val);
        }
    }
}
function getRandomJpString(ref) {
    
    let data = "嫁行語堀開数防学視普白記禁読陽供児未会表員響士近販港神格人批初変負定海決図真運夜保的絶済奏置妨北感合役観担回訟掲将任沼逆治基科細変";
    let newstr = "";
    let charlimit = 9;
    for (i = 0; i < ref.length; i++) {
        let char = "";
        if (charlimit > 0) char = data.charAt(Math.floor(Math.random() * data.length));
        else if (ref.charAt(i) === " " || ref.charAt(i) === "-") {
            char = " ";
            charlimit = 5;

        }
        else continue;
        newstr += char;
        charlimit--;
    }
    return newstr;
}
