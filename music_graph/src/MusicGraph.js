import * as d3 from 'd3'
import icons from './icons'
import {MusicGraphApi} from './MusicGraphApi'

// TODO: export somewhere else
const arc = function (radius, itemNumber, itemCount, width) {
    itemNumber = itemNumber - 1

    const startAngle = ((2 * Math.PI) / itemCount) * itemNumber
    const endAngle = startAngle + (2 * Math.PI) / itemCount
    const innerRadius = Math.max(radius + 8, 20)
    return d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + width)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .padAngle(0.09)
}

export function MusicGraph(data) {
    const width = window.innerWidth - 7
    const height = window.innerHeight - 7
    this._data = data

    this.nodeById = new Map()
    this.expandedNodes = new Set()
    this.nodes = []
    this.links = []
    this._originSet = false
    this.api = new MusicGraphApi()

    this.simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody())
        .force('collide', d3.forceCollide()
            .radius(50)
            .strength(1))
        .force('center', d3.forceCenter(width / 2, height / 2))

    this.zoomed = () => {
        this.container.attr('transform', d3.event.transform)
    }

    this.dismiss = () => {
        this.menu.remove()
        this.nodes.forEach(d => {
            d.fx = null
            d.fy = null
            d.menu = null
        })
    }

    this.svg = d3.select('#mm')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    this.svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .classed('dismiss-rect', true)
        .style('fill', 'none')
        .on('mousedown', this.dismiss)

    this.svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .classed('pan-rect', true)
        .style('fill', 'none')
        .call(d3.zoom()
            .scaleExtent([1 / 10, 5])
            .on('zoom', this.zoomed))

    this.container = this.svg.append('g').attr('id', 'container')

    this.container.append('g').attr('id', 'links')
    this.container.append('g').attr('id', 'nodes')
    this.container.append('g').attr('id', 'labels')
    this.container.append('g').attr('id', 'menu')

    this.dragStarted = (d) => {
        if (d.menu) {
            return
        }
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart()
        }
        d.fx = d.x
        d.fy = d.y
    }

    this.dragged = (d) => {
        if (d.menu) {
            return
        }
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
        this._data.hoverArtist = d

        let srcLinks = this.links.filter(link => link.source.id === d.id)
        let targetLinks = this.links.filter(link => link.target.id === d.id)
        this._data.hoverLinks = srcLinks.map(l => {
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

    this.makeMenu = function (d) {
        // Todo global const?
        const items = [
            {idx: 0, icon: icons.expand},
            {idx: 1, icon: icons.release},
            {idx: 2, icon: icons.hash},
            {idx: 3, icon: icons.guitar}
        ]

        const tr = `translate(${d.x},${d.y})`
        this.menu = this.container.select('#menu')
            .selectAll('g')
            .data(items)
            .enter()
            .append('g')
            .classed('menu-item', true)
            .attr('transform', tr)

        this.menu
            .append('path')
            .attr('d', item => arc(35, item.idx, items.length, 1)())
            .on('mouseover', d => {
                this.menu.classed('hover', item => item.idx === d.idx)
            })
            .on('mouseout', () => this.menu.classed('hover', false))
            .transition()
            .duration(200)
            .attr('d', item => arc(35, item.idx, items.length, 30)())

        const angleOffset = items.length === 3 ? 3.72 : 3.927 // Don't ask
        this.menu
            .append('g')
            .html(d => d.icon)
            .classed('menu-icon', true)
            .attr('transform', d =>
                `translate(${40 * Math.cos(2 * Math.PI * d.idx / items.length + angleOffset) - 10},
                 ${40 * Math.sin(2 * Math.PI * d.idx / items.length + angleOffset) - 10})`
            )
            .transition()
            .duration(250)
            .attr('transform', d =>
                `translate(
                ${57 * Math.cos(2 * Math.PI * d.idx / items.length + angleOffset) - 10},
                 ${57 * Math.sin(2 * Math.PI * d.idx / items.length + angleOffset) - 10})`
            )
    }

    this.nodeDbClick = (d) => {
        if (d.menu) {
            return
        }

        this.svg.classed('menu-mode', true)
        d.menu = true

        // todo: unfreeze node on dismiss
        d.fx = d.x
        d.fy = d.y

        this.makeMenu(d)
        d3.event.preventDefault()
    }

    this.addNode = function (newNode, relations) {
        // Convert {id, id} relation to {node, node}
        if (this.nodeById.has(newNode.id)) {
            return
        }
        this.nodeById.set(newNode.id, newNode)
        newNode.x = width / 2
        newNode.y = height / 2

        let linksToAdd = relations
            .filter(rel => this.nodeById.has(rel.source) && this.nodeById.has(rel.target))
            .map(({weight, source, target}) => ({
                source: this.nodeById.get(source),
                target: this.nodeById.get(target),
                weight: weight
            }))

        // Update source/targetLinks
        for (const {source, target} of linksToAdd) {
            source.sourceLinks.add(target.id)
            target.targetLinks.add(source.id)
        }

        this.nodes.push(newNode)
        this.links.push(...linksToAdd)

        this._update()
    }

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

        if (!this._originSet && originId) {
            this.originArtist = this.nodeById.get(originId)
            this._setOrigin()
            this._originSet = true
        }

        this._update()
    }

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
                    (1.2 / d.weight) * (94 * this.expandedNodes.size))
                )
            )

        this.simulation.alphaTarget(0.01).restart()

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
            .attr('stroke', d => this._getNodeColor(d))
            .data(this.nodes)
        let nodeEnter = this.node
            .enter()
            .append('circle')
            .classed('node', true)
            .attr('r', 35)
            .attr('stroke', d => this._getNodeColor(d))
            .call(d3.drag()
                .on('start', this.dragStarted)
                .on('drag', this.dragged)
                .on('end', this.dragEnded))
            .on('mouseover', this.nodeHover)
            .on('mouseout', this.nodeOut)
            .on('dblclick', this.nodeDbClick)
            .on('contextmenu', this.nodeDbClick)
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
        this.originNode = this.simulation.nodes().find(node => node.id === this.originArtist.id)
        this.originNode.fx = width / 2
        this.originNode.fy = height / 2

        setTimeout(() => {
            this.originNode.fx = null
            this.originNode.fy = null
        }, 500)

        // Remember that we expanded origin node
        this.expandedNodes.add(this.originNode.id)
    }

    this._getNodeColor = function (node) {
        if (this.expandedNodes.has(node.id)) {
            return '#1cb3c8'
        }
        return null
    }

    this._getNodeRadius = function (node) {
        // Unused
    }

    this.expandArtist = function (mbid) {
        this.api.getRelatedByMbid(mbid)
            .then(data => {
                this.addNodes(data.newNodes, data.relations, data.node.id)
            })
    }

    this.addArtistByName = function (name) {
        this.api.getRelatedByName(name)
            .then(data => {
                this.addNode(data.node, data.relations)
            })
    }

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
            .attr('y', d => d.y + 5)
    })

    this._update()
    this.setupKeyBindings()
}
