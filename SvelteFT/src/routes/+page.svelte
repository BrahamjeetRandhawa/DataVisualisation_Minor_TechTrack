<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p> -->






<script >
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json'


    import { onMount } from 'svelte'
    
    // const width = 1200;
    // const height = 1200;


    // !Important localStorage setup for flights

    const CACHE_KEY = 'flightDataStorage';
    const CACHE_TIMESTAMP = 'flightDataTime';
    const CACHE_DURATION = 5 * 60 * 1000;


    let width;
    let height;


    let allFlights = [];
    let flightData = [];
    let svgContainer;

    let projection;
    let path;
    let svg;
    let initialScale;
    let currentZoom;
    let sensitivity = 0.25;
    let intervalID;
    let hasMoved = false;
    let timer;

    const speedFactor = 0.0000005;


    $: if (svg && projection && width && height) {
        svg
        .attr("width", width)
        .attr("height", height);

        projection
        .translate([width / 2, height / 2]);

        path = d3.geoPath(projection);

        svg.select(".sphere")
        .attr("d", path);

        svg.selectAll(".country")
        .attr("d", path);

        updateFlights();
    }




    const visibleThreshold = Math.PI / 2;

    function updateFlights() {
        if (!svg || !projection || flightData.length === 0) return;

        const center =[-projection.rotate()[0], -projection.rotate()[1]];
        const iconSize = 20;


        svg.selectAll("image.flight")
        .style("display", d => {
            const dist = d3.geoDistance(d.coords, center);
            return dist > visibleThreshold ? "none" : "block";
        })
        .attr("transform", d => {
            const p = projection(d.coords);
            if (!p) return null;

            const x = p[0] - (iconSize / 2);
            const y = p[1] - (iconSize / 2);
            return `translate(${x}, ${y}) rotate(${d.heading}, ${(iconSize / 2)}, ${(iconSize / 2)})`;
        })
    }

        // svg.selectAll("image.flight")
        // .each(function(d) {
        //     const isVisible = d3.geoDistance(d.coords, center) <= visiblethreshold;

        //     if (isVisible) {

        //         const [x, y] = projection(d. coords);
        //         d3.select(this)
        //         .attr("x", x - (iconSize / 2))
        //         .attr("y", y - (iconSize / 2))

        //         .attr("transform", `rotate(${d.heading}, ${x}, ${y})`)
        //         .style("display", "block");
        //     } else {
        //         d3.select(this)
        //         .style("display", "none")
        //     }
    //     })
    








    function drawFlightsOnGlobe(flights) {
        flightData = flights
        .filter(flight => flight[5] != null && flight[6] != null)
        .map(flight => ({
        coords: [flight[5], flight[6]],
        heading: flight[10] || 0,
        velocity: flight[9] || 0,
        callSign: flight[1] || "N/A",
        id: flight[0]
// Here I extract the flight coordinates and heading. The 5 and 6 are the [long, lat] indexes from the json. The 10 is the heading index. With 0 being a fallback, if heading cannot be found.


    }));
        


        const iconSize = 20;

        svg.selectAll("image.flight")
        .data(flightData, d => d.id)
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
        // .attr("x", (d) => projection(d) ? projection(d)[0] - (iconSize / 2) : null)
        // .attr("y", (d) => projection(d) ? projection(d)[1] - (iconSize / 2) : null)
        // .style("display", (d) => projection(d) ? "block" : "none")
        

        updateFlights();
    }

    $: if (allFlights.length > 0 && svgContainer && projection) {
        drawFlightsOnGlobe(allFlights);
        console.log("Flights has data");
    }








    async function fetchData(forceRefresh = false) {
     try {
            const nowData = Date.now();

            if (!forceRefresh) {
                const storedData = localStorage.getItem(CACHE_KEY);
                const storedTime = localStorage.getItem(CACHE_TIMESTAMP);

                if (storedData && storedTime (now - storedTime < CACHE_DURATION)) {
                    console.log('localStorage is being used!');
                    allFlights = JSON.parse(storedData);
                    return;
                }
            }


            console.log('Fresh data fetch from API works');
            const response = await fetch('/API/flights');

            if (!response.ok) {
                throw new Error('Data ophaal error');
            }
            if (response.ok) {
                console.log('Data Succes')
            }
            const flightsData = await response.json();

            if (Array.isArray(flightsData)){
                allFlights = flightsData;
            }
            // allFlights = flightsData;
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(flightsData));
            localStorage.setItem(CACHE_TIMESTAMP, now.toString());
            console.log('Data secured in localStorage');
            
        } catch (error) {
            console.error('Fout gegevens ophalen:', error);

            const fallBackData = localStorage.getItem(CACHE_KEY);
            if (fallBackData) {
                console.warn('API failed, using backup cache');
                allFlights = JSON.parse(fallBackData);
            }
        }
    }














    onMount( async() => {
        
    
        initialScale = Math.min(width, height) / 2.2;


        // const
        projection = d3.geoOrthographic()
        .rotate([0, 0])
        .center([0, 0])
        .clipAngle(90)
        .scale(initialScale)
        .translate([width / 2, height / 2])

        // currentZoom = projection.scale() || 1;


        path = d3.geoPath(projection);

        // const 
        svg = d3.select(svgContainer);

        // svg
        // .attr("width", width)
        // .attr("height", height)

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
            // const sensitivity = 0.25
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
            const newScale = initialScale * event.transform.k;

            projection.scale(newScale);

            path = d3.geoPath(projection)
            svg.selectAll("path")
            .attr("d", path);




            

            if (event.transform.k > 20) {
            sensitivity = 0.01;
        } else if (event.transform.k > 10) {
            sensitivity = 0.20;
        } else if (event.transform.k > 5) {
            sensitivity = 0.22;
        } else if (event.transform.k < 5) {
            sensitivity = 0.25;
        }

        



            // svg.selectAll("circle.flight")
            // .attr("cx", (d) => projection(d) ? projection(d)[0] : null)
            // .attr("cy", (d) => projection(d) ? projection(d)[1] : null)
            // .style("display", (d) => projection(d) ? "block" : "none")

            updateFlights();
        });
        

        svg
        .call(drag)
        .call(zoom);

        timer = d3.timer((elapsed => {

            if (!flightData || flightData.length === 0) return;

            
            flightData.forEach(d => {
                if(d.velocity && d.velocity > 0) {


                    const rad = (d.heading * Math.PI) /180;

                    const dLat = Math.cos(rad) * d.velocity * speedFactor;
                    const dLon = Math.sin(rad) * d.velocity * speedFactor;


                    d.coords[0] += dLon;
                    d.coords[1] += dLat;
                    hasMoved = true;

                }
            });

            if(hasMoved)
            updateFlights();
        }))

        







        // try {
        //     const response = await fetch('/API/flights');

        //     if (!response.ok) {
        //         throw new Error('Data ophaal error');
        //     }
        //     if (response.ok) {
        //         console.log('Data Succes')
        //     }
        //     const flightsData = await response.json();

        //     allFlights = flightsData;
            

        // } catch (error) {
        //     console.error('Fout gegevens ophalen:', error);
        // }


        await fetchData(false);

        // elke 2 minuten data verversen = 120000 ms
        const pollingInterval = 1000000;
        intervalID = setInterval(() => fetchData(true), pollingInterval);

        return () => {
            clearInterval(intervalID);
            if (timer) timer.stop();
        }
    
        
    })



    </script>



    <svelte:window bind:innerWidth={width} bind:innerHeight={height} />

    <h1>Flight Tracker</h1>

	<svg id="globe" bind:this={svgContainer}></svg>






    

    <style>
        /* *,*::before,*::after {
            box-sizing: border-box;
            transition: all 0.5s ease-in-out;
        } */

        :global(body) {
            margin: 0;
            padding: 0;
            overflow: hidden;
            
            width: 100vw;
            height: 100vh;

            background-image: url("/UI_IMG/Space_IMG.jpg");
            background-size: cover;
            background-position: center;
            /* background-color: darkblue; */
        }

        /* :global(image.flight) {
            box-sizing: border-box;
            transition: all 0.5s ease-in-out;
        } */

        h1 {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 6.5em;
            margin: 1em auto;
            margin-bottom: 0;
            box-sizing: border-box;
            transition: all 0.5s ease-in-out;
            color: white;
            border: 2px solid green;
        }
        :global(#globe) {
            display: block;
            margin: 0 auto;
            cursor: move;
        }
    </style>
    



    