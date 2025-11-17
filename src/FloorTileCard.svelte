<script>
    import { selectedFloorTile } from "./state.svelte";
    let { tile } = $props();

    // $inspect(selectedFloorTile);

    let tilesX = Math.floor(tile.width / tile.tileSize);
    let tilesY = Math.floor(tile.height / tile.tileSize);

    function selectTile(name, x, y) {
        selectedFloorTile.state = { name, x, y };
    }
</script>

<h3>{tile.name}</h3>
<div class="tiles">
    {#each { length: tilesX }, i}
        {#each { length: tilesY }, j}
            <button
                onclick={() => {
                    selectTile(tile.name, i, j);
                }}
            >
                <img
                    style={`width:${tile.tileSize}px; height:${tile.tileSize}px; object-position:${-i * tile.tileSize}px ${-j * tile.tileSize}px `}
                    src={`floorTiles/${tile.name}.png`}
                    class:tileSelected={selectedFloorTile.state &&
                        selectedFloorTile.state.x === i &&
                        selectedFloorTile.state.y === j &&
                        selectedFloorTile.state.name === tile.name}
                    alt=""
                />
            </button>
        {/each}
    {/each}
</div>

<style>
    .tiles {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px;
        border-radius: 4px;
        backdrop-filter: blur(2px);
        background: radial-gradient(#ccf3ff00, #aaf4ff36);
        border: 1px solid #ffffff2e;
    }

    img {
        object-fit: none;
    }

    button {
        padding: 0;
        box-shadow: 0 6px 10px -9px black;
        outline: 1px solid white;
        border-radius: 4px;
    }

    .tileSelected {
        outline: 4px solid darkcyan;
        border-radius: 4px;
        z-index: 3;
    }
</style>
