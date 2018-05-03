export {spotifyInit, requestAuthorization, getPlaylist, playDemo, getPlaylistSongs, playSong, playPlaylist, pauseSong, changeSong};
import {search} from './lyrics.js';

"use strict";

const SPOTIFY_PLAYER_ACCESS_TOKEN = "BQBLG2otHbzxFgjpcnwARttVaM2hx74yrAq0-eSsPAtTpEnKk1EAIkDBR4SPL-brkaldGjflTI_gRUSRLCOKKkPMNTCjMUfaQ4r6Pwpieu9gnfNHXn8uXSDsPxnOSo07ZoBCzONG7ZA2JcH8ateDjsMcF0E38vnh0TuFEw"; // Special Playback SDK id
let accessToken = " ";
const redirect_uri = "https://people.rit.edu/rep4975/330/HowsItGo/main.html";
const client_id = "27a24f33f6b8467991e0b78665a190e2"; // My client ID for authorization
let URL = ""; // The url for getting authorization
let deviceId = ""; // id of the device this is running on 
let user_id = ""; // The id of the user who signed in
let display_name = ""; // The display name of the user who signed in
let playlists = []; // Lists of the users playlists

function spotifyInit(){
    URL = 'https://accounts.spotify.com/authorize?client_id=' + client_id + '&redirect_uri=' + encodeURIComponent(redirect_uri) + "&scope=user-read-playback-state%20user-modify-playback-state%20streaming%20user-read-birthdate%20user-read-email%20user-read-private&response_type=token"; 

    let currentURL = window.location.href;

    $("#pause").hide();

    if(currentURL.includes("access_token=")){
        // Get the access token
        let temp = currentURL.split('=')[1];
        temp = temp.split('&')[0];
        accessToken = temp;
        console.log("Received spotify access token: " + accessToken);

        accessSpotifyAPI();

        $("#authorize").hide();
        $("#playlists").show();
        $("#content").html("<p>To continue please pick a song from one of your playlists and we will show you the lyrics.");
    }
    else if(currentURL.includes("error")){
        let temp = currentURL.split('=');
        $("#content").html("There was an error authorizing your Spotify account. Please try again.");
        console.log("Error receiving spotify access token: " + temp[1]);
    }
    else{
        $("#authorize").show();
        $("#playlists").hide();
        $("#content").html("<h2>Welcome to How's It Go!</h2> <p> In order to proceed, please authorize your Spotify account! </p>");
    }
}

// Redirects to the spotify authorization page
function requestAuthorization(){
    console.log("Authorization");
    window.location.href = URL;
}

// General function for accessing spotify api
function accessSpotifyAPI(){
    ajaxCall('https://api.spotify.com/v1/me', null, function(response){user_id = response.id; display_name = response.display_name;}, "GET");
}

// Gets playlists from Spotify
function loadPlaylists(callback){
    let url = 'https://api.spotify.com/v1/me/playlists';
    let success = function(response){
        let items = response.items;
            for(let i = 0; i < items.length; i++){
                playlists.push(new Playlist(items[i].href, items[i].id, items[i].name));
            }
            callback(playlists);
    };
    ajaxCall(url, null, success);
}

// Returns the playlists that have been loaded
function getPlaylist(callback){
    if(playlists.length == 0){
        loadPlaylists(callback);
    }
    else{
        callback(playlists);
    }
}

// Get songs for the given playlist id
function getPlaylistSongs(playlist_id){
    let currentPlaylist = getPlaylistById(playlist_id);
    let url = currentPlaylist.link + "/tracks";

    ajaxCall(url, null, function(response){populatePlaylist(response, currentPlaylist);});
}

// Add all of the playlist songs to the object
function populatePlaylist(obj, currentPlaylist){
    let items = obj.items;
    let songs = []
    for(let i = 0; i < items.length; i++){
        if(!items[i].is_local){
            let track = items[i].track;

            let album = track.album.name;
            let artist = track.artists[0].name;
            let id = track.id;
            let link = track.href;
            let title = track.name;

            songs.push(new Song(link, id, title, artist, album));
        }
    }
    currentPlaylist.loadSongs(songs);
}

// Play the song using the given song obj
function playSong(song){

    // If the song is -1 that means we are resuming a song
    if(song == -1){
        let url = 'https://api.spotify.com/v1/me/player/play';
        ajaxCall(url, null, function(response){
            $("#play").hide();
            $("#pause").show();
        }, "PUT");
    }
    else{
        let url = 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId;
        let data = '{"uris": ["spotify:track:' + song.id + '"]}';
        let success = function(response){
            $("#songInfo").html("Title: " + song.title + "<br/>Artist: " + song.artist + "<br/>Album: " + song.album);
            search(song.artist, song.title);
            $("#play").hide();
            $("#pause").show();
            console.log(response);
        };

        ajaxCall(url, data, success, "PUT");
    }
}

function playPlaylist(playlist){
    let url = 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId;
    let songs = playlist.songs;

    let data = '{"uris": ["spotify:track:' + songs[0].id;

    for(let i = 1; i < songs.length; i++){
        data += '", "spotify:track:' + songs[i].id;
    }

    data += '"]}';
    let success = function(response){
        console.log("Playlist playing");
        $("#play").hide();
        $("#pause").show();
    };
    ajaxCall(url, data, success, "PUT");
}

// Pauses a song that is playing
function pauseSong(){
    let url = 'https://api.spotify.com/v1/me/player/pause?device_id=' + deviceId;
    let success = function(){
        $("#play").show();
        $("#pause").hide();
        console.log("Paused");
    };
    ajaxCall(url, null, success, "PUT");
}

// Go to the next/previous song
function changeSong(position){
    let url = 'https://api.spotify.com/v1/me/player/'

    // Positive for next, negative for previous
    if(position > 0){
        url += 'next';
    }
    else{
        url += 'previous';
    }

    ajaxCall(url, null, function(response){console.log("Changed Song");}, "POST");
}

// Play the demo song
function playDemo(){
    let url = 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId;
    let data = '{"uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]}';
    ajaxCall(url, data, function(data){console.log(data);}, "PUT");
}

// Simplifies ajax calls into one method instead of having a lot
function ajaxCall(url, data, success, type="GET"){
    $.ajax({
        url: url,
        type: type,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        data: data,
        success: success,
        error: function(xhr, status, error){
            $("#content").html("There was an error accessing Spotify. Error: " + error);
            console.log(error);
        }
    });
}

// Gets the playlist by the matching id
function getPlaylistById(id){
    for(let i = 0; i < playlists.length; i++){
        if(id == playlists[i].id)
            return playlists[i];
    }
    return null;
}

window.onSpotifyWebPlaybackSDKReady = () => {


    if(accessToken == " ")
        return;

    const token = accessToken;
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
    player.addListener('player_state_changed', state => {
         console.log(state); 
    });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      deviceId = device_id;
    });
  
    // Connect to the player!
    player.connect();
  };


  class Playlist{
    constructor(link, id, name){
        this.link = link;
        this.id = id;
        this.name = name;
        this.songs = [];
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