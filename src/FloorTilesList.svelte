<script>
    import { resources } from "./state.svelte";
    import FloorTileCard from "./FloorTileCard.svelte";
</script>

<div class="floor-tiles-list">
    {#each resources.state.floorTiles as tile}
        <FloorTileCard {tile} />
    {/each}
</div>

<style>
    /* your styles go here */
</style>
