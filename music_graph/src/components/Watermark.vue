<template>
    <span id="watermark">{{text}}</span>
</template>

<script>

export default {
    name: 'Watermark',
    props: ['text']

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
