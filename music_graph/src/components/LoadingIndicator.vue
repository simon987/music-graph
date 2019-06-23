<template>
    <el-icon class="el-icon-loading" :class="{hidden: !loading}" id="loading"></el-icon>
</template>

<script>

export default {
    name: 'LoadingIndicator',
    props: ['loading']
}
</script>

<style scoped>
    .hidden {
        display: none;
    }

    #loading {
        position: fixed;
        top: calc(100% - 90px);
        left: 75px;
        pointer-events: none;
        color: rgba(0, 0, 0, 0.67);
        font-size: 50px;
    }
</style>
