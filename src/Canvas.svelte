<script>
    import { onMount } from "svelte";
    import { seededRandom } from "./utils.js";
    import { level, selectedResource } from "./state.svelte.js";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";

    let canvas;
    let ctx;
    let width, height;

    let floorTiles;
    let floorTilesPng;
    let floorTileSize = 16;

    let worldWidth;
    let worldHeight;

    let seed = "12345";

    let canvasGeometry = {};

    let propRotation = 0;
    let propScale = 1;
    let propIsFloorItem = false;

    onMount(() => {
        canvas.width = window.innerWidth - 200 * devicePixelRatio;
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

            ctx.rotate(ent.rot);

            ctx.drawImage(
                ent.res.img,
                -ent.res.anchorX,
                -ent.res.anchorY,
                ent.res.width,
                ent.res.height,
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
        const canvasX =
            (event.clientX - canvasGeometry.left) * canvasGeometry.scaleX;
        const canvasY =
            (event.clientY - canvasGeometry.top) * canvasGeometry.scaleY;

        if (selectedResource.state != null) {
            addEntity(selectedResource.state, canvasX, canvasY);
        } else {
            //drag and drop / duplicate
            let closestDist = Infinity;
            let selectedEnt = {};

            level.state.entities.forEach((ent) => {
                let dx = ent.x - canvasX;
                let dy = ent.y - canvasY;
                let distSqr = dy * dy + dx * dx;

                console.log(distSqr);

                if (distSqr < 200 && distSqr < closestDist) {
                    closestDist = distSqr;
                    selectedEnt = ent;
                }
            });

            if (closestDist != Infinity) {
                //set clicked entity as selected entity
                propIsFloorItem = selectedEnt.isFloorItem;
                propRotation = selectedEnt.rot;
                propScale = selectedEnt.scale;
                selectedResource.state = selectedEnt.res;

                //then remove it from the entities list for drag n drop behaviour
                const idx = level.state.entities.findIndex((ent) => {
                    return ent === selectedEnt;
                });
                level.state.entities.splice(idx, 1);
            }

            draw();
            onmousemove(event)
        }
    }

    function addEntity(ent, x, y) {
        level.state.entities.push({
            res: ent,
            x,
            y,
            scale: propScale,
            rot: propRotation,
            isFloorItem: propIsFloorItem,
        });

        level.state.entities.sort((a, b) => {
            if (a.isFloorItem && b.isFloorItem) {
                return 0;
            } else if (a.isFloorItem) {
                return -1;
            } else if (b.isFloorItem) {
                return 1;
            }
            return a.y - b.y;
        });
    }
</script>

<canvas bind:this={canvas} {onmousemove} {onclick}></canvas>

{#if selectedResource.state != null}
    <div class="entityProps">
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

    .entityProps {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: white;
        display: flex;
        align-items: center;
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
        max-width: 40px;
        border-radius: 6px;
        border: 1px solid lightgray;
        padding: 4px 8px;
    }

    .trashIcon {
        font-size: 28px;
        color: #e67e7e;
        padding: 10px;
        margin-left: 30px;
        margin-right: 10px;
        border: 2px solid;
    }
</style>
