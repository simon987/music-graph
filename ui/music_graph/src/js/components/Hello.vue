<template>
    <div class='hello'>
    </div>
</template>

<script>
    import * as d3 from 'd3';

    function getNodeType(labels) {
        if (labels.find(l => l === 'Tag')) {
            return 'Tag';
        } else if (labels.find(l => l === 'Group')) {
            return 'Group';
        } else if (labels.find(l => l === 'Artist')) {
            return 'Artist';
        }
        return undefined;
    }

    let data = {};
    d3.json('../static/data.json')
        .then((r) => {
            data = r;

            const links = data.map(row => ({
                source: row._fields[1].start.low,
                target: row._fields[1].end.low,
                weight: row._fields[1].properties.weight.low,
            }));
            const nodes = [];
            function addNode(node) {
                if (nodes.find(n => n.id === node.id)) {
                    return;
                }
                nodes.push(node);
            }
            data.forEach((row) => {
                addNode({
                    id: row._fields[0].identity.low,
                    name: row._fields[0].properties.name,
                    listeners: row._fields[0].properties.listeners.low,
                    type: getNodeType(row._fields[0].labels),
                });
                addNode({
                    id: row._fields[2].identity.low,
                    name: row._fields[2].properties.name,
                    type: 'Tag',
                });
            });

            function getRadius(node) {
                if (node.type === 'Tag') {
                    return 10;
                }
                return Math.max(Math.sqrt(node.listeners / 5000), 15);
            }

            function getColor(node) {
                switch (node.type) {
                case 'Tag':
                    return '#e0e0e0';
                case 'Artist':
                    return '#42c3f7';
                case 'Group':
                    return '#00a5e9';
                default:
                    return '#DEADFB';
                }
            }

            const width = window.innerWidth - 5;
            const height = window.innerHeight - 5;

            // ??
            const simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id))
                .force('charge', d3.forceManyBody())
                .force('center', d3.forceCenter(width / 2, height / 2))
            ;

            let container;
            function zoomed() {
                container.attr('transform', d3.event.transform);
            }

            function nodeZoomed() {
                // TODO
            }

            function dragStarted(d) {
                if (!d3.event.active) {
                    simulation.alphaTarget(0.3).restart();
                }
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragEnded(d) {
                if (!d3.event.active) {
                    simulation.alphaTarget(0);
                }

                d.fx = null;
                d.fy = null;
            }

            const svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            svg.append('rect')
                .attr('width', width)
                .attr('height', height)
                .style('pointer-events', 'all')
                .style('fill', 'none')
                .call(d3.zoom()
                    .scaleExtent([1 / 3, 5])
                    .on('zoom', zoomed));

            document.body.setAttribute('style', 'background: #E7EDEB');
            container = svg.append('g');

            const link = container.append('g')
                .attr('stroke', '#003a6b')
                .selectAll('line')
                .data(links)
                .join('line')
                .attr('stroke-opacity', rel => rel.weight / 15)
                .attr('stroke-width', rel => Math.sqrt(rel.weight) * 0.6);

            const node = container.append('g')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.5)
                .selectAll('circle')
                .data(nodes)
                .join('circle')
                .attr('r', d => getRadius(d))
                .attr('fill', d => getColor(d))
                .call(d3.drag()
                    .on('start', dragStarted)
                    .on('drag', dragged)
                    .on('end', dragEnded))
                .on('wheel', nodeZoomed);

            node.append('title')
                .text(d => `${d.name} ${d.id}`);

            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
            });
        });
    export default {
        name: 'hello',
        data() {
            return {
                msg: 'Welcome to Your Vue.js App',
            };
        },
    };
</script>

<style scoped>
</style>
