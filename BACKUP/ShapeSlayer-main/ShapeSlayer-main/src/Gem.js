import { Game, ctx } from './Game.js';

export class Gem {
    constructor(x, y, xpValue = 5) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.color = '#00ff00';
        this.xpValue = xpValue;
        this.magnetized = false;
        this.speed = 8;
        this.collected = false; // <--- The missing flag
    }

    update() {
        if (!Game.player) return;

        // 1. Calculate distance to player
        const dist = Math.hypot(Game.player.x - this.x, Game.player.y - this.y);
        
        // 2. Magnet Logic - use weapon's absorption range or default
        const absorptionRange = Game.player.weapon ? Game.player.weapon.gemAbsorptionRange : 100;
        if (dist < absorptionRange) {
            this.magnetized = true;
        }

        // 3. Movement
        if (this.magnetized) {
            const angle = Math.atan2(Game.player.y - this.y, Game.player.x - this.x);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }

        // 4. Pickup Logic (Collision)
        // If gem touches player (radius + gem size), mark as collected
        if (dist < Game.player.radius + this.size) {
            this.collected = true; 
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}