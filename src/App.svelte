<script>
  import { onMount } from "svelte";
  import Canvas from "./Canvas.svelte";
  import SideBar from "./SideBar.svelte";
  import { loadResources, getLevelFromLocalStorage } from "./state.svelte.js";
  import TopBar from "./TopBar.svelte";
  import CodePopup from "./CodePopup.svelte";
  import SettingsPopup from "./SettingsPopup.svelte";

  let showCode = false;
  let showSettings = false;
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

  function showSettingsPopup() {
    showSettings = true;
  }

  function hideSettingsPopup() {
    showSettings = false;
  }
</script>

<main>
  <Canvas bind:this={canvasEl} />
  <TopBar {showCodePopup} {showSettingsPopup} />
  <SideBar />
  {#if showCode}
    <CodePopup {hideCodePopup} />
  {/if}

  {#if showSettings}
    <SettingsPopup {hideSettingsPopup} />
  {/if}
</main>

<style>
  main {
    display: flex;
  }
</style>
