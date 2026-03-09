<script>
    import { onMount } from "svelte";
    import { level, saveLevelToLocalStorage } from "./state.svelte";

    let { hideSettingsPopup } = $props();

    let err = $state(false);

    $inspect(err);

    onMount(() => {});

    function validateAndSave() {
        err = false;
        try {
            saveLevelToLocalStorage();
            hideSettingsPopup();
        } catch {
            err = true;
        }
    }
</script>

<div
    class="bg"
    onclick={hideSettingsPopup}
    role="button"
    tabindex="0"
    onkeydown={(e) => hideSettingsPopup()}
    aria-label="Close popup"
>
    <div
        class="popup"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => {
            e.stopPropagation();
            e.key === "Escape" && hideSettingsPopup();
        }}
        role="dialog"
        aria-label="Settings popup"
        tabindex="0"
    >
        <label for="">World Width</label>
        <input
            type="number"
            bind:value={level.state.settings.width}
            step="32"
            min="256"
        />

        <label for="">World Height</label>
        <input
            type="number"
            bind:value={level.state.settings.height}
            step="32"
            min="256"
        />

        <button type="button" onclick={validateAndSave}> Save </button>
    </div>
</div>

<!-- markup (zero or more items) goes here -->

<style>
    .bg {
        position: fixed;
        background: #0008;
        display: flex;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        align-items: center;
        justify-content: center;
    }

    .popup {
        padding: 18px;
        border-radius: 12px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 10px 20px -10px black;
    }

    button {
        background-color: #8bf188;
        color: #474747;
        width: 180px;
        justify-content: center;
    }

    label {
        margin-bottom: 6px;
        color: black;
    }
</style>
