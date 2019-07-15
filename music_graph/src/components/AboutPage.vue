<template>
    <el-main>
        <a href="/">Back</a>
        <h2>music-graph - About</h2>
        <p>This project was created to display the interconnectedness of the different actors and genres in contemporary music.</p>
        <p>The raw data is collected, cleaned up and normalized using
            <a href="https://github.com/simon987/music-graph-scripts">an array of Python scripts</a> and
            orchestrated with <a href="https://github.com/simon987/task_tracker">task_tracker</a>. Below is the flow
            of the collected data. The colored nodes are imported into a graph database (Neo4j).
        </p>
        <object data="/static/data.svg" type="image/svg+xml"></object>
        <p>About 1Tib of raw data is downloaded and processed into ~20Gb of binary data in the final stage.</p>
        <p>The project and all its dependencies are entirely open source and can be found on
            <a href="https://github.com/simon987/">Github</a></p>

        <p></p>
        <p>For any questions or feedback you can contact me by email at <code>me[at]simon987.net</code> <a href="https://simon987.net/gpg/">[GPG]</a></p>
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

    object {
        font-size: 90%;
    }

    .el-main {
        font-family: 'Lucida Grande', 'Lucida Sans Unicode', 'Geneva', 'Verdana', sans-serif;
    }
</style>
