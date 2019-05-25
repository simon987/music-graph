import * as d3 from 'd3'
import {genres} from './genres'

const IGNORE_DATES_TAG = true
const ONLY_GENRE_TAGS = true

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
                mbid: data.mbid,
                type: type,
                sourceLinks: new Set(),
                targetLinks: new Set(),
                radius: nodeUtils.radius(type)
            }
        }
    },
    radius: function (type) {
        return 35
    }
}

export function MusicGraphApi() {
    this.url = window.location.protocol + '//' + window.location.hostname + '/api'

    this.resolveCoverUrl = function (mbid) {
        return this.url + '/cover/' + mbid
    }

    this.getArtistDetails = function (mbid) {
        return d3.json(this.url + '/artist/details/' + mbid)
    }

    this.getRelatedByName = function (name) {
        return d3.json(this.url + '/artist/related_by_name/' + name.replace(/ /g, '+'))
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

    this._filterTags = function (tags) {
        if (ONLY_GENRE_TAGS) {
            return tags.filter(tag => genres.has(tag.name))
        } else if (IGNORE_DATES_TAG) {
            return tags.filter(tag => isNaN(tag.name) && isNaN(tag.name.slice(0, -1)))
        }
        return tags
    }

    this._addTagLabel = function (objects) {
        return objects.map(tag => {
            tag.labels = ['Tag']
            return tag
        })
    }

    this.getArtistTags = function (mbid, originId) {
        return d3.json(this.url + '/artist/details/' + mbid)
            .then((r) => {
                const tags = this._filterTags(r.tags)

                return {
                    newNodes: this._addTagLabel(tags).map(nodeUtils.fromRawDict),
                    relations: tags.map(t => {
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

    this.getReleaseDetails = function (mbid, originId) {
        return d3.json(this.url + '/release/details/' + mbid)
            .then((r) => {
                const tags = this._filterTags(r.tags)

                return {
                    newNodes: this._addTagLabel(tags).map(nodeUtils.fromRawDict),
                    relations: tags.map(t => {
                        return {
                            source: originId,
                            target: t.id,
                            weight: t.weight
                        }
                    })
                }
            })
    }
}
