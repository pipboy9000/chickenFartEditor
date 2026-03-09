<script>
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
    import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
    import { faMagnet } from "@fortawesome/free-solid-svg-icons/faMagnet";
    import { getLevelJson, level, snapToGrid } from "./state.svelte";

    let { showCodePopup, showSettingsPopup } = $props();

    function showCode() {
        showCodePopup();
    }

    function showSettings() {
        showSettingsPopup();
    }

    function toggleSnap() {
        snapToGrid.state = !snapToGrid.state;
    }
</script>

<div class="buttons">
    <button class="btn" onclick={showCode}>
        <FontAwesomeIcon icon={faCode} />
    </button>
    <button class="btn" onclick={showSettings}>
        <FontAwesomeIcon icon={faCog} />
    </button>
    <button class="btn {snapToGrid.state ? 'isOn' : ''}" onclick={toggleSnap}>
        <FontAwesomeIcon icon={faMagnet} />
    </button>
</div>

<style>
    .buttons {
        position: fixed;
        background: white;
        top: 10px;
        left: 10px;
        padding: 10px;
        font-size: 22px;
        border-radius: 4px;
        box-shadow: 0px 5px 19px -5px;
        color: #424242;
        display: flex;
        gap: 12px;
    }

    .btn {
        border-radius: 4px;
        padding: 4px;
        background: #e6e6e6;
    }
    
    .isOn {
        background: #ff7171;
    }
</style>
