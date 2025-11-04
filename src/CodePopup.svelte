<script>
    import { on } from "svelte/events";
    import { level, loadLevelFromJson, getLevelJson } from "./state.svelte";
    import { onMount } from "svelte";

    let { hideCodePopup } = $props();

    let text = $state("");

    let err = $state(false);

    $inspect(err);

    onMount(() => {
        text = getLevelJson();
    });

    function validateAndSave() {
        err = false;
        try {
            let jsonObj = JSON.parse(text);
            loadLevelFromJson(jsonObj);
            hideCodePopup();
        } catch {
            err = true;
        }
    }
</script>

<div
    class="bg"
    onclick={hideCodePopup}
    role="button"
    tabindex="0"
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && hideCodePopup()}
    aria-label="Close popup"
>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="popup"
        onclick={(e) => e.stopPropagation()}
    >
        <textarea
            name=""
            id=""
            style={err ? "border: 2px solid red" : ""}
            bind:value={text}
        ></textarea>
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

    textarea {
        width: 420px;
        height: 300px;
        border-radius: 12px;
        border: none;
        background: #e1e1e1;
        margin-bottom: 20px;
    }

    button {
        background-color: #8bf188;
        color: #474747;
        width: 180px;
    }
</style>
