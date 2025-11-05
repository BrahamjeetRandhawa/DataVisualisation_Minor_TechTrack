<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->






<script >
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json'

    import { onMount } from 'svelte'
    
    const width = 960;
    const height = 960;



    onMount(() => {
        
        const projection = d3.geoOrthographic()
        .rotate([0, 0])
        .center([0, 0])
        .clipAngle(90)
        .scale(height / 2 - 10)
        .translate([width / 2, height / 2])


        const path = d3.geoPath(projection);

        const svg = d3.select("#globe");

        svg.attr("width", width)
        .attr("height", height)

        const features = worldJson

        const countries = topojson.feature(worldJson, worldJson.objects.countries);


        svg.append("path")
        .datum({type: "Sphere"})
        .attr("d", path)
        .attr("fill", "black")
        .attr("stroke", "blue")
        .attr("stroke-width", 15)

        // d3.select("#globe")
        // .attr("width", width)
        // .attr("height", height)



        svg.selectAll(".country")
            .data(countries.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("d", d3.geoPath())
            .attr("fill", "green")
            .attr("stroke", "red")
    })

    </script>
    

    <style>
        :global(#globe) {
            display: block;
            margin: 20px;
        }
    </style>
    



    