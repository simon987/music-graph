<template>
    <el-card class="artist-info box-card" v-if="artist !== undefined">
        <div slot="header">
            <span>{{artist.name}}</span>
        </div>
        <div>
            <ImageCarousel
                v-bind:sources="artistInfo.covers"
                interval="750" />
        </div>
    </el-card>
</template>

<script>
import Vue from 'vue'
import ImageCarousel from './ImageCarousel'

let data = {
    artistInfo: {
        releases: [],
        covers: []
    }
}

function reloadInfo(artist) {
    Vue.http.get('http://localhost:3030/artist/details/' + artist.mbid)
        .then(response => {
            response.json().then(info => {
                info.covers = info.releases.map(mbid => 'http://localhost:3030/cover/' + mbid)

                data.artistInfo = info
            })
        })
}

export default {
    name: 'ArtistInfo',
    components: {ImageCarousel},
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
