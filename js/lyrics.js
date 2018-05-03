export {search};
"use strict";

const URL = "https://orion.apiseeds.com/api/music/lyric/";
const APIKEY = "8Knc0kGlVK7E5KGLLP1P0UHOBt6Hm5mZxXfy7ok1Z3ygTxGJPs1xdgBZT4FLmgbD";

// Search a title/artist lyrics
function search(){
   $("#content").html(" ");
    let title = $("#title").val();
    let artist = $("#artist").val();
    
    if(!title || !artist) {
        $("#content").text("You must provide a title AND artist");
        return;
    }

    let type = "GET"; // form.method
    let url = URL + artist.replace(" ", "%20") + "/" + title.replace(" ", "%20") + "?apikey=" + APIKEY; // form.action
    let data = {};

    ajax(type, url, data, function(response, xhr){
        jsonLoaded(response);
    });
}

function search(artist, title){
    let type = "GET";
    let url = URL + encodeURIComponent(artist) + "/" + encodeURIComponent(title) + "?apikey=" + APIKEY;
    let data = {};

    ajax(type, url, data, function(response, xhr){jsonLoaded(response);});
}

// ajax for lyrics
function ajax(type, url, data, callback){
    
    let xhr = new XMLHttpRequest();
    xhr.open(type, url);

    if(type=='POST'){
        xhr.setRequestHeader("Content-type", "application/json");

        if(typeof data == 'object'){
            data = JSON.stringify(data);
        }
    }

    xhr.send(data);
    xhr.onreadystatechange = function(){
        let DONE = 4;
        if(xhr.readyState == DONE){
            if(!xhr.responseText){
                callback(null, xhr);
            }
            else{
                callback(JSON.parse(xhr.responseText), xhr);
            }
        }
    }
}

// for lyrics
function jsonLoaded(obj){
    // console.log("Obj stringified: " + JSON.stringify(obj));

    if(obj.result != null){

        let result = obj.result;
        let track = result.track;
        let lyrics = track.text;

        let lineBreaks = lyrics.replace(new RegExp('\r?\n','g'), '<br />');


        $("#content").html(lineBreaks);
    }
    else{
        $("#content").html("<strong><em>Sorry that song was not found! Please check to make sure the title and artist input was correct</em></strong>");
    }
}