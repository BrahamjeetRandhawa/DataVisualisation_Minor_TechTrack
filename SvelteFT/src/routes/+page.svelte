<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->






<script >
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json'

    import { onMount } from 'svelte'
    
    const width = 1200;
    const height = 1200;



    onMount(() => {
        
        const projection = d3.geoOrthographic()
        .rotate([0, 0])
        .center([0, 0])
        .clipAngle(90)
        .scale(height / 2)
        .translate([width / 2, height / 2])

        const currentZoom = projection.scale()


        let path = d3.geoPath(projection);

        const svg = d3.select("#globe");

        svg.attr("width", width)
        .attr("height", height)

        // const features = worldJson

        
        const countries = topojson.feature(worldJson, worldJson.objects.countries);


        svg.append("path")
        .datum({type: "Sphere"})
        .attr("d", path)
        .attr("fill", "#2B65EC")
        .attr("stroke", "black")
        .attr("stroke-width", 1)

        // d3.select("#globe")
        // .attr("width", width)
        // .attr("height", height)



        svg.selectAll(".country")
            .data(countries.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            // .attr("d", d3.geoPath())
            .attr("fill", "grey")
            .attr("stroke", "black")




        const drag = d3.drag()
        .on("start", (/** @type {any} */event) => {
            event.subject.rotate = projection.rotate()
        })
        .on("drag", (/** @type {any} */event) => {
            const sensitivity = 0.25
            const currentRotate = projection.rotate()
            // const rotate = event.subject.rotate
            const k = sensitivity
        

        projection.rotate([
            currentRotate[0] + event.dx * k,
            currentRotate[1] - event.dy * k,
            currentRotate[2]
        ]);

        path = d3.geoPath(projection)

        svg.selectAll("path")
        .attr("d", path)

        })

        

        // const zoom = d3.zoom()
        // .on("start",  (/** @type {any} */ event) => {
        //     event.subject.zoom = projection.scale()
        // })
        // .on("zoom", (/** @type {any} */event) => {
        //     const currentZoom = projection.zoom()

        //     projection.zoom([
        //         currentZoom[0] + event.zoom,
        //         currentZoom[1] - event.zoom
        //     ])
        // })


        const zoom = d3.zoom()
        .scaleExtent([0.5, 20])
        .on("zoom", (/** @type {any} */event) => {
            const newScale = currentZoom * event.transform.k;

            projection.scale(newScale);

            path = d3.geoPath(projection)
            svg.selectAll("path")
            .attr("d", path);
        });
        

        svg
        .call(drag)
        .call(zoom);
    
        
    })



    </script>
    

    <style>
        :global(#globe) {
            display: block;
            margin: 0 auto;
            cursor: move;
        }
    </style>
    



    