<template>
    <div class="bar-wrapper">
        <el-input
            v-model="query"
            @keyup.enter.native="onSubmit"
            placeholder="Add nodes"
        ></el-input>
    </div>
</template>

<script>
import * as _ from 'lodash'

export default {
    name: 'InputBar',
    data: () => {
        return {
            query: ''
        }
    },
    watch: {
        query: _.debounce(function () {
            // todo: autocomplete

        }, 125)
    },
    methods: {
        onSubmit: function () {
            this.$emit('query', this.query)
            this.query = ''
        }
    }
}
</script>

<style scoped>
    .bar-wrapper {
        text-align: center;
        padding: 2em 0;
    }

    .el-input {
        width: 50%;
    }
</style>
