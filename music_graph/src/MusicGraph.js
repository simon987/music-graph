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
        const menuNode = this.nodes.find(d => d.menu)
        if (menuNode !== undefined) {
            menuNode.menu = null
            setTimeout(() => {
                menuNode.fx = null
                menuNode.fy = null
            }, 600)
        }
        this.svg.classed('menu-mode', false)
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
    this.container.append('g').attr('id', 'menu')
    this.container.append('g').attr('id', 'labels')

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
        if (d.menu) {
            return
        }
        if (!d3.event.active) {
            this.simulation.alphaTarget(0)
        }

        d.fx = null
        d.fy = null
    }

    this.nodeHover = (d) => {
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

        if (d.type === 'Group' || d.type === 'Artist') {
            this._data.hoverArtist = d
        }
    }

    this.nodeOut = () => {
        this.svg.classed('hover', false)
        this.label.classed('selected', false)
        this.link.classed('selected', false)
        this.node.classed('selected', false)
        this.node.classed('hover', false)
    }

    this.makeMenu = function (d) {
        let items = []
        let i = 0
        if (d.type === 'Group' && !d.membersExpanded) {
            items.push({
                idx: i++,
                icon: icons.guitar,
                title: 'Members',
                fn: (d) => {
                    this.api.getGroupMembers(d.mbid, d.id)
                        .then(data => {
                            d.membersExpanded = true
                            this.addNodes(data.newNodes, data.relations, d.id)
                        })
                }
            })
        }
        if ((d.type === 'Group' || d.type === 'Artist') && !d.relatedExpanded) {
            items.push({
                idx: i++,
                icon: icons.expand,
                title: 'Related',
                fn: (d) => {
                    this.api.getRelatedByMbid(d.mbid)
                        .then(data => {
                            this.addNodes(data.newNodes, data.relations, d.id)
                            this.expandedNodes.add(d.id)
                            d.relatedExpanded = true
                        })
                }
            })
        }
        if ((d.type === 'Artist' || d.type === 'Group') && !d.releasesExpanded) {
            items.push({
                idx: i++,
                icon: icons.release,
                title: 'Releases',
                fn: (d) => {
                    this.api.getArtistReleases(d.mbid, d.id)
                        .then(data => {
                            this.addNodes(data.newNodes, data.relations, d.id)
                            d.releasesExpanded = true
                        })
                }
            })
        }
        if ((d.type === 'Album' || d.type === 'EP' || d.type === 'Single' || d.type === 'Group' || d.type === 'Artist') &&
            !d.tagsExpanded) {
            let fn
            if (d.type === 'Group' || d.type === 'Artist') {
                fn = (d) => {
                    this.api.getArtistTags(d.mbid, d.id)
                        .then(data => {
                            this.addNodes(data.newNodes, data.relations, d.id)
                            d.tagsExpanded = true
                        })
                }
            } else if (d.type === 'Album' || d.type === 'EP' || d.type === 'Single') {
                fn = (d) => {
                    this.api.getReleaseDetails(d.mbid, d.id)
                        .then(data => {
                            this.addNodes(data.newNodes, data.relations, d.id)
                            d.tagsExpanded = true
                        })
                }
            }

            items.push({
                idx: i++,
                icon: icons.hash,
                title: 'Tags',
                fn: fn
            })
        }
        items.push({
            idx: i,
            icon: icons.delete,
            title: 'Remove from graph',
            fn: (d) => {
                this.removeNodes([d.id])
            }
        })

        this.menu = this.container.select('#menu')
            .selectAll('g')
            .data(items)
            .enter()
            .append('g')
            .classed('menu-item', true)
            .attr('transform', `translate(${d.x},${d.y})`)

        const path = this.menu
            .append('path')
            .attr('d', item => arc(d.radius, item.idx, items.length, 1)())
        path
            .on('mouseover', d => {
                this.menu.classed('hover', item => item.idx === d.idx)
            })
            .on('mouseout', () => this.menu.classed('hover', false))
            .on('mousedown', tab => {
                this.dismiss()
                return tab.fn(d)
            })
            .transition()
            .duration(200)
            .attr('d', item => arc(d.radius, item.idx, items.length, 30)())
        path
            .append('title')
            .text(item => item.title)

        const centroid = (idx, rad) => arc(rad, idx, items.length, 30).centroid()
        this.menu
            .append('g')
            .html(d => d.icon)
            .classed('menu-icon', true)
            .attr('transform', d => `translate(${centroid(d.idx, 1)[0] - 13}, ${centroid(d.idx, 1)[1] - 13})`)
            .transition()
            .duration(250)
            .attr('transform', item => `translate(${centroid(item.idx, d.radius)[0] - 10}, ${centroid(item.idx, d.radius)[1] - 10})`)
    }

    this.nodeDbClick = (d) => {
        if (this.svg.classed('menu-mode')) {
            return
        }

        this.svg.classed('menu-mode', true)
        d.menu = true

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
            Array.from(this.nodeById.get(id).targetLinks)
                .map(srcId => this.nodeById.get(srcId))
                .forEach(target => {
                    target.sourceLinks.delete(id)
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
                    (1.2 / d.weight) * (94 * (this.expandedNodes.size + 1)))
                )
            )

        this.simulation.alphaTarget(0.01).restart()

        // Add new links
        this.link = this.container.select('#links')
            .selectAll('.link')
            .data(this.links)
        this.link.exit().remove()
        this.link = this.link
            .enter()
            .append('line')
            .merge(this.link)
            .classed('link', true)

        // Add new nodes
        this.node = this.container.select('#nodes')
            .selectAll('.node')
            .attr('stroke', d => this._getNodeColor(d))
            .data(this.nodes)
        this.node.exit().remove()
        this.node = this.node
            .enter()
            .append('circle')
            .merge(this.node)
            .classed('node', true)
            .attr('r', d => d.radius)
            .attr('stroke', d => this._getNodeColor(d))
            .call(d3.drag()
                .on('start', this.dragStarted)
                .on('drag', this.dragged)
                .on('end', this.dragEnded))
            .on('mouseover', this.nodeHover)
            .on('mouseout', this.nodeOut)
            .on('dblclick', this.nodeDbClick)
            .on('contextmenu', this.nodeDbClick)

        // Add new labels
        this.label = this.container.select('#labels')
            .selectAll('.label')
            .data(this.nodes)
        this.label.exit().remove()
        this.label = this.label
            .enter()
            .append('text')
            .merge(this.label)
            .text(d => d.name)
            .classed('label', true)
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
