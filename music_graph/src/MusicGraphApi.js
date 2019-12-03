import * as d3 from 'd3'
import {isGenreTag} from './genres'

const IGNORE_DATES_TAG = true
const ONLY_GENRE_TAGS = false

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

export function MusicGraphApi(data) {
    this.url = window.location.protocol + '//' + window.location.hostname + '/api'
    // this.url = window.location.protocol + '//' + window.location.hostname + ':3030'
    this._data = data

    let loadWrapper = (fn) => {
        return (...args) => {
            this._data.loading = true
            return fn(...args).then(x => {
                this._data.loading = false
                return x
            })
        }
    }

    this.resolveCoverUrl = function (mbid) {
        return this.url + '/cover/' + mbid
    }

    this.getArtistDetails = loadWrapper((mbid) => {
        return d3.json(this.url + '/artist/details/' + mbid)
    })

    /**
     * Works in both directions
     * @returns {Promise<{newNodes: *, relations: *} | never>}
     */
    this.getGroupMembers = loadWrapper((mbid, originId) => {
        return d3.json(this.url + '/artist/members/' + mbid)
            .then((r) => {
                return {
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.artists.map(a => {
                        return {
                            source: originId,
                            target: a.id,
                            weight: 0.8
                        }
                    })
                }
            })
    })

    this.getArtistLabels = loadWrapper((mbid, originId) => {
        return d3.json(this.url + '/artist/details/' + mbid)
            .then((r) => {
                const newNodes = r.labels
                    .map(l => {
                        l.labels = ['Label']
                        return l
                    })
                    .map(nodeUtils.fromRawDict)

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
    })

    this._filterTags = tags => {
        if (ONLY_GENRE_TAGS) {
            return tags.filter(tag => isGenreTag(tag.name, tag.tagid))
        } else if (IGNORE_DATES_TAG) {
            return tags.filter(tag => isNaN(tag.name) && isNaN(tag.name.slice(0, -1)))
        }
        return tags
    }

    this._addTagLabel = (objects) => {
        return objects.map(tag => {
            tag.labels = ['Tag']
            return tag
        })
    }

    this.getArtistTags = loadWrapper((mbid, originId) => {
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
    })

    this.getRelatedTags = loadWrapper((tagId) => {
        return d3.json(this.url + '/tag/tag/' + tagId)
            .then((r) => {
                const tags = this._filterTags(r.tags)
                let directedRelations = r.relations.map(rel => {
                    // Make new nodes children of the expanded nodes, no matter the original direction
                    if (rel.source === tagId) {
                        return rel
                    } else {
                        return {
                            source: rel.target,
                            target: rel.source,
                            weight: rel.weight
                        }
                    }
                })

                return {
                    newNodes: this._addTagLabel(tags).map(nodeUtils.fromRawDict),
                    relations: directedRelations
                }
            })
    })

    this.getRelatedByMbid = loadWrapper((mbid) => {
        return d3.json(this.url + '/artist/related/' + mbid)
            .then((r) => {
                let node = nodeUtils.fromRawDict(r.artists.find(a => a.mbid === mbid))
                let directedRelations = r.relations.map(rel => {
                    // Make new nodes children of the expanded nodes, no matter the original direction
                    if (rel.source === node.id) {
                        return rel
                    } else {
                        return {
                            source: rel.target,
                            target: rel.source,
                            weight: rel.weight
                        }
                    }
                })

                return {
                    node: node,
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: directedRelations
                }
            })
    })

    this.getRelatedByTag = loadWrapper((tagid) => {
        return d3.json(this.url + '/tag/related/' + tagid)
            .then((r) => {
                return {
                    node: nodeUtils.fromRawDict({
                        labels: ['Tag'],
                        id: r.tag.id,
                        name: r.tag.name
                    }),
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.relations.map(rel => {
                        // Invert relation direction
                        return {
                            source: rel.target,
                            target: rel.source,
                            weight: Math.min(Math.max(rel.weight * 1.5, 0.2), 1)
                        }
                    })
                }
            })
    })

    this.getReleaseDetails = loadWrapper((mbid, originId) => {
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
    })

    this.getPath = loadWrapper((idFrom, idTo) => {
        return d3.json(this.url + '/artist/path/' + idFrom + '/' + idTo)
            .then((r) => {
                return {
                    newNodes: r.artists.map(nodeUtils.fromRawDict),
                    relations: r.relations
                }
            })
    })

    this.autoComplete = loadWrapper((prefix) => {
        prefix = prefix
            .replace(/[^\w.\-!?& ]/g, '_').toUpperCase()
            .replace(/ /g, '+')

        return d3.json(this.url + '/autocomplete/' + prefix)
    })
}
