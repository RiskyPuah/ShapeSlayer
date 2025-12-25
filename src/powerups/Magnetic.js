import { Game, ctx } from '../engine/Game.js';

/**
 * Magnetic - Powerup that attracts gems
 * When collected, all gems become magnetized and auto-collect
 */
export class Magnetic {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 15; 
        this.color = '#aa00aa'; // Purple
        this.collected = false;
        
        // Bobbing animation effect
        this.baseY = y;
        this.floatOffset = 0;
    }

    update() {
        if (!Game.player) return;

        // 1. Float animation (Sine wave)
        this.floatOffset = Math.sin(Game.frameCount * 0.1) * 5;
        this.y = this.baseY + this.floatOffset;

        // 2. Collision with Player
        const dist = Math.hypot(Game.player.x - this.x, Game.player.y - this.y);
        if (dist < Game.player.radius + this.size) {
            this.activateMagnet();
            this.collected = true;
        }
    }

    /**
     * Activate magnet effect - magnetize all gems
     */
    activateMagnet() {
        Game.gems.forEach(gem => {
            gem.magnetized = true; 
            gem.speed = 12;
        });
        console.log("🧲 MAGNET ACTIVATED!");
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw Purple Square
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Draw a border to make it pop
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
    }
}
