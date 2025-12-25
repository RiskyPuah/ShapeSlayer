/**
 * HolyShieldPowerup.js
 * Grants a Holy Shield to the player (for testing)
 */

import { Powerup } from './Powerup.js';
import { HolyShield } from '../shields/HolyShield.js';
import { ctx } from '../engine/Game.js';

export class HolyShieldPowerup extends Powerup {
    constructor(x, y) {
        super(x, y);
        this.icon = '🛡️';
        this.color = '#ffdd00'; // Gold
        this.radius = 20; // Larger for visibility
        this.pulseTimer = 0;
    }

    /**
     * Update with pulse animation
     */
    update() {
        super.update();
        this.pulseTimer += 0.1;
    }

    /**
     * Draw with glow effect
     */
    draw() {
        ctx.save();
        
        // Pulsing glow effect
        const pulseScale = 1 + Math.sin(this.pulseTimer) * 0.2;
        const glowSize = this.radius * pulseScale;
        
        // Draw glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.color;
        
        // Draw background circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 221, 0, 0.3)';
        ctx.fill();
        
        // Draw icon (large and centered)
        ctx.shadowBlur = 20;
        ctx.font = `${this.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color;
        ctx.fillText(this.icon, this.x, this.y);
        
        ctx.restore();
    }

    /**
     * Grant holy shield when collected
     */
    onCollected(player) {
        console.log("🛡️ Holy Shield powerup collected!");
        console.log("Player shield status:", player.shield ? "HAS SHIELD" : "NO SHIELD");
        
        // If player already has a shield, just add a charge
        if (player.shield) {
            const beforeCharges = player.shield.charges;
            player.shield.addCharges(1);
            console.log(`✨ Shield charge added! ${beforeCharges} → ${player.shield.charges} charges`);
        } else {
            // Give player a basic holy shield with 1 charge
            player.shield = new HolyShield(player);
            player.shield.activate();
            console.log("✨ Holy Shield granted! Player now has shield protection.");
        }
    }
}
