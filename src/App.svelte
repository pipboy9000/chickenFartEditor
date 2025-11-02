<script>
  import { onMount } from "svelte";
  import Canvas from "./Canvas.svelte";
  import SideBar from "./SideBar.svelte";
  import { loadResources } from "./state.svelte.js";
  import TopBar from "./TopBar.svelte";

  onMount(() => {
    loadResources();
  });
</script>

<main>
  <Canvas />
  <TopBar />
  <SideBar />
</main>

<style>
  main {
    display: flex;
  }
</style>
