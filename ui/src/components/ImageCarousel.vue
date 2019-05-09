<template>
    <div>
        <img
            alt=""
            width="96"
            height="96"
            v-show="currentSrc === url"
            v-bind:src="url"
            v-bind:key="url"
            v-for="url in sources"
        >
    </div>
</template>

<script>
let data = {
    currentSrc: '',
    index: 0
}

export default {
    name: 'ImageCarousel',
    props: ['sources', 'interval'],
    data() {
        return data
    },
    mounted() {
        setInterval(() => {
            this.tick()
        }, Number(this.interval))
    },
    watch: {
        sources: () => {
            data.index = 0
        }
    },
    methods: {
        tick() {
            if (data.index === this.sources.length - 1) {
                data.index = 0
            }

            data.index += 1
            data.currentSrc = this.sources[data.index]
        }
    }
}
</script>

<style scoped>
</style>
