import * as d3 from 'd3'

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
    fromRawDict: function (data) {
        return {
            id: data.id,
            mbid: data.mbid,
            name: data.name,
            listeners: data.listeners,
            type: nodeUtils.getNodeType(data.labels),
            sourceLinks: new Set(),
            targetLinks: new Set()
        }
    }
}

export function MusicGraphApi() {
    this.url = window.location.protocol + '//' + window.location.hostname + '/api'
    // TODO: rmv
    this.url = 'http://localhost:3030'

    this.resolveCoverUrl = function(mbid) {
        return this.url + '/cover/' + mbid
    }

    this.getArtistDetails = function(mbid) {
        return d3.json(this.url + '/artist/details/' + mbid)
    }

    this.getRelatedByName = function (name) {
        return d3.json(this.url + '/artist/related_by_name/' + name)
            .then((r) => {
                return {
                    node: nodeUtils.fromRawDict(r.artists.find(a => a.name === name)),
                    // TODO: newNodes is always ignored, remove this?
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.relations
                }
            })
    }

    this.getRelatedByMbid = function (mbid) {
        return d3.json(this.url + '/artist/related/' + mbid)
            .then((r) => {
                return {
                    node: nodeUtils.fromRawDict(r.artists.find(a => a.mbid === mbid)),
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.relations
                }
            })
    }
}
