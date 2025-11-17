export default class ParticleSystem {
    constructor() {
        this.on = false;
        this.x = 0;
        this.y = 0;
        this.delay = 50;
        this.particles = [];
        this.delayTimer = 0;
        this.spread = 3;
        this.currentlyActive = 0;
        this.maxParticleAge = 20;
        this.gravity = 0.1;
        this.onDrawParticle;

        //init particles;
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                active: false,
                x: 0,
                y: 0,
                z: 0,
                vx: 0,
                vy: 0,
                vz: 0,
                age: 0,
                size: 10
            });
        }
    }

    update = (dt) => {

        //check if time to spawn a new particle
        this.delayTimer -= dt;
        if (this.delayTimer <= 0) {
            if (this.on) {
                this.spawnParticle();
                this.delayTimer = this.delay;
            }
        }

        for (const p of this.particles) {

            if (p.active) {

                p.age++;

                p.size *= 0.9;

                if (p.age > this.maxParticleAge) {
                    p.active = false;
                } else {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.z += p.vz;

                    p.vz += this.gravity;

                    if(p.z  > 10) p.vz *= -1;

                }
            }
        }
    }

    draw = (ctx) => {

        for (const p of this.particles) {
            if (p.active) {
                if (this.onDrawParticle) {
                    ctx.save();
                    this.onDrawParticle(ctx);
                    ctx.restore();
                } else {

                    const gradient = ctx.createRadialGradient(
                        p.x, // x0: Inner circle center X
                        p.y + p.z, // y0: Inner circle center Y
                        0,      // r0: Inner circle radius (where the gradient starts)

                        p.x, // x1: Outer circle center X
                        p.y + p.z, // y1: Outer circle center Y
                        p.size   // r1: Outer circle radius (where the gradient ends)
                    );

                    // --- Define Color Stops ---

                    // 2. Add color stops to the gradient
                    gradient.addColorStop(0, 'white');    // 0.0: The very center is bright white
                    gradient.addColorStop(0.5, '#ffff3388');   // 0.3: Fades to gold
                    gradient.addColorStop(1, '#ffffff00');

                    ctx.save();

                    //default particle
                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.globalCompositeOperation = "overlay";
                    ctx.arc(p.x, p.y + p.z, p.size, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }

            }

            ctx.restore();
        }

    }

    spawnParticle = () => {
        let p = this.particles.find(p => !p.active);
        if (p) {
            p.active = true;
            p.x = this.x;
            p.y = this.y;
            p.z = 0;
            p.vx = Math.random() * this.spread - this.spread * 0.5;
            p.vy = Math.random() * this.spread - this.spread * 0.5;
            p.vz = Math.random() * this.spread - this.spread * 0.5;
            p.age = 0;
            p.size = Math.random() * 4 + 4;
        }
    }
}