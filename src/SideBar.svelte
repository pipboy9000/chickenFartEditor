<script>
    import EntitiesList from "./EntitiesList.svelte";
    import FloorTilesList from "./FloorTilesList.svelte";

    let selectedTab = $state("entities");
</script>

<div class="sideBar">
    {#if selectedTab === "entities"}
        <EntitiesList />
    {:else if selectedTab === "floorTiles"}
        <FloorTilesList />
    {/if}
</div>

<style>
    .sideBar {
        max-height: 100vh;
        height: 100vh;
        overflow-y: auto;
        position: fixed;
        right: 0;
        width: 240px;
    }
</style>
