export const resources = $state({ state: { entities: [], floorTiles: [] } });

export const selectedResource = $state({ state: null });

export const selectedFloorTile = $state({ state: null });

export const level = $state({ state: { resources: [], entities: [], floorTiles: [] } });

export const duplicate = $state({ state: true });

export function getLevelJson() {

    let newObj = { entities: [] };

    level.state.entities.forEach(ent => {
        newObj.entities.push({
            name: ent.res.name,
            x: ent.x,
            y: ent.y,
            rot: ent.rot,
            isFloorItem: ent.isFloorItem,
            scale: ent.scale
        })
    });

    newObj.resources = level.state.resources;

    return JSON.stringify(newObj);
}

export function loadLevelFromJson(jsonObj) {

    level.state.entities = [];
    level.state.resources = [];


    jsonObj.entities.forEach(ent => {
        const res = resources.state.entities.find(res => res.name === ent.name);
        addEntity(res, ent.x, ent.y, ent.scale, ent.rot, ent.isFloorItem);
        if (level.state.resources.indexOf(res.name) === -1) level.state.resources.push(res.name);
    });
}

export async function loadResources() {

    try {
        const response = await fetch('/resources.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        //entities resources
        let entities = [];

        Object.keys(data.entities).forEach(name => {
            let img = new Image();
            img.src = `entities/resources/${name}/${name}.png`
            entities.push({
                name,
                img,
                ...data.entities[name]
            });
        });

        resources.state.entities = entities;

        //floor tiles resources
        let floorTiles = [];

        Object.keys(data.floorTiles).forEach(name => {
            let img = new Image();
            img.src = `floorTiles/${name}.png`;
            floorTiles.push({
                name,
                img,
                ...data.floorTiles[name]
            });


        });

        resources.state.floorTiles = floorTiles;

    } catch (e) {
        console.error("Failed to load resources:", e);
    }
}

export function addEntity(res, x, y, scale, rot, isFloorItem) {
    level.state.entities.push({
        res,
        x,
        y,
        scale,
        rot,
        isFloorItem,
    });

    //add to resources list
    if (level.state.resources.indexOf(res.name) === -1) {
        level.state.resources.push(res.name);
    }


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

    saveLevelToLocalStorage();
}

export function removeEntity(entity) {

    let idx = level.state.entities.findIndex((ent) => ent === entity);

    level.state.entities.splice(idx, 1);

    //check if any other entity is using the resource, remove from resources if needed
    idx = level.state.entities.findIndex((ent) => ent.res.name === entity.res.name);

    if (idx === -1) {
        idx = level.state.resources.indexOf(entity.res.name);
        level.state.resources.splice(idx, 1);
    }
}

export async function getLevelFromLocalStorage() {
    const lvl = window.localStorage.getItem("level");
    const lvlObj = JSON.parse(lvl);

    if (lvlObj) {
        loadLevelFromJson(lvlObj)
    }
}

export function saveLevelToLocalStorage() {
    window.localStorage.setItem("level", getLevelJson());
}
