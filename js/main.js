import {search} from './lyrics.js';
import {spotifyInit, requestAuthorization, getPlaylist, playDemo, getPlaylistSongs, playSong, playPlaylist, pauseSong, changeSong} from './spotify.js';
export {init};

Vue.component('playlist-nested-song',{
    props:['song', 'index'],
    template:   `<b-card>
                    <b-button v-on:click="songClick" :id="song.id" class="song">{{song.title}}</b-button>
                </b-card>`,
    methods: {
        songClick: function(event){
            playSong(this.song);
        }
    }        
});

Vue.component('playlist-nested-collapse', {
    props:['list', 'index'],
    template:   `<b-card class="playlist-nested-card">
                    <b-btn v-b-toggle="list.id" :id="list.id"class="playlist-nested" v-on:click="playlistClick">{{list.name}}</b-btn>
                    <b-collapse :id="list.id" class="scrollbar-playlist scrollbar-primary">
                        <b-card>
                            <b-button class="playlist-playall" v-on:click="playAllClick">Play All</b-button>
                        </b-card>
    
                        <b-card is="playlist-nested-song" v-for="(song, index2) in list.songs" v-bind:song="song" v-bind:index="index2">
                        </b-card>
                    </b-collapse>
                </b-card>`,
    methods:{
        playlistClick: function(event){
            getPlaylistSongs(event.target.id);
        },
        playAllClick: function(event){
            playPlaylist(this.list);
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
        authorizeSpotify(){
            console.log("Clicked");
            requestAuthorization();
        },
        pause(){
            pauseSong();
        },
        play(){
            // Send -1 to signify we are resuming
            playSong(-1);
        },
        next(){
            changeSong(1);
        },
        previous(){
            changeSong(-1);
        }
    }
});


function init(){
    let playlistBtn = document.querySelector("#playlist-collapse");
    playlistBtn.onclick = function(event){
        getPlaylist(function(playlists){
            app.loadPlaylists(playlists);
        });
    };

    spotifyInit();
}