export const resources = $state({ state: [] });

export const selectedResource = $state({ state: null });

export const level = $state({ state: { entities: [] } });

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
    })

    return JSON.stringify(newObj);
}

export function loadLevelFromJson(jsonObj) {

    level.state.entities = [];

    jsonObj.entities.forEach(ent => {
        const res = resources.state.find(res => res.name === ent.name);
        addEntity(res, ent.x, ent.y, ent.scale, ent.rot, ent.isFloorItem)
    })
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