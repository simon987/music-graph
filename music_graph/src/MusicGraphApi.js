import * as d3 from 'd3'

const nodeUtils = {
    getNodeType: function (labels) {
        if (labels.find(l => l === 'Tag')) {
            return 'Tag'
        } else if (labels.find(l => l === 'Group')) {
            return 'Group'
        } else if (labels.find(l => l === 'Artist')) {
            return 'Artist'
        } else if (labels.find(l => l === 'Album')) {
            return 'Album'
        } else if (labels.find(l => l === 'Single')) {
            return 'Single'
        } else if (labels.find(l => l === 'EP')) {
            return 'EP'
        }
        return undefined
    },
    fromRawDict: function (data) {
        const type = nodeUtils.getNodeType(data.labels)

        if (type === 'Group' || type === 'Artist') {
            return {
                id: data.id,
                mbid: data.mbid,
                name: data.name,
                listeners: data.listeners,
                type: type,
                sourceLinks: new Set(),
                targetLinks: new Set(),
                radius: nodeUtils.radius(type)
            }
        } else {
            return {
                id: data.id,
                name: data.name,
                type: type,
                sourceLinks: new Set(),
                targetLinks: new Set(),
                radius: nodeUtils.radius(type)
            }
        }
    },
    radius: function (type) {
        if (type === 'Group') {
            return 35
        } else if (type === 'Artist') {
            return 25
        } else if (type === 'Tag') {
            return 20
        } else if (type === 'Album') {
            return 20
        } else if (type === 'EP' || type === 'Single') {
            return 15
        }
    }
}

export function MusicGraphApi() {
    this.url = window.location.protocol + '//' + window.location.hostname + '/api'
    // TODO: rmv
    this.url = 'http://localhost:3030'

    this.resolveCoverUrl = function (mbid) {
        return this.url + '/cover/' + mbid
    }

    this.getArtistDetails = function (mbid) {
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

    this.getGroupMembers = function (mbid, originId) {
        return d3.json(this.url + '/artist/members/' + mbid)
            .then((r) => {
                return {
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.artists.map(a => {
                        return {
                            source: a.id,
                            target: originId,
                            weight: 0.8
                        }
                    })
                }
            })
    }

    this.getArtistReleases = function (mbid, originId) {
        return d3.json(this.url + '/artist/details/' + mbid)
            .then((r) => {
                const newNodes = r.releases
                    .map(nodeUtils.fromRawDict)
                    .filter(release => release.type === 'Album')

                return {
                    newNodes: newNodes,
                    relations: newNodes.map(t => {
                        return {
                            source: originId,
                            target: t.id,
                            weight: 0.8
                        }
                    })
                }
            })
    }

    this.getArtistTags = function (mbid, originId) {
        return d3.json(this.url + '/artist/details/' + mbid)
            .then((r) => {
                return {
                    newNodes: r.tags.map(tag => {
                        tag.labels = ['Tag']
                        return tag
                    }).map(nodeUtils.fromRawDict),
                    relations: r.tags.map(t => {
                        return {
                            source: originId,
                            target: t.id,
                            weight: t.weight
                        }
                    })
                }
            })
    }

    this.getRelatedByMbid = function (mbid) {
        return d3.json(this.url + '/artist/related/' + mbid)
            .then((r) => {
                return {
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.relations
                }
            })
    }
}
