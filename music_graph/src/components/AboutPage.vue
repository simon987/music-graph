<template>
    <el-main>
        <span>This is the about page</span>
        <object data="/static/diagram.svg" type="image/svg+xml"></object>
    </el-main>
</template>

<script>

export default {
    name: 'AboutPage'

}
</script>

<style scoped>
    #watermark {
        position: fixed;
        top: calc(100% - 30px);
        left: 1%;
        pointer-events: none;
        color: rgba(0,0,0,0.67);
        font-family: 'Consolas', 'Deja Vu Sans Mono', 'Bitstream Vera Sans Mono', monospace;
    }
</style>
