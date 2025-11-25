

<script>
    import Tooltip from '$lib/components/Tooltip.svelte';
    import { tooltip } from '$lib/components/tooltip';
    import { tooltip as tooltipv1 } from '$lib/components/tooltip.v1';

    export let hoveredFlight;
    export let mouseX = 0;
    export let mouseY = 0;
    export let send;
    export let receive;

    let activeFlight = hoveredFlight;

    $: if (hoveredFlight) {
        activeFlight = hoveredFlight;
    }

</script>


 <!-- Here I use the '?' atribute. With this optional chaining gets available, and hoveredFlights can be null, which then results in undefined, instead of a crash. -->
    <div 
        class="tooltip-wrapper"
        style="top: {mouseY}px; left: {mouseX}px;" 
        out:send={{ key: activeFlight.id }}
        in:receive={{ key: activeFlight.id }}
        >
    <Tooltip data={activeFlight} />
    </div>


