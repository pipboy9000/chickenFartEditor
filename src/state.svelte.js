export const resources = $state({state:[]});

export const selectedResource = $state({state: null});

export const level = $state({state: {entities:[]}});

export function getLevelJson() {
    
    let newObj = {entities: []};

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