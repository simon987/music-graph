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
                <div class="value" >{{ item.value }} <span class="year"
                                                           v-if="item.year !== 0">[{{item.year}}]</span></div>
                <span class="comment" v-if="item.comment">{{ item.comment }}</span>
            </template>
        </el-autocomplete>
    </div>
</template>

<script>
import * as _ from 'lodash'
import {MusicGraphApi} from '../MusicGraphApi'

export default {
    name: 'InputBar',
    data: () => {
        return {
            query: '',
            api: new MusicGraphApi()
        }
    },
    watch: {
        query: _.debounce(function () {
            if (this.query.length >= 3) {
                this.api.autoComplete(this.query)
            }
        }, 500)
    },
    methods: {
        onSubmit: function (artist) {
            this.$emit('query', artist.mbid)
            this.query = ''
        },
        fetchSuggestions: function (query, callback) {
            if (this.query.length >= 3) {
                this.api.autoComplete(query)
                    .then(data => {
                        callback(data.artists.map(a => {
                            return {
                                'value': a.name,
                                'year': a.year,
                                'comment': a.comment,
                                'mbid': a.mbid
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
</style>
