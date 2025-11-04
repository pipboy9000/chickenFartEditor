<script>
  import { onMount } from "svelte";
  import Canvas from "./Canvas.svelte";
  import SideBar from "./SideBar.svelte";
  import { loadResources } from "./state.svelte.js";
  import TopBar from "./TopBar.svelte";
  import CodePopup from "./CodePopup.svelte";

  let showCode = false;

  onMount(() => {
    loadResources();
  });

  function showCodePopup() {
    showCode = true;
  }

  function hideCodePopup() {
    showCode = false;
  }
</script>

<main>
  <Canvas />
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
