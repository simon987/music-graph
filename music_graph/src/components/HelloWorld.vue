<template>
    <div>
        <div id="mm"></div>
        <InputBar v-on:query="onQuery($event)"></InputBar>
        <ArtistInfo v-bind:artist="hoverArtist"/>
    </div>
</template>

<script>
import ArtistInfo from './ArtistInfo'
import {MusicGraph} from '../MusicGraph'
import InputBar from './InputBar'

let data = {
    hoverArtist: undefined,
    mm: undefined
}

export default {
    components: {InputBar, ArtistInfo},
    data() {
        return data
    },
    methods: {
        onQuery: function (e) {
            console.log(e)
            this.mm.addArtistByName(e)
        }
    },
    mounted() {
        this.mm = new MusicGraph(data)
        this.mm.addArtistByName('Tool')
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

    svg.pan-mode .pan-rect {
        pointer-events: all;
    }

    svg.menu-mode .dismiss-rect {
        pointer-events: all;
    }

    svg.pan-mode {
        box-sizing: border-box;
        border: 5px red solid;
    }

    /* Link */
    svg .link.selected {
        stroke-width: 2;
        stroke-opacity: 1;
    }

    svg .link {
        stroke: orange;
        pointer-events: none;
        stroke-opacity: 1;
        stroke-width: 1;
    }

    svg.hover .link:not(.selected) {
        stroke-opacity: 0.5;
        stroke-width: 0.2;
    }

    /* Node */
    svg .node.selected {
        stroke: red;
    }

    svg .node.hover {
        stroke: red;
    }

    svg.hover .node:not(.selected):not(.hover) {
        display: none;
    }

    svg .node {
        fill: transparent;
    }

    /* Label */
    svg .label {
        text-anchor: middle;
    }

    svg.hover .label:not(.selected) {
        fill-opacity: 0.2;
    }

    body {
        background: #E7EDEB;
    }

    /* test */

    #menu .menu-item {
        cursor: pointer;
        fill: orange;
    }

    #menu .menu-item.hover {
        fill: darkorange;
    }

    #menu .menu-item.hover text {
        font-weight: bold;
    }

    #menu .menu-item text {
        text-anchor: middle;
        fill: white;
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
