

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

    <div 
    class="handle-area" 
    on:click={togglePanel}
    on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ')
        togglePanel();
    }} 
    role="button" 
    tabindex="0" 
    aria-label={isOpen ? "Close panel" : "Open panel"}>
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
                <button 
                class="searchItem"
                on:click={() => selectSuggestion(flight)}
                on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') 
                    selectSuggestion(flight);
                }}
                type="button"
                tabindex="0"
                >
                    <strong>{flight.callSign}</strong>
                    <!-- With country the flights origin can be determined -->
                    <span class="country">- {flight.origin_country}</span>
                </button>
            {/each}
        </ul>
    {/if}
    
</div>