<script>
    import EntityCard from "./EntityCard.svelte";
    import { resources, selectedResource } from "./state.svelte.js";
</script>

<div class="sideBar">
    <div class="entities">
        {#each resources.state as entity}
            <EntityCard res={entity} />
        {/each}
    </div>
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

    .entities {
        display: flex;
        flex-wrap: wrap;
    }
</style>
