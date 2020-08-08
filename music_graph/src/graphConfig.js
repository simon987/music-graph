let GRAPH_SIZE_FACTOR = 0.3
let INITIAL_DISTANCE = 50

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') {
        // GRAPH_SIZE_FACTOR += 0.1
        INITIAL_DISTANCE += 10
    }

    if (e.key === 'ArrowDown') {
        INITIAL_DISTANCE -= 10
    }
    console.log(INITIAL_DISTANCE)
})

export default {
    scaleExtent: [1 / 10, 5],
    initialAlphaTarget: 0.3,
    restartAlphaTarget: 0.03,
    linkStrength: (link, totalNodeCount) => {
        // https://github.com/d3/d3-force#link_strength
        const sourceNeighbors = link.source.sourceLinks.size + link.source.targetLinks.size
        const targetNeighbors = link.target.sourceLinks.size + link.target.targetLinks.size
        const weight = link.weight
        return Math.min(weight, 0.9) / (Math.min(sourceNeighbors, targetNeighbors))
    },

    linkDistance: (link, totalNodeCount) => {
        return (1 / link.weight) * INITIAL_DISTANCE + (totalNodeCount * GRAPH_SIZE_FACTOR)
    }
}
