import { Game, ctx } from '../engine/Game.js';
import { Powerup } from './Powerup.js';
import { Gem } from '../entities/Gem.js';

/**
 * Instant Death Powerup
 * When collected, kills all enemies currently on screen
 * Used for testing/debugging gameplay balance
 */
export class InstantDeath extends Powerup {
    constructor(x, y) {
        super(x, y);
        this.color = '#ff0000'; // Red for danger/death
    }

    /**
     * Called when powerup is collected
     * Instantly kills all enemies on screen
     */
    onCollected() {
        const enemyCount = Game.enemies.length;
        
        // Kill all enemies and drop XP
        Game.enemies.forEach(enemy => {
            // Drop XP gem at enemy position
            Game.gems.push(new Gem(enemy.x, enemy.y, enemy.xpValue));
            Game.score += 10;
            
            // Add float-away animation before removal
            enemy.floatAway = true;
            enemy.floatTimer = 0;
            enemy.floatDuration = 30; // frames to float up
            enemy.floatOpacity = 1;
        });
        
        console.log(`💀 INSTANT DEATH! Killed ${enemyCount} enemies! Dropped ${enemyCount}x XP`);
        document.getElementById('score').innerText = Game.score;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw Red Square
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Draw a skull symbol or X for death
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        // Draw X pattern
        ctx.beginPath();
        ctx.moveTo(-this.size/3, -this.size/3);
        ctx.lineTo(this.size/3, this.size/3);
        ctx.moveTo(this.size/3, -this.size/3);
        ctx.lineTo(-this.size/3, this.size/3);
        ctx.stroke();
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
    }

    /**
     * Get the drop chance for this powerup
     */
    getDropChance() {
        return this.dropChance;
    }

    /**
     * Set the drop chance (for testing/balance)
     */
    setDropChance(chance) {
        this.dropChance = Math.max(0, Math.min(1, chance)); // Clamp 0-1
    }
}
