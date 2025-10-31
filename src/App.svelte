<script>
  import { onMount } from "svelte";
  import Canvas from "./Canvas.svelte";
  import SideBar from "./SideBar.svelte";
  import { loadResources } from "./state.svelte.js";

  onMount(() => {
    loadResources();
  });
</script>

<main>
  <Canvas />
  <SideBar />
</main>

<style>
  main {
    display: flex;
  }
</style>
