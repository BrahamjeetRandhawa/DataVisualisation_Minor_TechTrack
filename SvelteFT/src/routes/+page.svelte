<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->



<body>
    <h1>hello</h1>

    <svg></svg>
</body>


<script >
    // @ts-nocheck
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json'
    
    



    const projection = d3.geoOrthographic()
    .rotate([0, 0])
    .clipAngle(90)
    .center([0, 0])

    const path = d3.geoPath(projection);
    



    const features = topojson.feature(worldJson, worldJson.objects.countries).features;

    const svg = d3.select("svg");

    svg.selectAll()
    .data(features)
    .join("path")
    .attr("d", path);

</script>



<style></style>



<!-- 
<script lang='ts'>
    // @ts-nocheck

    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import type { Topology } from 'topojson-client';


    import worldJson from 'world-atlas/countries-110m.json';
//   import { scale } from 'svelte/transition';

    

    const width = 960;
    const height = 960;

    let svgElement: SVGElement;

    const projection = d3.geoAzimuthalEqualArea()
    .rotate([0, 0])
    .scale(250)
    .center([0, 0])
    .translate([width / 2, height / 2])
    .clipAngle(90);

    // const path = d3.geoPath(projection);

    const path = d3.geoPath().projection(projection);






    async function loadFlights() {
        try {
            const response = await fetch('/API/flights');
            if (!response.ok) {
                throw new Error('failed to fetch', error);
            }

            const flights = await response.json();

            svg.append('g')
            .selectAll('flight')
            // .data(validFlights)
            .enter()
            .append('circle')
            .attr('class', 'flights')
            .attr('r', 20)
            .attr('cx', 30)
            .attr('cy', 30);

        } catch (error) {
            console.error('failed to fetch the data', error)
            }
    } 









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
            
        // countries.append("title")
        //     .text(d => d.properties.name);

        const dragHandler = d3.drag()
            .on('start', (event) => {
                event.sourceEvent.stopPropagation(); 
            })
                // Hiermee wordt de drag functie niet doorgegeven aan de zoom functie

                .on('drag', (event) => {
                
                const rotate = projection.rotate()

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
            .scaleExtent([0.8, 20])
                .on('zoom', (event) => {
                    // const zoom = projection.scale();

                    const newZoom = initialScale * event.transform.k;
                    
                    

                    
                    projection.scale(newZoom);

                    svg.selectAll('path').attr('d', path);
                })
            
                svg.call(zoomHandler);

            // globalPath.call(zoomHandler);
            // countriesPath.call(zoomHandler);
            // graticulePath.call(zoomHandler);

            // function resetZoom() {
            // countries.transition().style("fill", null);
            // svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity, d3.zoomTransform(svg.node()).invert([width / 2, height / 2]));

            // }


            
            // Flights

            loadFlights();
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
        color: white;
        text-align: center;
        position: sticky;
        background-color: rgba(0, 0, 50, 1);
    }
    svg {
        border: 1px solid black;
        max-width: 100%;
        height: auto;
    }
    :global(.global-outline) {
        fill: lightblue;
        stroke: green;
        stroke-width: 2px;
        cursor: grab;
    }
    :global(.graticule) {
        fill: none;
        stroke: white;
        stroke-width: 1px;
        cursor: grab;
    }
    :global(.country) {
        fill: black;
        stroke: white;
        stroke-width: 0.5px;
        cursor: grab;
    }
    :global(.flights) {
        fill: red;

    }
</style> -->
