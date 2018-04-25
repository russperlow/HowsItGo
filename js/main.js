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

Vue.component('playlist-nested-song',{
    props:['song', 'index'],
    template:   `<b-card>{{song.title}}</b-card>`
});

Vue.component('playlist-nested-collapse', {
    props:['list', 'index'],
    template:   `<b-card>
                    <b-btn v-b-toggle="list.id">{{list.name}}</b-btn>
                    <b-collapse :id="list.id">
                        <b-card is="playlist-nested-song" v-for="(song, index2) in list.songs" v-bind:song="song" v-bind:index="index2">
                        </b-card>
                    </b-collapse>
                </b-card>`
});

Vue.component('playlist-collapse', {
    props:['lists', 'title'],
    template:   `<div>
                    <b-btn v-b-toggle.collapse1 variant="secondary">Playlists</b-btn>
                    <b-collapse id="collapse1" class="mt-2">
                        <b-card is="playlist-nested-collapse" v-for="(list, index) in lists" v-bind:list="list" v-bind:index="index">
                        </b-card>
                    </b-collapse>
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
    playlistBtn.onclick = function(event){app.loadPlaylists(getPlaylist());};

    spotifyInit();
}