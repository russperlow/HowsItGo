export {spotifyInit, requestAuthorization, getPlaylist, playDemo, getPlaylistSongs};
"use strict";

const URL_AUTHORIZE = '';
const SPOTIFY_PLAYER_ACCESS_TOKEN = "BQAPZHccI5MqUYSeT4CTD2PccgNalIC5A3CI92y56Fo-9fnJ7w7q83Pbs5YhN1ZqGuBYMYzUWZ88p0tBH5JcyJzFspv3cPOMa60rTZtwBu6lCA8OtlLRiOKhKdNfXMH00OpghJXqIE4yjAUhFowu_yn-Brcjvbg1EXWS3g"; // Special Playback SDK id
let accessToken = " ";
let redirect_uri = "https://people.rit.edu/rep4975/330/HowsItGo/main.html";
let client_id = "27a24f33f6b8467991e0b78665a190e2"; // My client ID for authorization
let URL = "";
let deviceId = "47e5af3c94c7031ee18be0132c472e28a020e7d2"; // id of the device this is running on 
let user_id = ""; // The id of the user who signed in
let display_name = ""; // The display name of the user who signed in
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

        accessSpotifyAPI();
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
    // return;

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
function loadPlaylists(callback){

    // TESTING PURPOSES ONLY
    // playlists.push(new Playlist("link1", "342lnf423q", "Drake v. Meek"));
    // playlists.push(new Playlist("link2", "gsfdgsdh43", "Chill"));
    // playlists.push(new Playlist("link3", "h5634jjehg", "Music TBT"));
    // return;

    $.ajax({
        url: 'https://api.spotify.com/v1/me/playlists',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(response){
            let items = response.items;
            for(let i = 0; i < items.length; i++){
                playlists.push(new Playlist(items[i].href, items[i].id, items[i].name));
                names.push(items[i].name);
            }
            callback(playlists);
        }
    });
}

// Returns the playlists that have been loaded
function getPlaylist(callback){
    if(playlists.length == 0){
        loadPlaylists(callback);
    }
    else{
        callback(playlists);
    }
    // return playlists;
}

function getPlaylistSongs(playlist_id){
    let currentPlaylist;

    for(let i = 0; i < playlists.length; i++){
        if(playlists[i].id == playlist_id){
            currentPlaylist = playlists[i];
            break;
        }
    }

    $.ajax({
        url: 'https://api.spotify.com/v1/users/' + user_id + "/playlists/" + playlist_id + "/tracks",
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(response){
            populatePlaylist(response, currentPlaylist);
        }
    });
}

function populatePlaylist(obj, currentPlaylist){
    let items = obj.items;
    let songs = []
    for(let i = 0; i < items.length; i++){
        let track = items[i].track;

        let album = track.album.name;
        let artist = track.artists[0].name;
        let id = track.id;
        let link = track.href;
        let title = track.name;

        songs.push(new Song(link, id, title, artist, album));
    }
    currentPlaylist.loadSongs(songs);
}

// General function for accessing spotify api
function accessSpotifyAPI(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        success: function(response){
            user_id = response.id;
            display_name = response.display_name;
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
        this.songs = [];
        // this.songs = [new Song("link1", "id123", "Title 1", "Artist 1", "Album 1"), new Song("link2", "id456", "Title 2", "Artist 2", "Album 2")];
    }

    loadSongs(songs){
        this.songs = songs;
    }
}

class Song{
    constructor(link, id, title, artist, album){
        this.link = link;
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
    }
}