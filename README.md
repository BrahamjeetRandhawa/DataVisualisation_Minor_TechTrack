# DataVisualisation_Minor_TechTrack
TechTrack_Minor_Datavisualisation


# Real-Time 3D Flight Tracker

[Link to website] | [https://github.com/BrahamjeetRandhawa/DataVisualisation_Minor_TechTrack]

## Overview
A flight tracking application built with **Svelte** and **d3**. Unlike standard 2D map trackers, this projects real-time flights on an interactive 3D map.

This features **client-side interpolation**, meaning aircraft positions are calculated and animated smoothly between API updates based on their heading, rather than just updating the aircrafts on API fetch to their new coordinates.

## Key features

* **Interactive D3 Globe:**
    * An orthographic projection with realistic drag and zoom logic.
    * **Dynamic zoom sensitivity:** Drag sensitivity adjusts automatically based on zoom level. This gives the user a more precise drag control.
* **Real-Time Data & Interpolation:**
    * Fetches live flight data via API.
    * **Physics Engine:** Uses a custom D3 timer loop to calculate aircraft trajectories. With the heading and velocity it became possible to calculate the animation with the right direction and distance. The 'dLat and dLon' (distance latitude, distance longitude) are used to determine the distance in two directions. The vertical direction and the horizontal direction. This gives the vector between the two and therefor the distance and coordination to where the aircraft should be animated to.
* **Smart Rendering**
    * Calculates distance of the globe to hide the aircrafts. When the aircraft gets behind the globe, the aircraft will stop rendering, and therefor stop using heavy cpu and gpu resources to render them.
    * Hover tooltip with custom 'Svelte' transitions ('smartOut').
    * Detailed flight cards showing altitude, verical rate (at what rate is the flight climbing or descending?), and country of origin.

## Technical usage
* **Frontend Framework:** [Svelte / SvelteKit]
* **Data visualization:** D3.js ('D3-geo', 'd3-timer', 'd3-zoom', 'd3-drag')
* **Geography Data:** TopoJSON (World Atlas 110m)
* **Styling:** CSS / Svelte Scoped Styles
* **API:** [OpenSky Network]

## Technical Highlights

### 1. Flight Path Interpolation
To solve the issue of "Stuttering" aircraft updates, since the API only updates every couple of minutes. The flights animation in between API fetch has been implemented.

```javascript
    const rad = (d.heading * Math.PI) /180;
    const dLat = Math.cos(rad) * d.velocity * speedFactor;
    const dLon = Math.sin(rad) * d.velocity * speedFactor;

    d.coords[0] += dLon;
    d.coords[1] += dLat;
```

### Aircraft rendering
To ensure a good performance while using the "Flight Tracker", the aircrafts rendering moment has been changed. Now the aircrafst will not load all at once on the globe. It will first detemine if it is on the globe or behind the globe. If behind the globe, the aircafst will hide, and will therefor stopp using cpu and or gpu usage. 

```javascript
const visibleThreshold = Math.PI / 2; 
// A full circle is 2 PI. This translates to 360 degrees. But Half of the circle is dived by 2 which translates to PI and to 180 degrees. The center of the circle to the edge of the globe is 90 degrees, which is equal to PI / 2. The globe works with PI only and therefore use PI to solve this. Every aircraft that is beyond the horizon will be hidden from the DOM.
const dist = d3.geoDistance(d.coords, center);
return dist > visibleThreshold ? "none" : "block";
```

### Smart zoom interaction
To enhance the user experience, the globe uses different sensitivity levels on each zoom level. It dynamically adjusts to prevent drag sensitivity problems.

```javascript
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
```

## Getting Started
1. Clone the repository
```javascript
git clone []()[]
cd SvelteFT
```

2. Install dependencies
```javascript
npm install
```

3. Run the local server
```javascript
npm run dev
```
