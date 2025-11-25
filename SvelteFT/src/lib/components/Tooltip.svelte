

<script>
    export let data; // This receives the hoveredFlight object
</script>

<div class="box">
    <h3>{data.callSign}</h3>
</div>

<style>
    .box {
        background: rgba(0, 0, 0, 60%);
        color: white;
        padding: 0px 15px 0px 15px;
        border-radius: 5px;

        font-size: 18px;
    }
</style>