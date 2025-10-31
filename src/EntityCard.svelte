<script>
    import { selectedResource } from "./state.svelte";
    export let res;

    function onclick(evt) {
        selectedResource.state = res;
    }
</script>

<button {onclick} class="card">
    <h3>{res.name}</h3>
    <img
        style={`width:${res.width}px; height:${res.height}px`}
        src={`resources/${res.name}/${res.name}.png`}
        alt=""
    />
</button>

<style>
    .card {
        display: flex;
        flex-direction: column;
        margin: 4px;
        align-items: center;
        background: lightblue;
        padding: 8px;
        border-radius: 4px;
    }

    img {
        object-fit: none;
        object-position: top left;
    }
</style>
