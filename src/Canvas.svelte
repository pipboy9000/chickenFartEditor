<script>
    import { onMount } from "svelte";
    import { seededRandom } from "./utils.js";
    import {
        level,
        selectedResource,
        addEntity,
        removeEntity,
        selectedFloorTile,
        resources,
    } from "./state.svelte.js";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
    import { duplicate } from "./state.svelte.js";

    let canvas;
    let ctx;
    let width, height;

    //default floor tiles
    let floorTiles;
    let floorTilesPng;
    let floorTileSize = 32;

    let worldWidth;
    let worldHeight;

    let seed = "12345";

    let canvasGeometry = {};

    let propRotation = $state(0);
    let propScale = $state(1);
    let propIsFloorItem = $state(false);

    $inspect(selectedFloorTile);

    onMount(() => {
        canvas.width = window.innerWidth;
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

        loadFloorTiles("grass", 32, width + 100, height + 100, "level1");
    });

    $effect(() => {
        if (level.state.entities.length > 0) draw();
    });

    export function draw() {
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
            floorTilesPng.onerror = (err) =>
                reject(new Error("Failed to load image", err));
            floorTilesPng.src = `floorTiles/${assetName}.png`;
        });

        //generate grass tiles
        floorTiles = [];
        const tilesX = Math.ceil(width / floorTileSize);
        const tilesY = Math.ceil(height / floorTileSize);
        for (let x = 0; x < tilesX; x++) {
            let row = [];
            for (let y = 0; y < tilesY; y++) {
                let r = Math.floor(random() * 8 * 8);
                row.push(r);
            }
            floorTiles.push(row);
        }

        worldWidth = tilesX * floorTileSize;
        worldHeight = tilesY * floorTileSize;

        draw();
    }

    function drawFloorTiles() {
        //default tiles
        floorTiles.forEach((row, x) => {
            row.forEach((tile, y) => {
                const sx = (tile % 8) * floorTileSize;
                const sy = Math.floor(tile / 8) * floorTileSize;
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

        //set tiles
        level.state.floorTiles.forEach((tile) => {
            const imgRes = resources.state.floorTiles.find(
                (_tile) => _tile.name === tile.name,
            ).img;
            ctx.drawImage(
                imgRes,
                tile.sx,
                tile.sy,
                floorTileSize,
                floorTileSize,
                tile.x * floorTileSize,
                tile.y * floorTileSize,
                floorTileSize,
                floorTileSize,
            );
        });
    }

    function drawEntities() {
        level.state.entities.forEach((ent) => {
            ctx.save();

            ctx.translate(ent.x, ent.y);

            ctx.scale(ent.scale, ent.scale);

            ctx.rotate(ent.rot);

            try {
                //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                ctx.drawImage(
                    ent.res.img,
                    0,
                    0,
                    ent.res.width,
                    ent.res.height,
                    -ent.res.anchorX,
                    -ent.res.anchorY,
                    ent.res.width,
                    ent.res.height,
                );
            } catch (err) {
                debugger;
                console.log(ent);
                throw new Error(err);
            }
            ctx.restore();
        });
    }

    function onmousemove(event) {
        const canvasX =
            (event.clientX - canvasGeometry.left) * canvasGeometry.scaleX;
        const canvasY =
            (event.clientY - canvasGeometry.top) * canvasGeometry.scaleY;

        if (selectedFloorTile.state != null) {
            drawFloorTiles();

            const floorTileX = Math.floor(canvasX / floorTileSize);
            const floorTileY = Math.floor(canvasY / floorTileSize);

            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

            ctx.save();

            ctx.drawImage(
                selectedFloorTile.state.img,
                selectedFloorTile.state.sx,
                selectedFloorTile.state.sy,
                floorTileSize,
                floorTileSize,
                floorTileX * floorTileSize,
                floorTileY * floorTileSize,
                floorTileSize,
                floorTileSize,
            );

            drawEntities();

            ctx.restore();
        } else if (selectedResource.state != null) {
            drawFloorTiles();
            drawEntities();

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
        const canvasX =
            (event.clientX - canvasGeometry.left) * canvasGeometry.scaleX;
        const canvasY =
            (event.clientY - canvasGeometry.top) * canvasGeometry.scaleY;

        if (selectedFloorTile.state != null) {
            const tileX = Math.floor(canvasX / floorTileSize);
            const tileY = Math.floor(canvasY / floorTileSize);

            level.state.floorTiles.push({
                name: selectedFloorTile.state.name,
                img: selectedFloorTile.state.img,
                x: tileX,
                y: tileY,
                sx: selectedFloorTile.state.sx,
                sy: selectedFloorTile.state.sy,
            });

            if (!duplicate.state) {
                selectedFloorTile.state = null;
            }
        } else if (selectedResource.state != null) {
            addEntity(
                selectedResource.state,
                canvasX,
                canvasY,
                propScale,
                propRotation,
                propIsFloorItem,
            );

            if (!duplicate.state) {
                selectedResource.state = null;
            }
        } else {
            //drag and drop / duplicate
            let closestDist = Infinity;
            let selected = {};

            level.state.entities.forEach((ent) => {
                let dx = ent.x - canvasX;
                let dy = ent.y - canvasY;
                let distSqr = dy * dy + dx * dx;

                if (distSqr < 200 && distSqr < closestDist) {
                    closestDist = distSqr;
                    selected = ent;
                }
            });

            if (closestDist != Infinity) {
                duplicate.state = false;
                //set clicked entity as selected entity
                propIsFloorItem = selected.isFloorItem;
                propRotation = selected.rot;
                propScale = selected.scale;
                selectedResource.state = selected.res;

                //then remove it from the entities list for drag n drop behaviour
                removeEntity(selected);
                onmousemove(event);
                return;
            }

            //check if clicked on floor tile
            level.state.floorTiles.forEach((tile) => {
                let dx = tile.x * floorTileSize - canvasX + floorTileSize / 2;
                let dy = tile.y * floorTileSize - canvasY + floorTileSize / 2;
                let distSqr = dy * dy + dx * dx;

                if (distSqr < 200 && distSqr < closestDist) {
                    closestDist = distSqr;
                    selected = tile;

                    let removeIdx = level.state.floorTiles.findIndex(
                        (_tile) => _tile === tile,
                    );
                    level.state.floorTiles.splice(removeIdx, 1);
                }
            });

            if (closestDist != Infinity) {
                duplicate.state = false;
                selectedFloorTile.state = {
                    name: selected.name,
                    img: selected.img,
                    sx: selected.sx,
                    sy: selected.sy,
                };
            }
        }
    }

    function onwheel(event) {
        propScale += event.deltaY * 0.01;
        onmousemove(event);
    }

    function onkeydown(key) {
        console.log(key);
    }
</script>

<canvas bind:this={canvas} {onmousemove} {onclick} {onwheel}></canvas>

{#if selectedResource.state != null}
    <div class="btns">
        <div>
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
        <button
            class="trashIcon"
            onclick={(event) => {
                event.stopPropagation();
                selectedResource.state = null;
                propIsFloorItem = false;
                propRotation = 0;
                propScale = 1;
                draw();
            }}
        >
            <FontAwesomeIcon icon={faTrash} />
        </button>
    </div>
{:else if selectedFloorTile.state != null}
    <div class="btns">
        <button
            class="trashIcon"
            onclick={(event) => {
                event.stopPropagation();
                selectedFloorTile.state = null;
                draw();
            }}
        >
            <FontAwesomeIcon icon={faTrash} />
        </button>
    </div>
{/if}

<style>
    canvas {
        image-rendering: pixelated;
    }

    .btns {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: white;
        display: flex;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0px 15px 20px -10px;
        color: rgb(58, 58, 58);
        gap: 10px;
    }

    label {
        font-size: 14px;
        width: 80px;
        display: inline-block;
    }

    input {
        max-width: 40px;
        border-radius: 6px;
        border: 1px solid lightgray;
        padding: 4px 8px;
    }

    .trashIcon {
        font-size: 28px;
        color: #e67e7e;
        padding: 10px;
        /* margin-left: 30px;
        margin-right: 10px; */
        border: 2px solid;
    }
</style>
