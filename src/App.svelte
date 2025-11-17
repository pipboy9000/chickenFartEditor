<script>
  import { onMount } from "svelte";
  import Canvas from "./Canvas.svelte";
  import SideBar from "./SideBar.svelte";
  import { loadResources, getLevelFromLocalStorage } from "./state.svelte.js";
  import TopBar from "./TopBar.svelte";
  import CodePopup from "./CodePopup.svelte";

  let showCode = false;
  let canvasEl;

  async function initAsync() {
    await loadResources();
    await getLevelFromLocalStorage();
    setTimeout(canvasEl.draw, 100);
  }

  onMount(() => {
    initAsync();
  });

  function showCodePopup() {
    showCode = true;
  }

  function hideCodePopup() {
    showCode = false;
  }
</script>

<main>
  <Canvas bind:this={canvasEl} />
  <TopBar {showCodePopup} />
  <SideBar />
  {#if showCode}
    <CodePopup {hideCodePopup} />
  {/if}
</main>

<style>
  main {
    display: flex;
  }
</style>
