<script>
    let { tile } = $props();

    $inspect(tile);

    let tilesX = Math.floor(tile.width / tile.tileSize);
    let tilesY = Math.floor(tile.height / tile.tileSize);

    console.log(tilesX, tilesY);
</script>

<h3>{tile.name}</h3>
<div class="tiles">
    {#each { length: tilesX }, i}
        {#each { length: tilesY }, j}
            <img
                style={`width:${tile.tileSize}px; height:${tile.tileSize}px; object-position:${-i * tile.tileSize}px ${-j * tile.tileSize}px `}
                src={`floorTiles/${tile.name}.png`}
                alt=""
            />
        {/each}
    {/each}
</div>

<style>
    .tiles {
        background: white;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px;
        border-radius: 4px;
    }

    img {
        border: 1px solid black;
        border-radius: 4px;
        object-fit: none;
    }
</style>
