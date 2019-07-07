<template>
    <div>
        <el-card class="artist-info box-card" v-if="artist !== undefined">
            <div slot="header">
                <span>{{artist.name}}<span class="year" v-if="artistInfo.year!==0">[{{artistInfo.year}}]</span></span>
            </div>
            <div>
                <AlbumCarousel
                    style="float: right"
                    :releases="artistInfo.releases"
                    :api="api"
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
                        v-bind:type="tag.type"
                        v-on:click="onTagClick(tag.id)"
                        title="Add tag to graph"
                        size="small"
                    >{{tag.name}}
                    </el-tag>
                </div>
            </div>
        </el-card>
        <span id="playing" v-if="playingSong">♪ Playing "{{playingSong}} - {{playingRelease}}" ♪</span>
    </div>
</template>

<script>
import AlbumCarousel from './AlbumCarousel'
import {genres} from '../genres'

export default {
    name: 'ArtistInfo',
    components: {AlbumCarousel},
    props: ['artist', 'api'],
    watch: {
        artist: function (a) {
            this.onSongEnd()
            if (a !== undefined) {
                this.reloadInfo(a)
            }
        }
    },
    data() {
        return {
            artistInfo: {
                releases: [],
                audio: undefined
            },
            playingSong: undefined,
            playingRelease: undefined
        }
    },
    methods: {
        reloadInfo: function (artist) {
            this.api.getArtistDetails(artist.mbid)
                .then(info => {
                    this.artistInfo = info
                    this.artistInfo.releases = this.artistInfo.releases
                        .sort((a, b) => a.year - b.year)
                        .filter(r => r.labels.indexOf('Album') !== -1 || r.labels.indexOf('EP') !== -1)
                    this.artistInfo.tags = info.tags.sort((a, b) => b.weight - a.weight).splice(0, 6).map(t => {
                        t.type = genres.has(t.name) ? '' : 'info'
                        return t
                    })

                    if (this.artistInfo.spotifyPreviewUrls.length > 0) {
                        const randSong = this.artistInfo.spotifyPreviewUrls[Math.floor(Math.random() * this.artistInfo.spotifyPreviewUrls.length)]
                        this.audio = new Audio(randSong.url)
                        this.playingSong = randSong.name
                        this.playingRelease = randSong.release
                        this.audio.play()
                        this.audio.addEventListener('ended', this.onSongEnd)
                    }
                })
        },
        onTagClick: function (tag) {
            this.$emit('addTag', tag)
        },
        onSongEnd: function() {
            if (this.audio !== undefined) {
                this.audio.pause()
                this.audio.remove()
            }
            this.playingSong = undefined
            this.playingRelease = undefined
        }
    }
}
</script>

<style scoped>
    .artist-info {
        margin: 0 1em;
        position: fixed;
        background: rgba(255, 255, 255, 0.92);
        font-family: "Bitstream Vera Sans",serif;
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
        cursor: pointer;
    }

    .el-tag:hover {
        text-decoration: underline;
    }

    .year {
        margin-left: 0.5em;
        color: #828c94;
        font-size: 85%;
        vertical-align: top;
    }

    #playing {
        position: fixed;
        top: calc(100% - 30px);
        left: calc(20px + 12em);
        pointer-events: none;
        color: rgba(255, 23, 68, 0.69);
        font-family: 'Consolas', 'Deja Vu Sans Mono', 'Bitstream Vera Sans Mono', monospace;
    }
</style>
