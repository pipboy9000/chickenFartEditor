<script>
    import EntityCard from "./EntityCard.svelte";
    import { resources, selectedResource } from "./state.svelte.js";
</script>

<div class="entities-list">
    {#each resources.state as entity}
        <EntityCard res={entity} />
    {/each}
</div>

<style>
    .entities-list {
        display: flex;
        flex-wrap: wrap;
    }
</style>
