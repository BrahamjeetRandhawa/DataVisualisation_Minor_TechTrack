

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
        <label for="search-input">
            <input id="search-input" type="text" placeholder="" bind:value={searchQuery} on:keydown={(e) => e.key === 'Enter' && handleSearch()} />
            <span>Search flights...</span>
        </label>

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

<style>

    .panel-container {
            position: absolute;
            bottom: 0%;
            left: 2%;
            width: 25em;
            border-radius: 16px;
            padding: 1em;
            color: white;

            background-color: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 2000;

            max-height: 80px;
            min-height: 80px;
            overflow: hidden;

            transition: max-height 0.8s cubic-bezier(0.33, 0.72, 0, 1.18),
                        min-height 0.8s cubic-bezier(0.33, 0.72, 0, 1.18),
                        padding 0.3s cubic-bezier(0.33, 0.72, 0, 1.18);
            
            /* Change here to add glass effect */
            /* From https://css.glass */
/* 
            background: rgba(0, 0, 0, 0.11);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(4.5px);
            -webkit-backdrop-filter: blur(4.5px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            
            border-radius: 15px;
            z-index: 2000;

            color: white;

            overflow: hidden;
            max-height: 90px;

            transition: max-height 0.3s ease-in-out;
             */
        }

        .panel-container.open {
            min-height: 300px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;

            transition: max-height 0.8s cubic-bezier(0.33, 0.72, 0, 1.18),
                        min-height 0.8s cubic-bezier(0.33, 0.72, 0, 1.18);
        }

        .Description {
            font-size: 18px;
            margin-top: 0;
            padding-left: 2%;
        }

        .handle-area {
            width: 100%;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grabbing;
        }
        
        .handle-bar {
            width: 15%;
            height: 10px;
            background-color: white;
            border-radius: 5px;
            margin: 10px auto;
            cursor: grab;
        }

        .handle-bar:focus {
            box-shadow: 2px 2px 20px rgba(255, 255, 255, 0.5);
            cursor: grabbing;
        }

        .search-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%;
            margin: 0 auto;
            overflow: hidden;
            color: white;

            > label {
                width: 100%;
                border: none;
                background: none;
                /* padding: 0.5rem; */
                
            > span {
                position: absolute;
                top: 50%;
                left: 1.4rem;
                transform: translateY(-50%);
                opacity: 0.8;
                font-size: 20px;
                pointer-events: none;
                overflow: hidden;
                text-align: left;
                width: 40%;
                text-wrap: nowrap;

                transition: width 0.6s cubic-bezier(0.33, 0.72, 0, 1.18) 0.4s,
                            left 0.6s cubic-bezier(0.33, 0.72, 0, 1.18) 0.6s,
                            opacity 0.4s cubic-bezier(0.33, 0.72, 0, 1.18);
            }
            
            > input {
                padding: 1rem;
                border-radius: 12px;
                font-size: 20px;
                width: 90%;
                border: none;

                background-color: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);


                transition: width 0.6s cubic-bezier(0.33, 0.72, 0, 1.18);
            }
        }

        > .search-button {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            padding: 0.7rem 0rem;
            border-radius: 12px;
            font-size: 20px;
            border: none;
            opacity: 0;
            pointer-events: none;
            color: white;

            background-color: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);


            transition: padding 0.6s cubic-bezier(0.33, 0.72, 0, 1.18), 
                        opacity 0.2s cubic-bezier(0.33, 0.72, 0, 1.18);
        }
        }

        .search-wrapper:has(input:focus) {

            > label > input {
                width: 65%;
            }
            > .search-button {
            opacity: 1;
            padding: 1rem;
            cursor: pointer;
            pointer-events: all;
        }
    }

    .search-wrapper:has(input:not(:placeholder-shown)) label > span {
        width: 0%;
        opacity: 0;
        left: 4rem;
        transition: width 0.6s cubic-bezier(0.33, 0.72, 0, 1.18) 0.2s,
                    left 0.6s cubic-bezier(0.33, 0.72, 0, 1.18),
                    opacity 0.4s cubic-bezier(0.33, 0.72, 0, 1.18) 0.4s;
    }
    

    .searchList {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 0.2em;
        padding: 0;
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        max-height: 40vh;
        overflow-y: auto;

        transition: all 0.8s cubic-bezier(0.33, 0.72, 0, 1.18);

        > .searchItem {
            padding: 1rem;
            width: 100%;
            border-bottom: 1px solid #ddd;
            border-radius: 12px;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: white;

            background-color: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);

            transition: all 0.8s cubic-bezier(0.33, 0.72, 0, 1.18);
        }
    }
    
        /* .search-wrapper {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            position: relative;
            margin-left: 2%;
            border-radius: 20px;
            padding: 5px;
            width: 92%;
            flex-wrap: nowrap;
            height: auto;
            min-height: 2.3em;
            background-color: rgba(0, 0, 0, 30%);

            transition: all 0.5s cubic-bezier(0.33, 0.72, 0, 1.18);
        }

        .search-wrapper input {
            width: 100%;
            height: 3em;
            border-radius: 20px;
            border: none;
            padding: 5px;
            color: white;
            background-color: rgba(0, 0, 0, 30%);
            transition: all 0.3s cubic-bezier(0.33, 0.72, 0, 1.18);
        }

        .search-wrapper input:focus {
            box-shadow: 2px 2px 20px rgba(255, 255, 255, 0.5);
            background-color: rgba(0, 0, 0, 90%);

            width: 70%;
            transition: all 0.3s cubic-bezier(0.33, 0.72, 0, 1.18);
            outline: none;
        }

        .searchList {
            position: relative;
            top: 0;
            left: 0;
            width: 100%;

            background-color: rgba(0, 0, 0, 30%);
            border-radius: 10px;
            list-style: none;
            padding: 0;
            margin-top: 5px;

            max-height: 30vh;
            overflow-y: auto;
            z-index: 3000;
        }

        .searchList > .searchItem {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            cursor: pointer;
            color: white;
        }

        .search-button {
            position: relative;
            height: 2.3em;
            width: 0;
            border-radius: 20px;
            padding: 0;
            border: none;
            cursor: pointer;

            opacity: 0;
            
            transform: translateX(5px);
        }

        .search-wrapper input:focus + .search-button {
            height: 2.3em;
            width: 100%;
            border-radius: 20px;
            opacity: 1;
            max-width: 25%;
            background-color: rgba(0, 0, 0, 90%);
            box-shadow: 2px 2px 20px rgba(255, 255, 255, 0.5);
            color: white;
            transition: all 0.3s cubic-bezier(0.33, 0.72, 0, 1.18);
        } */
</style>