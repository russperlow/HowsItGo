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

Vue.component('playlist-nested-collapse', {
    props:['list', 'index', 'id'],
    template:   `<b-card>
                    <b-btn v-b-toggle="id">{{list}}</b-btn>
                    <b-collapse :id="id">
                        <b-card>Song id:{{id}} index: {{index}}</b-card>
                    </b-collapse>
                </b-card>`
});

Vue.component('playlist-collapse', {
    props:['lists', 'title', 'count'],
    template:   `<div>
                    <b-btn v-b-toggle.collapse1 variant="primary">Playlists</b-btn>
                    <b-collapse id="collapse1" class="mt-2">
                        <b-card is="playlist-nested-collapse" v-for="(list, index) in lists" v-bind:list="list" v-bind:index="index" v-bind:id="count[index]">
                        </b-card>
                    </b-collapse>
                </div>`

});

let app = new Vue({
    el: '#root',
    data: {
        titleHeader: "Playlists:",
        lists: [],
        count: []
    },
    methods:{
        initPlayLists(playlists){
            this.lists = playlists;
            for(let i = 0; i < this.lists.length; i++){
                this.count[i] = i.toString();
            }
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