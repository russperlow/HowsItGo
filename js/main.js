import {search} from './lyrics.js';
import {spotifyInit, requestAuthorization, getPlaylist, playDemo, getPlaylistSongs} from './spotify.js';
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

Vue.component('playlist-nested-song',{
    props:['song', 'index'],
    template:   `<b-card>
                    <button v-on:click="songClick">{{song.title}}</button>
                </b-card>`,
    methods: {
        songClick: function(event){
            console.log("Event");
        }
    }        
});

Vue.component('playlist-nested-collapse', {
    props:['list', 'index'],
    template:   `<b-card class="playlist-nested-card">
                    <b-btn v-b-toggle="list.id" :id="list.id"class="playlist-nested" v-on:click="playlistClick">{{list.name}}</b-btn>
                    <b-collapse :id="list.id">
                        <b-card is="playlist-nested-song" v-for="(song, index2) in list.songs" v-bind:song="song" v-bind:index="index2">
                        </b-card>
                    </b-collapse>
                </b-card>`,
    methods:{
        playlistClick: function(event){
            getPlaylistSongs(event.target.id);
        }
    }
});

Vue.component('playlist-collapse', {
    props:['lists', 'title'],
    template:   `<div>
                <b-card id="playlist-collapse-card">
                    <b-btn v-b-toggle.collapse1 id="playlist-collapse">Playlists</b-btn>
                    <b-collapse id="collapse1" class="mt-2">
                        <b-card is="playlist-nested-collapse" v-for="(list, index) in lists" v-bind:list="list" v-bind:index="index">
                        </b-card>
                    </b-collapse>
                </b-card>
                </div>`
});

let app = new Vue({
    el: '#root',
    data: {
        titleHeader: "Playlists:",
        lists: [],
    },
    methods:{
        loadPlaylists(playlists){
            this.lists = playlists;
        },
        populatePlaylist(songs, id){
            for(let i = 0; i < this.lists.length; i++){
                if(id = this.lists[i].id){

                }
            }
        }
    }
});


function init(){
    document.querySelector("#search").onclick = function(event){search();}
    document.querySelector("#playDemoBtn").onclick = function(event){playDemo();}

    let playlistBtn = document.querySelector("#getPlaylistsBtn");
    playlistBtn.onclick = function(event){
        getPlaylist(function(playlists){
            app.loadPlaylists(playlists);
        });
    };

    spotifyInit();
}