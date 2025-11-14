<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->






<script >
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json'


    import { onMount } from 'svelte'
    
    const width = 1200;
    const height = 1200;


    let allFlights = [];
    let svgContainer;

    let projection;
    let path;
    let svg;



    onMount( async() => {
        
    





        // const
        projection = d3.geoOrthographic()
        .rotate([0, 0])
        .center([0, 0])
        .clipAngle(90)
        .scale(height / 2)
        .translate([width / 2, height / 2])

        const currentZoom = projection.scale()


        path = d3.geoPath(projection);

        // const 
        svg = d3.select(svgContainer);

        svg
        .attr("width", width)
        .attr("height", height)

        // const features = worldJson

        
        const countries = topojson.feature(worldJson, worldJson.objects.countries);


        svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", "#2B65EC")
        .attr("stroke", "black")
        .attr("stroke-width", 1)

        // d3.select("#globe")
        // .attr("width", width)
        // .attr("height", height)



    const visiblethreshold = Math.PI / 2;

    function updateFlights() {
        if (!svg || !projection) return;

        const center =[-projection.rotate()[0], -projection.rotate()[1]];
        const iconSize = 30;

        svg.selectAll("image.flight")
        .each(function(d) {
            const isVisible = d3.geoDistance(d, center) <= visiblethreshold;

            if (isVisible) {

                const [x, y] = projection(d);
                d3.select(this)
                .attr("x", x - (iconSize / 2))
                .attr("y", y - (iconSize / 2))
                .style("display", "block");
            } else {
                d3.select(this)
                .style("display", "none")
            }
        })
    }















        svg.selectAll(".country")
            .data(countries.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            // .attr("d", d3.geoPath())
            .attr("fill", "grey")
            .attr("stroke", "black")




        const drag = d3.drag()
        .on("start", (event) => {
            event.subject.rotate = projection.rotate()
        })
        .on("drag", (event) => {
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

        svg.selectAll("path.country")
        .attr("d", path)

        // svg.selectAll("circle.flight")
        // .attr("cx", (d) => projection(d) ? projection(d)[0] : null)
        // .attr("cy", (d) => projection(d) ? projection(d)[1] : null)
        // .style("display", (d) => projection(d) ? "block" : "none")

        updateFlights();

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
        .scaleExtent([0.5, 30])
        .on("zoom", event => {
            const newScale = currentZoom * event.transform.k;

            projection.scale(newScale);

            path = d3.geoPath(projection)
            svg.selectAll("path")
            .attr("d", path);



            // svg.selectAll("circle.flight")
            // .attr("cx", (d) => projection(d) ? projection(d)[0] : null)
            // .attr("cy", (d) => projection(d) ? projection(d)[1] : null)
            // .style("display", (d) => projection(d) ? "block" : "none")

            updateFlights();
        });
        

        svg
        .call(drag)
        .call(zoom);







        try {
            const response = await fetch('/API/flights');

            if (!response.ok) {
                throw new Error('Data ophaal error');
            }
            if (response.ok) {
                console.log('Data Succes')
            }
            const flightsData = await response.json();

            allFlights = flightsData;
            

        } catch (error) {
            console.error('Fout gegevens ophalen:', error);
        }
    
        
    })

    function drawFlightsOnGlobe(flights) {
        const coordinates = flights
        .filter(flight => flight[5] != null && flight[6] != null)
        .map(flight => [flight[5], flight[6]]);


        const iconSize = 30;

        svg.selectAll("image.flight")
        .data(coordinates)
        .join(enter => enter.append("image")
            .attr("class", "flight")
            .attr("href", "/flight-plane-svgrepo-com.svg")
            .attr("width", iconSize)
            .attr("height", iconSize),
            // .attr("r", 2)
            // .attr("fill", "red"),
            update => update,
            exit => exit.remove()
        )
        .attr("x", (d) => projection(d) ? projection(d)[0] - (iconSize / 2) : null)
        .attr("y", (d) => projection(d) ? projection(d)[1] - (iconSize / 2) : null)
        .style("display", (d) => projection(d) ? "block" : "none")

        updateFlights();
    }

    $: if (allFlights.length > 0 && svgContainer && projection) {
        drawFlightsOnGlobe(allFlights);
        console.log("Flights has data");
    }



    </script>



    <h1>Flight Tracker</h1>

	<svg id="globe" bind:this={svgContainer}></svg>






    

    <style>
        *,*::before,*::after {
            box-sizing: border-box;
            transition: all 0.5s ease-in-out;
        }

        /* body {
            background-color: darkblue;
        } */

        h1 {
            color: white;
        }
        :global(#globe) {
            display: block;
            margin: 0 auto;
            cursor: move;
        }
    </style>
    



    