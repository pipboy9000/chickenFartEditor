import { Entity } from "/src/EntitiesFactory.js";
import { checkSegmentCollision, removeEntity } from "../world.js";

export async function create(x, y, vx, vy, excludedEntity) {

    let entity = await Entity.create(x, y, "Shuriken");

    entity.scale = 0.5;

    entity.rot = Math.random() * Math.PI * 2;

    let age = 0;

    let trailLength = 0;

    let speed = 15;

    let stopped = false;

    let stickTo,tx,ty;

    entity.onUpdate = () => {

        if (!stopped) {

            speed *= 0.97;

            const col = checkSegmentCollision({ x: entity.x, y: entity.y }, { x: entity.x + vx * speed, y: entity.y + vy * speed }, excludedEntity);

            if (col.hit) {
                entity.x = col.hitPoint.x;
                entity.y = col.hitPoint.y;

                if (col.entity.tag === "enemy") {
                    const pushBackX = (col.entity.x - col.hitPoint.x) * 0.5;
                    const pushBackY = (col.entity.y - col.hitPoint.y) * 0.5;
                    col.entity.hit({ x: pushBackX, y: pushBackY }, 15);

                    removeEntity(entity);
                    return;
                } else {
                    stickTo = col.entity;
                    tx = entity.x - col.entity.x;
                    ty = entity.y - col.entity.y;
                    stopped = true;
                }


            } else {
                entity.x += vx * speed;
                entity.y += vy * speed;
            }

            entity.rot += speed / 20;
        } else {
            entity.x = stickTo.x + tx;
            entity.y = stickTo.y + ty;
        }

        age++;

        entity.opacity = (150 - age) * 0.03;

        if (trailLength < 50) {
            trailLength += 3;
        }

        if (age > 150) {
            removeEntity(entity);
        }
    }

    entity.onDraw = (ctx) => {

        if (!stopped) {

            const gradient = ctx.createLinearGradient(entity.x, entity.y, entity.x - vx * trailLength, entity.y - vy * trailLength);
            gradient.addColorStop(0, '#ffff8888');
            gradient.addColorStop(1, '#ffffff00');

            ctx.globalCompositeOperation = "hard-light";

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(entity.x, entity.y);
            ctx.lineTo(entity.x - vx * trailLength, entity.y - vy * trailLength);
            ctx.closePath();
            ctx.stroke();
        }

    }


    return entity;
}