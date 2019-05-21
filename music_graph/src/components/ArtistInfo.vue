<template>
    <el-card class="artist-info box-card" v-if="artist !== undefined">
        <div slot="header">
            <span>{{artist.name}}</span>
        </div>
        <div>
            <AlbumCarousel
                style="float: left"
                v-bind:releases="artistInfo.releases"
                interval="750"/>
            <span>Listeners: {{artist.listeners}}</span>
        </div>
    </el-card>
</template>

<script>
import AlbumCarousel from './AlbumCarousel'
import {MusicGraphApi} from '../MusicGraphApi'

export default {
    name: 'ArtistInfo',
    components: {AlbumCarousel},
    props: ['artist'],
    watch: {
        artist: function (a) {
            this.reloadInfo(a)
        }
    },
    data() {
        return {
            artistInfo: {
                releases: []
            },
            api: new MusicGraphApi()
        }
    },
    methods: {
        reloadInfo: function (artist) {
            this.api.getArtistDetails(artist.mbid)
                .then(info => {
                    this.artistInfo = info
                    this.artistInfo.releases = this.artistInfo.releases.slice(0, 2)
                })
        }
    }
}
</script>

<style scoped>
    .artist-info {
        margin: 1rem;
        position: fixed;
    }
</style>
