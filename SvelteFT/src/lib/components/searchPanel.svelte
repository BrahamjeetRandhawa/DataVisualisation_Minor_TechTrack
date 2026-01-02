

<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let isOpen = false;
    let searchQuery = '';

    export let flightData = [];
    let filteredFlights = [];
    let showSuggestions = false;

    const togglePanel = () => {
        isOpen = !isOpen;
    }

    const handleSearch = () => {
        showSuggestions = false;
        dispatch('search', { query: searchQuery });
    }

    const selectSuggestion = (flight) => {
        searchQuery = flight.callSign;
        showSuggestions = false;
        dispatch('search', { query: flight.callSign });
    }

    $: if (searchQuery.length > 0 && flightData.length > 0) {
        filteredFlights = flightData.filter(flight => {
            const callSign = flight.callSign ? flight.callSign.toLowerCase() : ''; 
            const country = flight.origin_country ? flight.origin_country.toLowerCase() : '';

            return callSign.includes(searchQuery.toLowerCase()) || country.includes(searchQuery.toLowerCase());
        });

        filteredFlights = filteredFlights.slice(0, 10);

        if (filteredFlights.length > 0) {
            showSuggestions = true;
            isOpen = true;
        } else {
            showSuggestions = false;
        }

    } else {
        filteredFlights = [];
        showSuggestions = false;
    }
</script>

<div class="panel-container" class:open={isOpen}>

    <div class="handle-area" on:click={togglePanel} role="button" tabindex="0" aria-label={isOpen ? "Close panel" : "Open panel"}>
        <div class="handle-bar"></div>
    </div>

    <div class="Text-container">
        <h1>Flight Tracker</h1>
        <p class="Description">This flighttracker gives insight about the passengers aircrafts in real time</p>
    </div>

    <div class="search-wrapper" transition:slide={{ duration: 400, easing: quintOut, axis: 'y' }}>
        <input type="text" placeholder="Search flights..." bind:value={searchQuery} on:keydown={(e) => e.key === 'Enter' && handleSearch()} />

        <button class="search-button" on:click={handleSearch}>Search</button>
    </div>

        {#if showSuggestions && filteredFlights.length > 0}
        <ul class="searchList" transition:slide={{ duration: 200}}>
            {#each filteredFlights as flight}
                <li on:click={() => selectSuggestion(flight)}>
                    <strong>{flight.callSign}</strong>
                    <!-- With country the flights origin can be determined -->
                    <span class="country">- {flight.origin_country}</span>
                </li>
            {/each}
        </ul>
    {/if}
    
</div>