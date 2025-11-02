<script>
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons/faFloppyDisk";
    import { getLevelJson, level } from "./state.svelte";

    function onclick() {
        console.log(getLevelJson());
    }
</script>

<div class="buttons">
    <button class="btn" {onclick}>
        <FontAwesomeIcon icon={faFloppyDisk} />
    </button>
</div>

<style>
    .buttons {
        position: fixed;
        background: white;
        top: 10px;
        left: 10px;
        padding: 10px;
        font-size: 20px;
        border-radius: 4px;
        box-shadow: 0px 5px 19px -5px;
        color: #424242;
    }

    .btn {
        border-radius: 4px;
        padding: 4px;
        background: #e6e6e6;
    }
</style>
