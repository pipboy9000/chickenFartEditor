import { Entity } from "../EntitiesFactory.js";
import { checkCircleCollision, removeEntity } from "../world.js";
import { valueToRedToGreen } from "../utils.js";

export async function create(x, y, target) {

    let entity = await Entity.create(x, y, "WarriorKing");

    entity.tag = "wk";

    let vx = 0, vy = 0;
    let speed = 0.1;

    let lookingRight = 1;

    let attackRad = 15;

    let idleTimer = 1000;
    let walkTimer = 0;
    let hitTimer = 0;
    let attackTimer = 0;
    let tauntTimer = 0;

    let hp = 100;

    entity.onAnimationEvent = (eventName) => {
        switch (eventName) {
            case "attack1-1":
                attack();
                break;
            case "attack1-2":
                attack();
                break;
            case "attack1-3":
                attack();
                break;

            case "death":
                console.log("death")
                removeEntity(entity);
                break;
        }
    }

    entity.hit = (col, dmg) => {
        vx += col.x;
        vy += col.y;
        entity.flash(1500);

        hp -= dmg;

        if (hp <= 0) {
            setState("death");
            entity.collision = null;
        } else {
            setState("taunt");
        }
    }

    entity.onDraw = (ctx) => {
        // if (entity.currState === "attack1") {
        //     ctx.beginPath();
        //     ctx.arc(entity.x + 10 * lookingRight, entity.y - 2, attackRad, 0, Math.PI * 2);
        //     ctx.fillStyle = "red";
        //     ctx.fill();
        // }

        if (hp > 0) {
            const color = valueToRedToGreen(hp / 100);
            ctx.fillStyle = color;
            ctx.fillRect(entity.x - 10, entity.y - 30, hp / 100 * 20, 2);
        }
    }

    function attack() {
        let collisions = checkCircleCollision(entity.x + 10 * lookingRight, entity.y - 2, attackRad);
        collisions.forEach(col => {
            if (col.entity === entity) return;
            if (col.entity.hit) {
                col.entity.hit(col, 10);
            }
        });
    }

    entity.onUpdate = async (dt) => {

        if (entity.currState === "death") return;

        //flip to face target
        if (target.x > entity.x) {
            entity.setFlipX(false);
            lookingRight = 1;
        } else {
            entity.setFlipX(true);
            lookingRight = -1;
        }

        if (hitTimer > 0) {
            hitTimer -= dt;
            if (hitTimer <= 0) {
                setState("idle");
            }
        } else if (idleTimer > 0) {
            idleTimer -= dt;
            if (idleTimer <= 0) {
                setState("walk")
            }
        } else if (walkTimer > 0) {

            let dx = target.x - 15 * lookingRight - entity.x;
            let dy = target.y - entity.y
            let dir = Math.atan2(dy, dx);
            vx += Math.cos(dir) * speed;
            vy += Math.sin(dir) * speed;

            let dist = Math.hypot(dy, dx);

            if (dist < 10) {
                setState("attack1");
            } else {
                walkTimer -= dt;
                if (walkTimer <= 0) {
                    setState("idle");
                }
            }
        } else if (attackTimer > 0) {
            attackTimer -= dt;
            if (attackTimer <= 0) {
                setState("idle")
            }
        } else if (tauntTimer > 0) {
            tauntTimer -= dt;
            if (tauntTimer <= 0) {
                setState("walk");
            }
        }

        vx *= 0.8;
        vy *= 0.8;

        entity.x += vx;
        entity.y += vy;
    }

    function resetTimers() {
        idleTimer = 0;
        walkTimer = 0;
        hitTimer = 0;
        attackTimer = 0;
    }

    function setState(state) {

        entity.setState(state);

        resetTimers();

        switch (state) {
            case "idle":
                entity.animFrameDelay = 300;
                idleTimer = 1000;
                break;

            case "walk":
                entity.animFrameDelay = 200;
                walkTimer = 1000;
                break;

            case "attack1":
                entity.animFrameDelay = 50;
                attackTimer = 1500;
                break;

            case "taunt":
                entity.animFrameDelay = 100;
                tauntTimer = 1800;
                break;

            case "death":
                entity.animFrameDelay = 300;

        }
    }


    return entity;

}