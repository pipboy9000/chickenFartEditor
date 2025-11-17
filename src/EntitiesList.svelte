<script>
    import EntityCard from "./EntityCard.svelte";
    import { resources } from "./state.svelte.js";

</script>

<div class="entities-list">
    {#each resources.state.entities as entity}
        <EntityCard res={entity} />
    {/each}
</div>

<style>
    .entities-list {
        display: flex;
        flex-wrap: wrap;
    }
</style>
