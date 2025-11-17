import { setCamTarget, setCamPos } from "../canvas.js";
import { keyboard, mouse } from "../input.js";
import { addEntity, checkCircleCollision } from "../world.js";
import * as Smoke from "./Smoke.js";
import * as Shuriken from "./Shuriken.js";
import { Entity } from "/src/EntitiesFactory.js";
import { checkSegmentCollision } from "../world.js";
import { createPerpendicularLine } from "../utils.js";
import ParticleSystem from "./ParticleSystem.js"

export async function create(x, y) {

    let entity = await Entity.create(x, y, "LuneBlade");

    entity.tag = "player";

    let speed = 2;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let dir;
    let attackTimer = 0;
    let dashTimer = 0;
    let shurikenTimer = 0;
    let attackRad = 15;

    let lookingRight = 1;

    entity.scale = 2;

    //timers
    let hitTimer = 0;

    let aimLineTarget = null;

    let ps = new ParticleSystem();
    addEntity(ps);

    setCamPos(x, y);

    entity.onAnimationEvent = (event) => {
        switch (event) {
            case "attack1":
                attack1();
        }
    }

    entity.onCollision = (other) => {
        // console.log(other.tag);   //console.log(`Player collided with ${other.tag}`);
    }

    entity.onUpdate = async (dt) => {

        //point to mouse
        const dx = mouse.worldX - entity.x;
        const dy = mouse.worldY - entity.y;

        dir = Math.atan2(dy, dx);
        const distToMouseSqr = dx * dx + dy * dy;

        if (dashTimer > 0) {
            dashTimer -= dt;
        }

        if (shurikenTimer > 0) {
            shurikenTimer -= dt;
        }

        if (hitTimer > 0) {
            hitTimer -= dt;
        } else if (attackTimer > 0) {
            attackTimer -= dt;
        } else {

            if (mouse.worldX > entity.x) {
                entity.setFlipX(false);
                lookingRight = 1;
            } else {
                entity.setFlipX(true);
                lookingRight = -1;
            }

            // if ((keyboard.KeyW || mouse.left) && distToMouseSqr > 300) {
            //     vx += Math.cos(dir) * speed;// * dt;
            //     vy += Math.sin(dir) * speed;// * dt;
            // }

            // if (keyboard.KeyS) {
            //     vx -= Math.cos(dir) * speed;// * dt;
            //     vy -= Math.sin(dir) * speed;// * dt;
            // }

            // if (keyboard.KeyD && distToMouseSqr > 300) {
            //     vx -= Math.cos(dir - Math.PI / 2) * speed;// * dt;
            //     vy -= Math.sin(dir - Math.PI / 2) * speed;// * dt;
            // }

            // if (keyboard.KeyA) {
            //     vx -= Math.cos(dir + Math.PI / 2) * speed;// * dt;
            //     vy -= Math.sin(dir + Math.PI / 2) * speed;// * dt;
            // }

            if (mouse.left) {

                shootRay();
                // if(shurikenTimer <= 0) {
                //     throwShuriken();
                // }
            } else {
                aimLineTarget = null;
                ps.on = false;
            }

            if (keyboard.ArrowLeft || keyboard.KeyA) {
                vx -= speed;// * dt;
                entity.setFlipX(true);
                lookingRight = -1;
            }

            if (keyboard.ArrowRight || keyboard.KeyD) {
                vx += speed;// * dt;
                entity.setFlipX(false);
                lookingRight = 1;
            }

            if (keyboard.ArrowUp || keyboard.KeyW) {
                vy -= speed;// * dt;
            }

            if (keyboard.ArrowDown || keyboard.KeyS) {
                vy += speed;// * dt;
            }

            // if (keyboard.Space) {
            //     if (entity.z === 0) {
            //         vz = 1;
            //         entity.setState("jump");
            //         let puff = await Smoke.create(entity.x, entity.y);
            //         addEntity(puff);
            //         // playRandomFart();    
            //         setTimeout(() => {
            //             entity.setState("idle")
            //         }, 400)
            //     }
            // }

            if (keyboard.Space) {
                entity.setState("attack1");
                entity.animFrameDelay = 50;
                attackTimer = 500;
                dashTimer = 300;
                vx += lookingRight * 5;
            }
        }

        vx *= 0.8;
        vy *= 0.8;
        vz -= 0.08;

        //normalize 
        if (dashTimer <= 0) {
            let len = Math.sqrt(vx * vx + vy * vy);
            if (len > speed) {
                vx = (vx / len) * speed;
                vy = (vy / len) * speed;
            }
        }

        entity.x += vx;
        entity.y += vy;
        entity.z += vz;

        if (Math.abs(vx) < 0.01) vx = 0;
        if (Math.abs(vy) < 0.01) vy = 0;
        if (entity.z < 0) {
            entity.z = 0;
            vz = 0;
        }

        setCamTarget(entity.x, entity.y);


        if (hitTimer <= 0 && attackTimer <= 0) {
            if ((vx !== 0 || vy !== 0) && entity.z === 0) {
                entity.setState("run");
                entity.animFrameDelay = 100;
            } else if (entity.z === 0) {
                entity.setState("idle");
                entity.animFrameDelay = 100;
            }
        }
    }

    entity.onDrawBehind = (ctx) => {

        // if (attackTimer > 0) {
        //     ctx.beginPath();
        //     ctx.arc(entity.x + 12 * lookingRight, entity.y, attackRad, 0, Math.PI * 2);
        //     ctx.fillStyle = "red";
        //     ctx.fill();
        // }

        try {
            if (aimLineTarget != null) {
                let perp = createPerpendicularLine(entity.x, entity.y, aimLineTarget.x, aimLineTarget.y, 30)
                const gradient = ctx.createLinearGradient(perp.x1, perp.y1, perp.x2, perp.y2);
                gradient.addColorStop(0, '#ffff8800');
                gradient.addColorStop(0.43, '#ffff8833');
                gradient.addColorStop(0.5, '#ffffffff');
                gradient.addColorStop(0.57, '#ffff8833');
                gradient.addColorStop(1, '#ffff8800');

                ctx.globalCompositeOperation = "color-dodge";

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 30;
                ctx.lineCap = "none";
                ctx.beginPath();
                ctx.moveTo(entity.x, entity.y);
                ctx.lineTo(aimLineTarget.x, aimLineTarget.y);
                ctx.stroke();


                const hitPointSize = 5 + Math.random() * 5;
                const hitPointGradient = ctx.createRadialGradient(aimLineTarget.x, aimLineTarget.y, 2, aimLineTarget.x, aimLineTarget.y, hitPointSize)
                hitPointGradient.addColorStop(0, "#ffffff88");
                hitPointGradient.addColorStop(1, "#ffff3300");
                ctx.beginPath();
                ctx.fillStyle = hitPointGradient;
                ctx.arc(aimLineTarget.x, aimLineTarget.y, hitPointSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        catch (err) {
            debugger;
            console.error(err);
        }

    }

    entity.hit = (col, dmg) => {
        vx += col.x;
        vy += col.y;
        hitTimer = 300;
        attackTimer = 0;
        entity.flash(300, "red");
        entity.setState("hit");
    }

    function attack1() {
        let collisions = checkCircleCollision(entity.x + 12 * lookingRight, entity.y, attackRad);
        collisions.forEach(col => {
            if (col.entity === entity) return;
            if (col.entity.hit) {
                col.x /= 3;
                col.y /= 3;
                col.entity.hit(col, 20);
            }
        });
    }

    async function throwShuriken() {
        let s = await Shuriken.create(entity.x, entity.y, Math.cos(dir), Math.sin(dir), entity);
        entity.setState("dash");
        addEntity(s);
        shurikenTimer = 300;
    }

    function shootRay() {
        let p1 = { x: entity.x, y: entity.y }
        let p2 = { x: entity.x + Math.cos(dir) * 1000, y: entity.y + Math.sin(dir) * 1000 }
        let col = checkSegmentCollision(p1, p2, entity);
        if (col.hit) {
            aimLineTarget = { x: col.hitPoint.x, y: col.hitPoint.y }
            ps.x = col.hitPoint.x;
            ps.y = col.hitPoint.y;
            ps.on = true;

            if (col.entity.hit) {

                col.x *= 0.01;
                col.y *= 0.01;
                col.entity.hit(col, 0.1);
            }

        } else {
            aimLineTarget = {
                x: entity.x + Math.cos(dir) * 500,
                y: entity.y + Math.sin(dir) * 500
            }
            ps.on = false;
        }
    }

    return entity;
}
