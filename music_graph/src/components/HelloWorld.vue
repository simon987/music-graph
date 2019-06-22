<template>
    <div>
        <div id="mm"></div>
        <InputBar v-on:addArtist="onAddArtist($event)" v-on:addTag="onAddTag($event)"></InputBar>
        <ArtistInfo
            v-bind:artist="hoverArtist"
            v-on:addTag="onAddTag($event)"
        />
        <canvas id="textMeasurementCanvas"></canvas>
        <Watermark text="music-graph v1.0"/>
    </div>
</template>

<script>
import ArtistInfo from './ArtistInfo'
import Watermark from './Watermark'
import {MusicGraph} from '../MusicGraph'
import InputBar from './InputBar'

let data = {
    hoverArtist: undefined,
    mm: undefined
}

export default {
    components: {InputBar, ArtistInfo, Watermark},
    data() {
        return data
    },
    methods: {
        onAddArtist: function (e) {
            this.mm.addArtistByMbid(e)
        },
        onAddTag: function(e) {
            this.mm.addTagById(e)
        }
    },
    mounted() {
        this.mm = new MusicGraph(data)

        this.$notify({
            title: 'Welcome!',
            message: 'Use the search bar to add nodes. Right click nodes for more options',
            type: 'info',
            duration: 15 * 1000
        })
    }
}
</script>

<style>
    svg {
        margin-top: 3px;
        margin-left: 3px;

        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        position: fixed;
        top: 0;
    }

    /* Pan mode */
    svg.pan-mode .node {
        pointer-events: none;
    }

    svg.pan-mode {
        cursor: move;
    }

    .pan-rect {
        pointer-events: all;
    }

    svg.menu-mode .dismiss-rect {
        pointer-events: all;
    }

    /* Link */
    svg .link.selected {
        stroke-width: 2;
    }

    svg .link {
        stroke: #FFE082;
        pointer-events: none;
        stroke-opacity: 0.3;
        stroke-width: 1;
    }

    svg.hover .link:not(.selected) {
        stroke-opacity: 0.5;
        stroke-width: 0.2;
    }

    /* Node */
    svg .node.selected {
        stroke: #7C4DFF;
    }

    svg .node.hover {
        stroke: #7C4DFF;
    }

    svg.hover .node:not(.selected):not(.hover) {
        display: none;
    }

    svg .node {
        fill: transparent;
        stroke-width: 2;
    }

    /* Label */
    svg .label {
        text-anchor: middle;
        font-family: Tahoma, sans-serif;
        font-size: 11px;
    }

    svg .label.release {
        fill: darkgrey;
    }

    svg .label.tag {
        fill: #409EFF;
    }

    svg.hover .label:not(.selected) {
        fill-opacity: 0.2;
    }

    body {
        background: #ffffff;
    }

    /* test */

    #menu .menu-item {
        cursor: pointer;
        fill: #FFB300;
    }

    #menu .menu-item.hover {
        fill: #FF8F00;
    }

    #menu .menu-icon {
        fill: black;
        stroke: black;
        pointer-events: none;
    }

    text {
        pointer-events: none;
    }
</style>
