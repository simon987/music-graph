<template>
    <div>
        <ArtistInfo v-bind:artist="hoverArtist"/>
    </div>
</template>

<script>
import * as d3 from 'd3'
import ArtistInfo from './ArtistInfo'

let data = {
    hoverArtist: undefined
}

const nodeUtils = {
    getNodeType: function (labels) {
        if (labels.find(l => l === 'Tag')) {
            return 'Tag'
        } else if (labels.find(l => l === 'Group')) {
            return 'Group'
        } else if (labels.find(l => l === 'Artist')) {
            return 'Artist'
        }
        return undefined
    },

    getRadius: function (node) {
        if (expandedNodes.has(node.id)) {
            return 40
        }

        if (node.type === 'Tag') {
            return 10
        }

        return Math.max(Math.sqrt(node.listeners / 7000) * 1.4, 15)
    },

    getColor: function (node) {
        if (expandedNodes.has(node.id)) {
            return '#1cb3c8'
        }
        return null
    }
}

let originArtist
let originNode
let expandedNodes = new Set()

function MusicGraph() {
    const width = window.innerWidth - 7
    const height = window.innerHeight - 7

    this.nodeById = new Map()
    this.nodes = []
    this.links = []
    this._originSet = false

    this.svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    this.zoomed = () => {
        this.container.attr('transform', d3.event.transform)
    }

    this.svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .classed('pan-rect', true)
        .style('fill', 'none')
        .call(d3.zoom()
            .scaleExtent([1 / 10, 5])
            .on('zoom', this.zoomed))

    this.container = this.svg.append('g').attr('id', 'container')

    this.container.append('g')
        .attr('id', 'links')
    this.container.append('g')
        .attr('id', 'nodes')
    this.container.append('g')
        .attr('id', 'labels')

    this.dragStarted = (d) => {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart()
        }
        d.fx = d.x
        d.fy = d.y
    }

    this.dragged = (d) => {
        d.fx = d3.event.x
        d.fy = d3.event.y
    }

    this.dragEnded = (d) => {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0)
        }

        d.fx = null
        d.fy = null
    }

    this.nodeHover = (d) => {
        data.hoverArtist = d

        let srcLinks = this.links.filter(link => link.source.id === d.id)
        let targetLinks = this.links.filter(link => link.target.id === d.id)
        data.hoverLinks = srcLinks.map(l => {
            return {
                match: (l.weight * 100).toFixed(2) + '%',
                other: l.target
            }
        }).concat(targetLinks.map(l => {
            return {
                match: (l.weight * 100).toFixed(2) + '%',
                other: l.source
            }
        }))
        console.log(data.hoverLinks)

        this.svg.classed('hover', true)

        this.link.classed('selected', link =>
            link.source.id === d.id || link.target.id === d.id)

        this.node.classed('selected', n =>
            n.sourceLinks.has(d.id) ||
            n.targetLinks.has(d.id))

        this.label.classed('selected', n =>
            n.sourceLinks.has(d.id) ||
            n.targetLinks.has(d.id) ||
            n.id === d.id)

        this.node.classed('hover', n => n.id === d.id)
    }

    this.nodeOut = () => {
        this.svg.classed('hover', false)
        this.label.classed('selected', false)
        this.link.classed('selected', false)
        this.node.classed('selected', false)
        this.node.classed('hover', false)
    }

    this.nodeDbClick = (d) => {
        if (expandedNodes.has(d.id)) {
            return
        }

        expandedNodes.add(d.id)
        expandArtist(d.mbid)
    }

    this.simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody())
        .force('collide', d3.forceCollide()
            .radius(50)
            .strength(1))
        .force('center', d3.forceCenter(width / 2, height / 2))

    this.simulation.stop()

    this.simulation.on('tick', () => {
        this.link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
        this.node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        this.label
            .attr('x', d => d.x)
            .attr('y', d => d.y)
    })

    /**
     * Add nodes to the graph
     */
    this.addNodes = function (newNodes, relations, originId) {
        // Update node map, ignore existing nodes
        let nodesToAdd = []
        newNodes.forEach(d => {
            if (this.nodeById.has(d.id)) {
                return
            }
            this.nodeById.set(d.id, d)

            if (this._originSet && originId) {
                // Set new nodes initial position
                let centerNode = this.nodeById.get(originId)
                centerNode.fx = centerNode.x
                centerNode.fy = centerNode.y
                d.x = centerNode.x
                d.y = centerNode.y
                setTimeout(() => {
                    centerNode.fx = null
                    centerNode.fy = null
                }, 600)
            }

            nodesToAdd.push(d)
        })

        // Convert {id, id} relation to {node, node}
        let linksToAdd = relations.map(({weight, source, target}) => ({
            source: this.nodeById.get(source),
            target: this.nodeById.get(target),
            weight: weight
        }))

        // Update source/targetLinks
        for (const {source, target} of linksToAdd) {
            source.sourceLinks.add(target.id)
            target.targetLinks.add(source.id)
        }

        this.nodes.push(...nodesToAdd)
        this.links.push(...linksToAdd)

        if (!this._originSet) {
            this._setOrigin()
            this._originSet = true
        }

        this._update()
    }

    /**
     * Remove nodes from the graph
     */
    this.removeNodes = function (idsToRemove) {
        let idSetToRemove = new Set(idsToRemove)

        idsToRemove.forEach(id => {
            // Update targetLinks
            Array.from(this.nodeById.get(id).sourceLinks)
                .map(srcId => this.nodeById.get(srcId))
                .forEach(target => {
                    target.targetLinks.delete(id)
                })

            this.nodeById.delete(id)
        })

        // Remove links
        this.links = this.links.filter(l =>
            !idSetToRemove.has(l.target.id) &&
            !idSetToRemove.has(l.source.id)
        )

        // Remove nodes
        this.nodes = this.nodes.filter(d => !idSetToRemove.has(d.id))

        this._update()
    }

    this._update = function () {
        this.simulation.nodes(this.nodes)
        this.simulation
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .strength(l => l.weight)
                .distance(d => Math.min(
                    (1.2 / d.weight) * (94 * expandedNodes.size))
                )
            )
        this.simulation
            .restart()

        // Add new links
        this.link = this.container.select('#links')
            .selectAll('.link')
            .data(this.links)
        let linkEnter = this.link
            .enter()
            .append('line')
            .classed('link', true)
        this.link = linkEnter.merge(this.link)

        // Add new nodes
        this.node = this.container.select('#nodes')
            .selectAll('.node')
            .attr('stroke', d => nodeUtils.getColor(d))
            .data(this.nodes)
        let nodeEnter = this.node
            .enter()
            .append('circle')
            .classed('node', true)
            .attr('r', 35)
            .attr('stroke', d => nodeUtils.getColor(d))
            .call(d3.drag()
                .on('start', this.dragStarted)
                .on('drag', this.dragged)
                .on('end', this.dragEnded))
            .on('mouseover', this.nodeHover)
            .on('mouseout', this.nodeOut)
            .on('dblclick', this.nodeDbClick)
        this.node = nodeEnter.merge(this.node)

        // Add new labels
        this.label = this.container.select('#labels')
            .selectAll('.label')
            .data(this.nodes)
        let labelEnter = this.label
            .enter()
            .append('text')
            .text(d => d.name)
            .classed('label', true)
        this.label = labelEnter.merge(this.label)
    }

    this.setupKeyBindings = function () {
        document.body.onkeydown = (e) => {
            let isPanMode = this.svg.classed('pan-mode')

            if (e.key === 'q') {
                this.svg.classed('pan-mode', !isPanMode)
            } else if (e.key === 'Escape') {
                this.svg.classed('pan-mode', false)
            }
        }
    }

    this._setOrigin = function () {
        // Set origin node in center
        originNode = this.simulation.nodes().find(node => node.id === originArtist.id)
        originNode.fx = width / 2
        originNode.fy = height / 2

        setTimeout(() => {
            originNode.fx = null
            originNode.fy = null
        }, 500)

        // Remember that we expanded origin node
        expandedNodes.add(originNode.id)
    }

    this._update()
    this.setupKeyBindings()
}

let mm = new MusicGraph()

function expandArtist(mbid) {
    d3.json('https://mm.simon987.net/api/artist/related/' + mbid)
        .then((r) => {
            originArtist = r.artists.find(a => a.mbid === mbid)

            const nodes = r.artists.map((row) => {
                return {
                    id: row.id,
                    mbid: row.mbid,
                    name: row.name,
                    listeners: row.listeners,
                    type: nodeUtils.getNodeType(row.labels),
                    sourceLinks: new Set(),
                    targetLinks: new Set()
                }
            })

            mm.addNodes(nodes, r.relations, originArtist.id)
        })
}

expandArtist('66fc5bf8-daa4-4241-b378-9bc9077939d2')

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
