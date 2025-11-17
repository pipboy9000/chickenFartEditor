<script>
    import EntitiesList from "./EntitiesList.svelte";
    import FloorTilesList from "./FloorTilesList.svelte";

    let selectedTab = $state("entities");
</script>

<div class="sideBar">
    <div class="tabs">
        <ul>
            <li>
                <button
                    onclick={() => {
                        selectedTab = "entities";
                    }}>Entities</button
                >
            </li>
            <li>
                <button
                    onclick={() => {
                        selectedTab = "floorTiles";
                    }}>Floor tiles</button
                >
            </li>
        </ul>
    </div>
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
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    ul {
        font-size: 8px;
        display: flex;
        column-gap: 10px;
        list-style: none;
    }
</style>
