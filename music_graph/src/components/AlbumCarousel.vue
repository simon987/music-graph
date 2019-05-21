<template>
    <div>
        <figure
            v-for="release in releases"
            v-show="current === release.mbid"
            v-bind:key="release.mbid"
        >
            <figure>
                <img
                    alt=""
                    width="128"
                    height="128"
                    v-bind:src="api.resolveCoverUrl(release.mbid)"
                >
                <figcaption>{{release.name}} ({{release.year}})</figcaption>
            </figure>
        </figure>
    </div>
</template>

<script>
import {MusicGraphApi} from '../MusicGraphApi'

export default {
    name: 'AlbumCarousel',
    props: ['releases', 'interval'],
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
        releases: () => {
            this.index = 0
        }
    },
    methods: {
        tick() {
            if (this.index === this.releases.length - 1) {
                this.index = 0
            }

            this.index += 1
            this.current = this.releases[this.index].mbid
        }
    }
}
</script>

<style scoped>

    figure {
        text-align: center;
        margin: 0 0 10px 0;
        max-width: 300px;
    }
</style>
