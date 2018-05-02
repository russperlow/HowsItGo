export {spotifyInit, requestAuthorization, getPlaylist, playDemo, getPlaylistSongs, playSong};
import {search} from './lyrics.js';

"use strict";

const SPOTIFY_PLAYER_ACCESS_TOKEN = "BQAcQ5tcYvEdZ4TD2OViHYlTXyixZcWzcJWY-DI76Q4pqkXkMs_YNNFRBJkYq9dIKXtijH9_KxgfuSrHWirALp6vsBx3_BpxT7oeT0__YIuXhnHkilxKKMZ6KyDGoHuogP-Fr1DFqvlizEGKC_sBu8sh1L857-AtCO7cWg"; // Special Playback SDK id
let accessToken = " ";
const redirect_uri = "https://people.rit.edu/rep4975/330/HowsItGo/main.html";
const client_id = "27a24f33f6b8467991e0b78665a190e2"; // My client ID for authorization
let URL = ""; // The url for getting authorization
let deviceId = ""; // id of the device this is running on 
let user_id = ""; // The id of the user who signed in
let display_name = ""; // The display name of the user who signed in
let playlists = []; // Lists of the users playlists


let testing = false;

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

    if(testing){
        $("#authorize").hide();
        $("#playlists").show();
            $("#content").html("<p>To continue please pick a song from one of your playlists and we will show you the lyrics.");
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

    // TESTING PURPOSES ONLY
    if(testing){
        playlists.push(new Playlist("link1", "342lnf423q", "Drake v. Meek"));
        playlists.push(new Playlist("link2", "gsfdgsdh43", "Chill"));
        playlists.push(new Playlist("link3", "h5634jjehg", "Music TBT"));
        callback(playlists);
        return;
    }

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

    // FOR TESTING PURPOSES ONLY
    if(testing){
        let track1 = {album: "Album1", artists: [{name: "Artist1"}], id: "id1", link: "link1", name: "Title1"};
        let track2 = {album: "Album2", artists: [{name: "Artist2"}], id: "id2", link: "link2", name: "Title2"};
        let track3 = {album: "Album3", artists: [{name: "Artist3"}], id: "id3", link: "link3", name: "Title3"};
        let obj = {
            items: [{track: track1}, {track: track2}, {track: track3}]
        };
        populatePlaylist(obj, currentPlaylist);
        return;
    }

    let url = currentPlaylist.link + "/tracks";

    ajaxCall(url, null, function(response){populatePlaylist(response, currentPlaylist);});
}

// Add all of the playlist songs to the object
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

// Play the song using the given song obj
function playSong(song){

    // LOCAL TESTING ONLY
    if(testing)
        return;

    let url = 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId;
    let data = '{"uris": ["spotify:track:' + song.id + '"]}';
    let success = function(response){
        $("songInfo").html("Title: " + song.title + " Artist: " + song.artist + " Album: " + song.album);
        search(song.artist, song.title);
        console.log(response);
    };

    ajaxCall(url, data, success, "PUT");
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

    // ONLY FOR WHEN TESTING WITHOUT AUTHENTICATION KEY
    if(testing)
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