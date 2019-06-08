<template>
    <el-card class="artist-info box-card" v-if="artist !== undefined">
        <div slot="header">
            <span>{{artist.name}}<span class="year" v-if="artistInfo.year!==0">[{{artistInfo.year}}]</span></span>
        </div>
        <div>
            <AlbumCarousel
                style="float: right"
                :releases="artistInfo.releases"
                interval="1250"/>
            <div>
                <p v-if="artistInfo.comment!==null"
                   class="comment"
                >{{artistInfo.comment}}</p>
            </div>
            <div class="tag-group" v-if="artistInfo.tags && artistInfo.tags.length > 0">
                <span class="tag-group__title">Tags</span>
                <el-tag
                    v-for="tag in artistInfo.tags"
                    v-bind:key="tag.id"
                    size="small"
                >{{tag.name}}
                </el-tag>
            </div>
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
                    this.artistInfo.releases = this.artistInfo.releases.filter(r =>
                        r.labels.indexOf('Album') !== -1 || r.labels.indexOf('EP') !== -1)
                    this.artistInfo.tags = info.tags.sort((a, b) => b.weight - a.weight).splice(0, 6)
                })
        }
    }
}
</script>

<style scoped>
    .artist-info {
        margin: 0 1em;
        position: fixed;
        background: rgba(255, 255, 255, 0.92);
        font-family: "Bitstream Vera Sans";
    }

    .comment {
        color: #727c84;
        margin-bottom: 2em;
        margin-top: 0;
        min-width: 300px;
    }

    .tag-group {
        max-width: 400px;
        min-width: 300px;
    }

    .el-tag {
        margin-left: 4px;
        margin-bottom: 4px;
    }

    .year {
        margin-left: 0.5em;
        color: #828c94;
        font-size: 85%;
        vertical-align: top;
    }
</style>
