<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->


<script lang='ts'>
    // @ts-nocheck

    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import type { Topology } from 'topojson-client';


    import worldJson from 'world-atlas/countries-110m.json';
  import { scale } from 'svelte/transition';

    

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
        const world = worldJson as Topology;

        const countries = topojson.feature(world, world.objects.countries);

        const globalOutline = {type: "Sphere"};
        const graticule = d3.geoGraticule10();

        const initialScale = projection.scale();

        const globalPath = svg.append('path')
        .datum(globalOutline)
        .attr('class', 'global-outline')
        .attr('d', path);

        const graticulePath = svg.append('path')
        .datum(graticule)
        .attr('class', 'graticule')
        .attr('d', path);


        const countriesPath = svg.append('g')
            .selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', path)
            

        const dragHandler = d3.drag()
            .on('drag', (event) => {
                const rotate =projection.rotate()

                const k = 0.3;

                const newRotate = [
                    rotate[0] + event.dx * k,
                    rotate[1] - event.dy * k,
                    rotate[2]
                ];

                newRotate[1] = Math.max(-90, Math.min(90, newRotate[1]));

                projection.rotate(newRotate);

                svg.selectAll('path').attr('d', path);
            });

            globalPath.call(dragHandler);
            countriesPath.call(dragHandler);
            graticulePath.call(dragHandler);


            const zoomHandler = d3.zoom()
            .scaleExtent([0.8, 10])
                .on('zoom', (event) => {
                    const zoom = projection.scale();

                    const newZoom = zoom * event.transform.k;
                    
                    

                    
                    projection.scale(newZoom);

                    svg.selectAll('path').attr('d', path);
                })
            

            globalPath.call(zoomHandler);
            countriesPath.call(zoomHandler);
            graticulePath.call(zoomHandler);

            
            // Flights
    })
    
</script>

<main>
    <h1>Kaart</h1>
    <svg {width} height={height} bind:this={svgElement} viewBox="0 0 {width} {width}"></svg>
</main>

<style>
    *,*::before,*::after {
        box-sizing: border-box;
        transition: all 0.5s ease-in-out;
    }
    main {
        width: 100%;
        text-align: center;
        position: sticky;
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
        cursor: move;
    }
    :global(.graticule) {
        fill: none;
        stroke: yellow;
        stroke-width: 4px;
    }
    :global(.country) {
        fill: black;
        stroke: white;
        stroke-width: 0.5px;
        cursor: move;
    }
</style>
