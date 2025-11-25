

<script>
    import Tooltip from '$lib/components/Tooltip.svelte';
    import { tooltip } from '$lib/components/tooltip';
    import { tooltip as tooltipv1 } from '$lib/components/tooltip.v1';
    import { fade } from 'svelte/transition';

    export let hoveredFlight;
    export let mouseX = 0;
    export let mouseY = 0;

</script>


 <!-- Here I use the '?' atribute. With this optional chaining gets available, and hoveredFlights can be null, which then results in undefined, instead of a crash. -->
    <div 
        class="tooltip-wrapper"
        style="top: {mouseY}px; left: {mouseX}px;" 
        transition:fade={{ duration: 100 }}>
    <Tooltip data={hoveredFlight} />
    </div>


    <style>
        .tooltip-wrapper {
            position: absolute;
            pointer-events: none;
            transform: translate(15px, 15px);
            z-index: 1000;
        }
    </style>