export {spotifyInit, requestAuthorization, getPlaylist, playDemo};
"use strict";

const URL_AUTHORIZE = '';
const SPOTIFY_PLAYER_ACCESS_TOKEN = "BQAdQGXq-Ks6uQQ4Ba1FjvTrvXB_RD0dVxMkket7Foouj4JbbVhW5TAXSX9xJP4ESDhm7cSUxK-fFlFTcBsE7drdRkhcjiO_WCMeojAHMGjoCN7xOPQfN45OandigyHbDarDxKnAfJ4Zs0pbWblzqemWlP4h6x8ukrW5ow";
let accessToken = " ";
let redirect_uri = "https://people.rit.edu/rep4975/330/HowsItGo/main.html";
let client_id = "27a24f33f6b8467991e0b78665a190e2";
let URL = "";
let deviceId = "47e5af3c94c7031ee18be0132c472e28a020e7d2";
let playlists = [];
let names = [];

function spotifyInit(){
    URL = 'https://accounts.spotify.com/authorize?client_id=' + client_id + '&redirect_uri=' + encodeURIComponent(redirect_uri) + "&scope=user-read-playback-state%20user-modify-playback-state&response_type=token"; 

    let currentURL = window.location.href;
    
    if(currentURL.includes("access_token=")){
        // Get the access token
        let temp = currentURL.split('=')[1];
        temp = temp.split('&')[0];
        accessToken = temp;
        console.log("Received spotify access token: " + accessToken);
    }
    else if(currentURL.includes("error")){
        let temp = currentURL.split('=');
        console.log("Error receiving spotify access token: " + temp[1]);
    }
    else{
        let authorizeBtn = document.querySelector("#authorizeSpotifyBtn");
        authorizeBtn.onclick = function(event){requestAuthorization();};
        authorizeBtn.hidden = false;
    }
}

window.onSpotifyWebPlaybackSDKReady = () => {

    // ONLY FOR WHEN TESTING WITHOUT AUTHENTICATION KEY
    return;

    const token = SPOTIFY_PLAYER_ACCESS_TOKEN;
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(token); }
    });
  
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      deviceId = device_id;
    });
  
    // Connect to the player!
    player.connect();
  };

// Redirects to the spotify authorization page
function requestAuthorization(){
    window.location.href = URL;
}

// Gets playlists from Spotify
function loadPlaylists(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(response){
            let items = response.items;
            for(let i = 0; i < items.length; i++){
                playlists.push(items[i].href, items[i].id, items[i].name);
                names.push(items[i].name);
            }
        }
    });
}

// Returns the playlists that have been loaded
function getPlaylist(){
    if(playlists.length == 0)
        // loadPlaylists();
    names = ["Drake v. Meek", "Chill", "Music TBT"];
    return names;
}

// General function for accessing spotify api
function accessSpotifyAPI(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(response){
            console.log("success");
        }
    });
}

let audioObject = null;

function playDemo(){
    $.ajax({
   url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
   type: "PUT",
   data: '{"uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]}',
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken );},
   success: function(data) { 
     console.log(data)
   }
  });
    // fetchTrack("4aawyAB9vmqN3uQ7FjRGTy", function(data){
    //     audioObject = new Audio(data.tracks.items[0].preview_url);
    //     audioObject.play();
    //     audioObject.addEventListener('ended', function(){

    //     });
    //     audioObject.addEventListener('pause', function(){

    //     });
    // });
}

function fetchTrack(albumId, callback){
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(response){
            callback(response);
        }
    });
}

class Playlist{
    constructor(link, id, name){
        this.link = link;
        this.id = id;
        this.name = name;
    }
}