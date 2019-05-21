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
                    v-bind:src="'http://localhost:3030/cover/' + release.mbid"
                >
                <figcaption>{{release.name}} ({{release.year}})</figcaption>
            </figure>
        </figure>
    </div>
</template>

<script>
let data = {
    current: '',
    index: 0
}

export default {
    name: 'AlbumCarousel',
    props: ['releases', 'interval'],
    data() {
        return data
    },
    mounted() {
        setInterval(() => {
            this.tick()
        }, Number(this.interval))
    },
    watch: {
        releases: () => {
            data.index = 0
        }
    },
    methods: {
        tick() {
            if (data.index === this.releases.length - 1) {
                data.index = 0
            }

            data.index += 1
            data.current = this.releases[data.index].mbid
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
