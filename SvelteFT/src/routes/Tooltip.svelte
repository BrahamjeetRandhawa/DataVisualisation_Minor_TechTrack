

<script>
    export let data; // This receives the hoveredFlight object
</script>

<div class="box">
    <h3>{data.callSign}</h3>
    <p>Speed: {data.velocity}</p>
</div>

<style>
    .box {
        background: rgba(0, 0, 0, 60%);
        color: white;
        padding-left: 5px;
        padding-right: 5px;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: start;
        flex-direction: column;
    }

    .box h3 {
        margin-top: .1em;
    }

    .box p {
        margin-top: .1em;
    }
</style>