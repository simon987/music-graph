<template>
    <div class="bar-wrapper">
        <el-autocomplete
            class="inline-input"
            v-model="query"
            :fetch-suggestions="fetchSuggestions"
            placeholder="Add nodes"
            :trigger-on-focus="false"
            @select="onSubmit"
        >
            <template slot-scope="{ item }">
                <div class="value" v-bind:class="{tag: item.type === 'tag'}">{{ item.value }} <span class="year"
                                                           v-if="item.year">[{{item.year}}]</span>
                    <span v-if="item.type === 'tag'" class="year">[tag]</span>
                </div>
                <span class="comment" v-if="item.comment">{{ item.comment }}</span>
            </template>
        </el-autocomplete>
    </div>
</template>

<script>
import {MusicGraphApi} from '../MusicGraphApi'

export default {
    name: 'InputBar',
    data: () => {
        return {
            query: '',
            api: new MusicGraphApi()
        }
    },
    methods: {
        onSubmit: function (line) {
            if (line.type === 'artist') {
                this.$emit('addArtist', line.mbid)
            } else if (line.type === 'tag') {
                this.$emit('addTag', line.id)
            }
            this.query = ''
        },
        fetchSuggestions: function (query, callback) {
            if (this.query.length >= 1) {
                this.api.autoComplete(query)
                    .then(data => {
                        callback(data.lines.map(line => {
                            if (line.type === 'artist') {
                                return {
                                    'value': line.name,
                                    'year': line.year,
                                    'comment': line.comment,
                                    'type': line.type,
                                    'mbid': line.id
                                }
                            } else if (line.type === 'tag') {
                                return {
                                    'value': line.name,
                                    'type': line.type,
                                    'id': line.id
                                }
                            }
                        }))
                    })
            } else {
                callback([])
            }
        }
    }
}
</script>

<style scoped>
    .bar-wrapper {
        text-align: center;
        padding: 2em 0;
    }

    .inline-input {
        width: 50%;
    }
    .comment {
        color: #919ba3;
        margin-top: -0.8em;
        padding-left: 0.3em;
        display: block;
    }
    .year {
        color: #828c94;
        font-size: 85%;
        margin-left: 0.1em;
        vertical-align: top;
    }

    .tag {
        color: #409EFF;
    }
</style>
