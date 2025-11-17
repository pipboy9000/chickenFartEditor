import { Entity } from "/src/EntitiesFactory.js";
import { removeEntity } from "../world.js";

export async function create(x, y) {

    let entity = await Entity.create(x, y, "Smoke");

    let vx = (Math.random() - 0.25) * 0.5;
    let vy = (Math.random() - 0.25) * 0.5;
    let vz = 0.35;
    let age = 0;

    entity.onUpdate = () => {
        entity.x += vx;
        entity.y += vy;
        entity.z += vz;
        entity.rot += vx / 10;
        entity.scale += 0.01;
        age++;

        if (age > 150) {
            removeEntity(entity);
        }
    }


    return entity;
}