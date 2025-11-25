
<!-- ------Flight Tracker------ -->

<script >
    import * as d3 from 'd3';
    import * as topojson from 'topojson-client';
    import worldJson from 'world-atlas/countries-110m.json'
    import FlightCard from '$lib/components/flightCard.svelte'
    import TooltipSetup from '$lib/components/tooltipSetup.svelte'

    import { fade, scale, crossfade } from 'svelte/transition';
    import { cubicOut, quintOut } from 'svelte/easing'

    import { onMount } from 'svelte'
    
    // !Important localStorage setup for flights
    const CACHE_KEY = 'flightDataStorage';
    const CACHE_TIMESTAMP = 'flightDataTime';
    const CACHE_DURATION = 5 * 60 * 1000;

    // ------Global variables------

    // The variables will be placed outside the scope. The variables cannot be used for other functions if used in one function.
    let width;
    let height;

    // dataHandling for the aircrafts
    let allFlights = [];
    let flightData = [];
    let svgContainer;

    // globe and features variables
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

    // For hover effect on aircrafts
    let hoveredFlight = null;
    let mouseX = 0;
    let mouseY = 0;

    // For flight stats on card
    let selectedFlight = null;

    // Aircraft sizes
    let iconSize = 25;
    let currentSize;

    // const [send, receive] = crossfade({
    //     // Animation duration from tooltip to flight-card
    //     duration: 600,
    //     easing: quintOut,
    //     // Backup for the animation. If animation does not work, scale the animation
    //     fallback: scale
    // })

    // Gemini gave this code snippet to stop the animation when hovering over the aircrafts. Otherwise the aircrafts always want to animate, which takes a lot of resources and will break the globe usage.
    // const smartOut = (node, params) => {
    //     if (selectedFlight) {
    //         return send(node, params);
    //     }
    //     return fade(node, { duration: 100 });
    // }

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

    // The visibleThreshold keeps the planes from rendering behind the globe. the pi / 2 = 1/2pi. This also equals to 90 degrees, because 2pi is 360 degrees. Th globe has 2 parts with 90 degree radius, which means, everything above it should be hidden and not rendered.
    const visibleThreshold = Math.PI / 2;

    const updateFlights = () => {
        if (!svg || !projection || flightData.length === 0) return;

        // Here the center of the globe van be found by not rotating the globe. Because the globe begins in Norwich England, which is the center for [long, lat] coordinates.
        const center =[-projection.rotate()[0], -projection.rotate()[1]];
        // const iconSize = 25;

        // ------Aircraft icons------
        svg.selectAll("image.flight")
        .style("display", d => {
            const dist = d3.geoDistance(d.coords, center);
            return dist > visibleThreshold ? "none" : "block";
        })

        // Here the width and height of the aircraft are determind by the hover state. If the hover is applied to the aircraft, the size will increase to 50 and otherwise it will stay 25. With this the UI get better to understand, and the clickables on the screen is also better understandable.
        .attr("width", d => {
            return (hoveredFlight && d.id === hoveredFlight.id) ? 50 : 25;
        })
        .attr("height", d => {
            return (hoveredFlight && d.id === hoveredFlight.id) ? 50 : 25;
        })
        .attr("transform", d => {
            const p = projection(d.coords);
            if (!p) return null;

            currentSize = (hoveredFlight && d.id === hoveredFlight.id) ? 50 : 25;

            const x = p[0] - (currentSize / 2);
            const y = p[1] - (currentSize / 2);
            return `translate(${x}, ${y}) rotate(${d.heading}, ${(currentSize / 2)}, ${(currentSize / 2)})`;
        })

        .classed("highlighted", d => hoveredFlight && d.id === hoveredFlight.id)
    }






    // ------Data cleaning for aircrafts------
    const drawFlightsOnGlobe = (flights) => {
        flightData = flights
        .filter(flight => flight[5] != null && flight[6] != null)
        .map(flight => ({
        coords: [flight[5], flight[6]],
        heading: flight[10] || 0,
        velocity: flight[9] || 0,
        callSign: flight[1] || "N/A",
        origin_country: flight[2] || "N/A",
        id: flight[0],
        longitude: flight[5],
        latitude: flight[6],
        vertical_rate: flight[11],
        geo_altitude: flight[13],
        // The ? ... : ... is called the 'ternary operator'. This operator gives certain operations by boolean. When the boolean is true, it will return the string before the ':' and false is the string after ':'.
        on_ground: flight[8] ? "aircraft has landed" : "Aircraft is in the air"
        // Here I extract the data that I need for my globe. For instance the coordinates is needed to determine the position of the airplanes on the globe. The [long, lat] can also be shown on screen to the user to let the user further undeerstand the position of the aircraft.
    }));
        
        // const iconSize = 25;

        svg.selectAll("image.flight")
        .data(flightData, d => d.id)
        .join(enter => enter.append("image")
            .attr("class", "flight")

            // Aircraft icon
            .attr("href", "/flight-plane-svgrepo-com.svg")

            // Here the airplanes size is determined at start
            .attr("width", currentSize)
            .attr("height", currentSize)

            .on("click", (event, d) => {
                // This prevents the drag and click issue on the screen. 
                event.stopPropagation();

                // This is the state of the flights
                selectedFlight = d;

                fetchFlightDetails(d.id)

                console.log("Flight selected:", d); 
            })

            .on("mouseover", (event, d) => {
                hoveredFlight = d;
                mouseX = event.pageX;
                mouseY = event.pageY;

                hoveredFlight = d;
                d3.select(event.currentTarget)
                .raise();
            })

            .on("mousemove", (event) => {
                mouseX = event.pageX;
                mouseY = event.pageY;
            })

            .on("mouseout", (event, d) => {

                if (selectedFlight && selectedFlight.id === d.id) {
                    return;
                }
                hoveredFlight = null;

                updateFlights();
            }),
            update => update,
            exit => exit.remove()
        )
        updateFlights();
    }

    $: if (allFlights.length > 0 && svgContainer && projection) {
        drawFlightsOnGlobe(allFlights);
        console.log("Flights has data");
    }

    // function for localStorage in case of token limit reach
    const fetchData = async (forceRefresh = false) => {
     try {
            const nowData = Date.now();

            if (!forceRefresh) {
                const storedData = localStorage.getItem(CACHE_KEY);
                const storedTime = localStorage.getItem(CACHE_TIMESTAMP);

                if (storedData && storedTime && (nowData - storedTime < CACHE_DURATION)) {
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
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(flightsData));
            localStorage.setItem(CACHE_TIMESTAMP, nowData.toString());
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

    const fetchFlightDetails = async (icao24) => {
        selectedFlight = {
            ...selectedFlight,
            estArrivalAirport: 'Loading...',
            estDepartureAirport: 'Loading...'
        };
        try {
            const res = await fetch(`/API/flights/${icao24}`);
            const data = await res.json();

            selectedFlight = {
                ...selectedFlight,
                estArrivalAirport: data.estArrivalAirport || 'Unknown',
                estDepartureAirport: data.estDepartureAirport || 'Unknown'
            };
        } catch (err) {
            console.error(err);
            selectedFlight = { ...selectedFlight, estArrivalAirport: 'Error' };
        }
    }

    // The onMount function here loads as soon as the browser starts. The globe for instance should be loaded when the browser starts, because the globe is the main element on the screen. The functionality should also be loaded with it, because the globe should work accordingly when used.
    onMount( async() => {
        
        initialScale = Math.min(width, height) / 2.2;

        projection = d3.geoOrthographic()
        .rotate([0, 0])
        .center([0, 0])
        .clipAngle(90)
        .scale(initialScale)
        .translate([width / 2, height / 2])

        path = d3.geoPath(projection);

        svg = d3.select(svgContainer);

        const countries = topojson.feature(worldJson, worldJson.objects.countries);

        svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", "#2B65EC")
        .attr("stroke", "black")
        .attr("stroke-width", 1)

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

        updateFlights();
        })

        const zoom = d3.zoom()
        .scaleExtent([0.5, 30])
        .on("zoom", event => {
            const newScale = initialScale * event.transform.k;

            projection.scale(newScale);

            path = d3.geoPath(projection)
            svg.selectAll("path")
            .attr("d", path);

        // The if statements here gives the drag sensitivity for each zoom level. Without these if statements, the drag would become to sensitive in a zoomed level.
        if (event.transform.k > 20) {
            sensitivity = 0.01;
        } else if (event.transform.k > 15) {
            sensitivity = 0.05
        } else if (event.transform.k > 10) {
            sensitivity = 0.10;
        } else if (event.transform.k > 5) {
            sensitivity = 0.20;
        } else if (event.transform.k < 5) {
            sensitivity = 0.25;
        }

            updateFlights();
        });
        
        // Here I call the drag and zoom function to enable the zoom and drag on the globe
        svg
        .call(drag)
        .call(zoom);

        // With the timer function I create a flightpath animation for the aircrafts in between the real API fetch. I have done this, because the API cannot be fetched every couple of second, the API has a token limit.
        timer = d3.timer((elapsed => {

            if (!flightData || flightData.length === 0) return;

            flightData.forEach(d => {
                if(d.velocity && d.velocity > 0) {

                    // Here the heading will be calculated by using the heading and to multiply it by PI. This will then be divided by 180 to transform it into radials. Here radials is better to use, because of the cos and sin calculation after.
                    const rad = (d.heading * Math.PI) /180;

                    // In order to calculate the lat and lon. I have used cos and sin for it. cos and sin can be calculated with a triangle. The distance from the lat and long is 2 parts of a triangle. If I want to know the heading, I should calculate the vector then. Which  is the same as putting the latitude length after the latitude path. If doing so for both, there will come one point which then is the initial vector of the airplane. 
                    const dLat = Math.cos(rad) * d.velocity * speedFactor;
                    const dLon = Math.sin(rad) * d.velocity * speedFactor;


                    // The data for the long and lat will be fetched from here.
                    d.coords[0] += dLon;
                    d.coords[1] += dLat;
                    hasMoved = true;
                }
            });
            if(hasMoved)
            updateFlights();
        }))

        await fetchData(false);

        // elke 2 minuten data verversen = 120000 ms
        const pollingInterval = 120000;
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

    <!-- With the '{#if (data)}', the code within only happens when this is triggerd on the screen. This code snippet will only show up when hovered over the aircrafts. -->
    {#if hoveredFlight && !selectedFlight}
    <TooltipSetup
    hoveredFlight={hoveredFlight}
    mouseX={mouseX}
    mouseY={mouseY}
    />

    {/if}


    {#if selectedFlight}
    <!-- In svelte, not using the capital letters will result in using the tag as html instead of javascript. -->
    <FlightCard
    selectedFlight={selectedFlight}
    on:close={() => selectedFlight = null}
    />
   
    {/if}




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
            /* Fix for h1 background floating above globe */
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            /* To make sure the h1 stays on top of the globe with z-index */
            z-index: 10; 

            width: 7em;
            margin: 1em auto;
            border-radius: 15px;
            padding: 5px;
            margin-bottom: 0;
            box-sizing: border-box;
            transition: all 0.5s ease-in-out;
            /* Colors and shading */
            color: white;
            background-color: rgba(0, 0, 0, 20%);
        }
        
        


        :global(#globe) {
            display: block;
            margin: 0 auto;
            cursor: pointer;
        }
        
        :global(#globe):active {
            cursor: grabbing
        }

        :global(image.flight) {
            /* border: 2px solid green; */
            transition: width 0.1s, height 0.1s;
            cursor: pointer;
        }

        /* :global(image.flight.highlighted) {
            filter: brightness(118%), invert(48%);
        } */

        /* Card UI */

        
    </style>
    



    