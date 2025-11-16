export const resources = $state({ state: [] });

export const selectedResource = $state({ state: null });

export const level = $state({ state: { resources: [], entities: [] } });

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
        const res = resources.state.find(res => res.name === ent.name);
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

        let res = [];

        Object.keys(data).forEach(name => {
            let img = new Image();
            img.src = `resources/${name}/${name}.png`
            res.push({
                name,
                img,
                ...data[name]
            });
        });

        resources.state = res;

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
