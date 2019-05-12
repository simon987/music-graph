<template>
    <div>
        <ArtistInfo v-bind:artist="hoverArtist"/>
    </div>
</template>

<script>
import ArtistInfo from './ArtistInfo'
import {MusicGraph} from '../MusicGraph'

let data = {
    hoverArtist: undefined
}

let mm = new MusicGraph(data)
mm.expandArtist('66fc5bf8-daa4-4241-b378-9bc9077939d2')

export default {
    components: {ArtistInfo},
    data() {
        return data
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
        stroke-opacity: 0.7;
        stroke-width: 1;
    }

    svg.hover .link:not(.selected) {
        stroke-opacity: 0.2;
        stroke-width: 0.1;
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
        pointer-events: none;
    }

    svg.hover .label:not(.selected) {
        display: none;
    }

    body {
        background: #E7EDEB;
    }
</style>
