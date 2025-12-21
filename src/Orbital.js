import { ctx, Game } from './Game.js';

export class Orbital {
    constructor(owner, type) {
        this.owner = owner;
        this.type = type; // 'sword' or 'shield'
        this.angle = 0;
        this.level = 1;

        if (type === 'sword') {
            this.count = 2;       // 2 swords
            this.distance = 60;   // Close orbit
            this.speed = 0.1;     // Fast spin
            this.size = 20;       // Long blade
            this.color = '#00ffff';
            this.damage = 100;    // High damage
            this.knockback = 0;
        } else { // Shield
            this.count = 1;
            this.distance = 70;
            this.speed = 0.05;    // Slow spin
            this.size = 40;       // Big block
            this.color = '#00ff00';
            this.damage = 10;     // Low damage
            this.knockback = 15;  // High knockback (pushes enemies away)
        }

    }

    // --- NEW: Ability to upgrade existing orbitals ---
    upgrade() {
        this.level++;
        if (this.type === 'sword') {
            this.count++;       // Add another sword
            this.speed += 0.05; // Spin faster
            this.damage += 20;  // More damage
        } else {
            this.size += 10;    // Bigger shield
            this.knockback += 5;// Push enemies harder
        }
    }

    update() {
        // Spin the angle
        this.angle += this.speed;
        
        // Check collision with ALL enemies
        Game.enemies.forEach(enemy => {
            for (let i = 0; i < this.count; i++) {
                // Calculate position of each orbital "blade"
                const currentAngle = this.angle + (i * (Math.PI * 2 / this.count));
                const bx = this.owner.x + Math.cos(currentAngle) * this.distance;
                const by = this.owner.y + Math.sin(currentAngle) * this.distance;

                // Simple distance check
                const dist = Math.hypot(bx - enemy.x, by - enemy.y);
                
                if (dist < (this.size + enemy.size) / 1.5) {
                    // HIT!
                    if (this.type === 'sword') {
                        // Swords kill instantly (for now)
                        enemy.hp = 0; // Mark for deletion (requires Enemy.js update to handle HP)
                        // Hack for now: just remove from list if we don't have HP system
                        enemy.dead = true; 
                    } 
                    else if (this.type === 'shield') {
                        // Shield pushes enemy back
                        const pushAngle = Math.atan2(enemy.y - this.owner.y, enemy.x - this.owner.x);
                        enemy.x += Math.cos(pushAngle) * this.knockback;
                        enemy.y += Math.sin(pushAngle) * this.knockback;
                    }
                }
            }
        });
    }

    draw() {
        for (let i = 0; i < this.count; i++) {
            const currentAngle = this.angle + (i * (Math.PI * 2 / this.count));
            const bx = this.owner.x + Math.cos(currentAngle) * this.distance;
            const by = this.owner.y + Math.sin(currentAngle) * this.distance;

            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(currentAngle + (Math.PI / 2)); // Point outward
            
            ctx.fillStyle = this.color;
            if (this.type === 'sword') {
                // Draw Sword shape
                ctx.fillRect(-2, -15, 4, 30);
            } else {
                // Draw Shield shape
                ctx.fillRect(-5, -20, 10, 40);
            }
            ctx.restore();
        }
    }
}