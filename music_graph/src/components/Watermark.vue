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
    @media screen and (min-width: 600px) {
        #watermark {
            position: fixed;
            top: calc(100% - 30px);
            left: 20px;
            pointer-events: none;
            color: rgba(0, 0, 0, 0.67);
            font-family: 'Consolas', 'Deja Vu Sans Mono', 'Bitstream Vera Sans Mono', monospace;
        }
    }

    @media screen and (max-width: 601px) {
        #watermark {
            position: fixed;
            top: calc(100% - 225px);
            left: 10px;
            pointer-events: none;
            color: rgba(0, 0, 0, 0.67);
            font-family: 'Consolas', 'Deja Vu Sans Mono', 'Bitstream Vera Sans Mono', monospace;
        }
    }
</style>
