<script>
    import { onMount } from "svelte";
    import { seededRandom } from "./utils.js";
    import { level, selectedResource } from "./state.svelte.js";
    import { scale } from "svelte/transition";

    let canvas;
    let ctx;
    let width, height;

    let floorTiles;
    let floorTilesPng;
    let floorTileSize = 16;

    export let worldWidth;
    export let worldHeight;

    let seed = "12345";

    let canvasGeometry = {};

    let propRotation = 0;
    let propScale = 1;
    let propIsFloorItem = false;

    onMount(() => {
        canvas.width = window.innerWidth - 320 * devicePixelRatio;
        canvas.height = window.innerHeight;

        width = canvas.width;
        height = canvas.height;

        ctx = canvas.getContext("2d");

        const rect = canvas.getBoundingClientRect();

        // 2. Calculate and store the scaling factors and offsets
        // this is used in input.js to convert mouse coordinates to canvas coordinates - do not remove
        canvasGeometry.scaleX = canvas.width / rect.width;
        canvasGeometry.scaleY = canvas.height / rect.height;
        canvasGeometry.left = rect.left;
        canvasGeometry.top = rect.top;

        loadFloorTiles("grass", 16, width + 100, height + 100, "level1");
    });

    function clearCanvas() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
    }

    function draw() {
        drawFloorTiles();
        drawEntities();
    }

    async function loadFloorTiles(
        assetName,
        tileSize,
        width,
        height,
        levelStr,
    ) {
        floorTileSize = tileSize;

        const random = seededRandom(seed + "-" + levelStr);

        floorTilesPng = new Image();

        await new Promise((resolve, reject) => {
            floorTilesPng.onload = () => resolve();
            floorTilesPng.onerror = () =>
                reject(new Error("Failed to load image"));
            floorTilesPng.src = `${assetName}.png`;
        });

        //generate grass tiles
        floorTiles = [];
        const tilesX = Math.ceil(width / floorTileSize);
        const tilesY = Math.ceil(height / floorTileSize);
        for (let x = 0; x < tilesX; x++) {
            let row = [];
            for (let y = 0; y < tilesY; y++) {
                let r = Math.floor(random() * 50); //inc 50 for more empty space
                if (r > 8) r = 3; //3 is plain grass
                row.push(r);
            }
            floorTiles.push(row);
        }

        worldWidth = tilesX * floorTileSize;
        worldHeight = tilesY * floorTileSize;

        draw();
    }

    function drawFloorTiles() {
        floorTiles.forEach((row, x) => {
            row.forEach((tile, y) => {
                const sx = (tile % 3) * floorTileSize;
                const sy = Math.floor(tile / 3) * floorTileSize;
                ctx.drawImage(
                    floorTilesPng,
                    sx,
                    sy,
                    floorTileSize,
                    floorTileSize,
                    x * floorTileSize,
                    y * floorTileSize,
                    floorTileSize,
                    floorTileSize,
                );
            });
        });
    }

    function drawEntities() {
        level.state.entities.forEach((ent) => {
            ctx.save();

            ctx.translate(ent.x, ent.y);

            ctx.scale(ent.scale, ent.scale);

            ctx.drawImage(
                ent.img,
                -ent.anchorX,
                -ent.anchorY,
                ent.width,
                ent.height,
            );

            ctx.restore();
        });
    }

    function onmousemove(event) {
        if (selectedResource.state != null) {
            drawFloorTiles();
            drawEntities();

            const canvasX =
                (event.clientX - canvasGeometry.left) * canvasGeometry.scaleX;
            const canvasY =
                (event.clientY - canvasGeometry.top) * canvasGeometry.scaleY;

            ctx.save();

            ctx.translate(canvasX, canvasY);

            ctx.scale(propScale, propScale);

            ctx.rotate(propRotation);

            ctx.drawImage(
                selectedResource.state.img,
                0,
                0,
                selectedResource.state.width,
                selectedResource.state.height,
                -selectedResource.state.anchorX,
                -selectedResource.state.anchorY,
                selectedResource.state.width,
                selectedResource.state.height,
            );

            ctx.restore();
        }
    }

    function onclick(event) {
        if (selectedResource.state != null) {
            let res = selectedResource.state;
            const canvasX =
                (event.clientX - canvasGeometry.left) * canvasGeometry.scaleX;
            const canvasY =
                (event.clientY - canvasGeometry.top) * canvasGeometry.scaleY;

            level.state.entities.push({
                name: res.name,
                x: canvasX,
                y: canvasY,
                scale: propScale,
                rot: propRotation,
                img: selectedResource.state.img,
            });
        }
    }
</script>

<canvas bind:this={canvas} {onmousemove} {onclick}></canvas>

{#if selectedResource.state != null}
    <div class="entityProps">
        <div class="inputField">
            <label>Scale:</label>
            <input type="number" step="0.1" bind:value={propScale} />
        </div>
        <div class="inputField">
            <label>Rotation:</label>
            <input type="number" step="0.1" bind:value={propRotation} />
        </div>
        <div class="inputField">
            <label>Floor item</label>
            <input type="checkbox" bind:checked={propIsFloorItem} />
        </div>
    </div>
{/if}

<style>
    .entityProps {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: white;
        display: flex;
        flex-direction: column;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0px 15px 20px -10px;
    }

    label {
        font-size: 14px;
        width: 80px;
        display: inline-block;
    }

    input {
        width: 40px;
        border-radius: 6px;
        border: 1px solid lightgray;
        padding: 4px 8px;
    }
</style>
