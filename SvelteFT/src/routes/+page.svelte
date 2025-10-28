<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->


<script lang='ts'>

    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import world from 'world-atlas/countries-110m.json';

    const width = 960;
    const height = 960;

    let svgElement: SVGElement;

    const projection = d3.geoAzimuthalEqualArea()
    .rotate([90, 180])
    .scale(250)
    .center([0, 0])
    .translate([width / 2, height / 2]);

    // const path = d3.geoPath(projection);

    const path = d3.geoPath().projection(projection);


    onMount(() => {
        const svg = d3.select(svgElement);

        const countries = topojson.feature(world, world.objects.countries);

        svg.append('g')
            .selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path)
            

            // Flights
    })
    
</script>

<main>
    <h1>Kaart</h1>
    <svg {width} height={height} bind:this={svgElement} viewBox="0 0 {width} {width}"></svg>
</main>

<style>
    main {
        width: 100%;
        text-align: center;
    }
    svg {
        border: 1px solid black;
        max-width: 100%;
        height: auto;
    }
    :global(.global-outline) {
        fill: red;
        stroke: green;
        stroke-width: 2px;
    }
    :global(.graticule) {
        fill: none;
        stroke: yellow;
        stroke-width: 4px;
    }
    :global(.country) {
        fill: lightgray;
        stroke: white;
        stroke-width: 0.5px;
    }
</style>
