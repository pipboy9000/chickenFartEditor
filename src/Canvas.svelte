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
        saveLevelToLocalStorage,
        addFloorTile,
        snapToGrid,
    } from "./state.svelte.js";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
    import { duplicate } from "./state.svelte.js";

    let canvas;
    let ctx;
    let width, height;
    let camX = 0,
        camY = 0;

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

    let isPanning = $state(false);
    let panStart = { x: 0, y: 0 };

    let canvasMouseX = 0,
        canvasMouseY = 0;

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

        loadFloorTiles(
            "grass",
            32,
            level.state.settings.width,
            level.state.settings.height,
            "level1",
        );

        camX = width / 2 - level.state.settings.width / 2;
        camY = height / 2 - level.state.settings.height / 2;
    });

    $effect(() => {
        draw();
    });

    $effect(() => {
        loadFloorTiles(
            "grass",
            32,
            level.state.settings.width,
            level.state.settings.height,
            "level1",
        );
    });

    function clearCanvas() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
    }

    export function draw() {
        clearCanvas();
        ctx.setTransform(1, 0, 0, 1, camX, camY);
        drawFloorTiles();
        drawEntities();
        drawBounds();
        drawMouse();
    }

    function drawBounds() {
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            0,
            0,
            level.state.settings.width,
            level.state.settings.height,
        );
        ctx.restore();
    }

    async function loadFloorTiles(
        assetName,
        tileSize,
        width,
        height,
        levelStr,
    ) {
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
        const tilesX = Math.ceil(width / tileSize);
        const tilesY = Math.ceil(height / tileSize);
        for (let x = 0; x < tilesX; x++) {
            let row = [];
            for (let y = 0; y < tilesY; y++) {
                let r = Math.floor(random() * 8 * 8);
                row.push(r);
            }
            floorTiles.push(row);
        }

        worldWidth = tilesX * tileSize;
        worldHeight = tilesY * tileSize;

        draw();
    }

    function drawFloorTiles() {
        //default tiles
        if (floorTiles) {
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
        }

        //set tiles
        level.state.floorTiles.forEach((tile) => {
            ctx.drawImage(
                tile.img,
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

    function drawMouse() {
        if (selectedFloorTile.state != null) {
            const floorTileX = Math.floor(canvasMouseX / floorTileSize);
            const floorTileY = Math.floor(canvasMouseY / floorTileSize);

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
        } else if (selectedResource.state != null) {
            if (snapToGrid.state) {
                canvasMouseX = Math.round(canvasMouseX / 10) * 10;
                canvasMouseY = Math.round(canvasMouseY / 10) * 10;
            }

            ctx.translate(canvasMouseX, canvasMouseY);

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
        }
    }

    function onmousemove(event) {
        canvasMouseX =
            (event.clientX - canvasGeometry.left) * canvasGeometry.scaleX -
            camX;
        canvasMouseY =
            (event.clientY - canvasGeometry.top) * canvasGeometry.scaleY - camY;

        console.log(canvasMouseX, canvasMouseY);

        if (isPanning) {
            camX += event.clientX - panStart.x;
            camY += event.clientY - panStart.y;
            panStart.x = event.clientX;
            panStart.y = event.clientY;
        }

        draw();
    }

    function onclick(event) {

        if (snapToGrid.state) {
            canvasMouseX = Math.round(canvasMouseX / 10) * 10;
            canvasMouseY = Math.round(canvasMouseY / 10) * 10;
        }

        if (selectedFloorTile.state != null) {
            const tileX = Math.floor(canvasMouseX / floorTileSize);
            const tileY = Math.floor(canvasMouseY / floorTileSize);
            addFloorTile(tileX, tileY);
            saveLevelToLocalStorage();
        } else if (selectedResource.state != null) {
            addEntity(
                selectedResource.state,
                canvasMouseX,
                canvasMouseY,
                propScale,
                propRotation,
                propIsFloorItem,
            );

            saveLevelToLocalStorage();

            if (!duplicate.state) {
                selectedResource.state = null;
            }
        } else {
            //drag and drop / duplicate
            let closestDist = Infinity;
            let selected = {};

            level.state.entities.forEach((ent) => {
                let dx = ent.x - canvasMouseX;
                let dy = ent.y - canvasMouseY;
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
                saveLevelToLocalStorage();
                setTimeout(() => {
                    onmousemove(event);
                }, 150);
                draw();
                return;
            }

            //check if clicked on floor tile
            level.state.floorTiles.forEach((tile) => {
                let dx = tile.x * floorTileSize - canvasMouseX + floorTileSize / 2;
                let dy = tile.y * floorTileSize - canvasMouseY + floorTileSize / 2;
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

            draw();
        }
    }

    function onwheel(event) {
        if (selectedResource.state != null) {
            event.deltaY > 0 ? (propScale -= 0.1) : (propScale += 0.1);
            draw();
        } else {
            camY -= event.deltaY;
            camX -= event.deltaX;
            draw();
        }
    }

    function onmousedown(event) {
        console.log(event.button);
        if (event.button === 2) {
            selectedResource.state = null;
            selectedFloorTile.state = null;
            saveLevelToLocalStorage();
            draw();
        }

        if (event.button === 1) {
            isPanning = true;
            panStart.x = event.clientX;
            panStart.y = event.clientY;
        }
    }

    function onmouseup(event) {
        if (event.button === 1) {
            isPanning = false;
            draw();
        }
    }

    function oncontextmenu(event) {
        event.preventDefault();
    }

    $inspect(isPanning);
</script>

<svelte:window
    on:keydown|escape={(e) => {
        console.log(e.key);

        if (e.key === "Escape") {
            selectedFloorTile.state = null;
            selectedResource.state = null;
            draw();
        }

        if (e.key === "ArrowRight") {
            camX -= 32;
            draw();
        }
        if (e.key === "ArrowUp") {
            camY += 32;
            draw();
        }
        if (e.key === "ArrowLeft") {
            camX += 32;
            draw();
        }
        if (e.key === "ArrowDown") {
            camY -= 32;
            draw();
        }
    }}
/>

<canvas
    bind:this={canvas}
    {onmousemove}
    {onclick}
    {onwheel}
    {onmousedown}
    {onmouseup}
    {oncontextmenu}
    class={isPanning ? "panning" : ""}
></canvas>

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

    .panning {
        cursor: grabbing;
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
