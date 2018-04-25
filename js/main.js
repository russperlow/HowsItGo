import {search} from './lyrics.js';
import {spotifyInit, requestAuthorization, getPlaylist, playDemo} from './spotify.js';
export {init};

// window.onload = init();

Vue.component('playlist-element',{
    props:['list', 'index'],
    template: `<li v-text="list"></li>`
});

Vue.component('playlist-list', {
    props:['lists', 'title'],
    template:`<div>
        <h2> {{ title }} </h2>
        <ul>
            <li is="playlist-element" v-for="(list,index) in lists" v-bind:list="list" v-bind:index="index"></li>
        </ul>
    </div>`
});

let app = new Vue({
    el: '#root',
    data: {
        titleHeader: "Playlists:",
        lists: []
    },
    methods:{
        initPlayLists(playlists){
            this.lists = playlists;
        }
    }
});

function init(){
    document.querySelector("#search").onclick = function(event){search();}
    document.querySelector("#playDemoBtn").onclick = function(event){playDemo();}

    let playlistBtn = document.querySelector("#getPlaylistsBtn");
    playlistBtn.onclick = function(event){app.initPlayLists(getPlaylist());};

    spotifyInit();
}