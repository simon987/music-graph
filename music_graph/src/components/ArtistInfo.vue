<template>
    <el-card class="artist-info box-card" v-if="artist !== undefined">
        <div slot="header">
            <span>{{artist.name}}</span>
        </div>
        <div>
            <AlbumCarousel
                style="float: left"
                v-bind:releases="artistInfo.releases"
                interval="750" />
            <span>Listeners: {{artist.listeners}}</span>
        </div>
    </el-card>
</template>

<script>
import Vue from 'vue'
import AlbumCarousel from './AlbumCarousel'

let data = {
    artistInfo: {
        releases: []
    }
}

function reloadInfo(artist) {
    Vue.http.get('http://localhost:3030/artist/details/' + artist.mbid)
        .then(response => {
            response.json().then(info => {
                data.artistInfo = info
                data.artistInfo.releases = data.artistInfo.releases.slice(0, 2)
            })
        })
}

export default {
    name: 'ArtistInfo',
    components: {AlbumCarousel},
    props: ['artist'],
    watch: {
        artist: reloadInfo
    },
    data() {
        return data
    }
}
</script>

<style scoped>
    .artist-info {
        margin: 1rem;
        position: fixed;
    }
</style>
