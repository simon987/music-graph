<template>
    <div v-bind:class="{alone: alone}">
        <div
            v-for="release in releases"
            v-show="current === release.mbid"
            v-bind:key="release.mbid"
            style="float: right"
        >
            <figure>
                <el-image
                    alt=""
                    style="height: 128px"
                    width="128"
                    height="128"
                    class="block"
                    v-bind:src="api.resolveCoverUrl(release.mbid)"
                >
                    <div slot="error" class="image-slot">
                        <i class="el-icon-full-screen"></i>
                    </div>
                </el-image>
                <figcaption>{{release.name}} ({{release.year}})</figcaption>
            </figure>
        </div>
    </div>
</template>

<script>

export default {
    name: 'AlbumCarousel',
    props: ['releases', 'interval', 'alone', 'api'],
    data() {
        return {
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

<style>

    figure {
        text-align: center;
        margin: 0 20px 3em 20px;
        width: 128px;
    }

    @media (max-width: 601px) {
        figcaption {
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 90%;
        }

    }

    .el-image {
        width: 128px;
        height: 180px;
    }

    .image-slot {
        font-size: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background: #f5f7fa;
        color: #909399;
    }
</style>
