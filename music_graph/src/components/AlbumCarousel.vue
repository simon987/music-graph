<template>
    <div v-bind:class="{alone: alone}">
        <div
            v-for="release in releases"
            v-show="current === release.mbid"
            v-bind:key="release.mbid"
            style="float: right"
        >
            <figure>
                <img
                    alt=""
                    style="height: 128px"
                    width="128"
                    height="128"
                    v-bind:src="api.resolveCoverUrl(release.mbid)"
                    onerror="this.src='/static/album.png'"
                >
                <figcaption>{{release.name}} ({{release.year}})</figcaption>
            </figure>
        </div>
    </div>
</template>

<script>
import {MusicGraphApi} from '../MusicGraphApi'

export default {
    name: 'AlbumCarousel',
    props: ['releases', 'interval', 'alone'],
    data() {
        return {
            api: new MusicGraphApi(),
            current: '',
            index: 0
        }
    },
    mounted() {
        setInterval(() => {
            this.tick()
        }, Number(this.interval))
    },
    watch: {
        releases: function () {
            this.index = 0
            this.tick()
        }
    },
    methods: {
        tick() {
            if (this.releases.length === 0) {
                return
            }

            if (this.index >= this.releases.length) {
                this.index = 0
            }

            this.current = this.releases[this.index].mbid
            this.index += 1
        }
    }
}
</script>

<style scoped>

    figure {
        text-align: center;
        width: 128px;
        height: 180px;
        margin: 0 20px 3em 20px;
    }
</style>
