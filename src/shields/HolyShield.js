/**
 * HolyShield.js
 * Base class for shield mechanics - can be extended for custom shield types
 */

import { Game, ctx } from '../engine/Game.js';

export class HolyShield {
    constructor(owner) {
        this.owner = owner;
        this.active = false;
        this.charges = 1; // Number of blocks available
        this.maxCharges = 1;
        
        // Visual properties
        this.iconSize = 32;
        this.iconX = 0;
        this.iconY = 0;
        this.glowIntensity = 0;
        this.glowPulse = 0;
    }
    
    /**
     * Update shield state
     */
    update() {
        // Pulse glow effect when active
        if (this.active) {
            this.glowPulse += 0.1;
            this.glowIntensity = Math.sin(this.glowPulse) * 0.3 + 0.7;
        }
        
        // Position shield icon relative to owner
        if (this.owner) {
            this.iconX = this.owner.x - 25;
            this.iconY = this.owner.y - 35;
        }
    }
    
    /**
     * Draw shield icon on player
     */
    draw() {
        if (!this.active || this.charges <= 0) return;
        
        ctx.save();
        
        // Draw glow effect
        if (this.glowIntensity > 0) {
            ctx.shadowBlur = 20 * this.glowIntensity;
            ctx.shadowColor = '#ffdd00';
        }
        
        // Draw shield icon
        ctx.font = `${this.iconSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffdd00';
        ctx.fillText('🛡️', this.iconX, this.iconY);
        
        // Draw charge indicators if max > 1
        if (this.maxCharges > 1) {
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeText(this.charges.toString(), this.iconX + 15, this.iconY + 15);
            ctx.fillText(this.charges.toString(), this.iconX + 15, this.iconY + 15);
        }
        
        ctx.restore();
    }
    
    /**
     * Activate the shield
     */
    activate() {
        this.active = true;
        this.charges = this.maxCharges;
        console.log("🛡️ Holy Shield activated!");
    }
    
    /**
     * Deactivate the shield
     */
    deactivate() {
        this.active = false;
        this.charges = 0;
        console.log("🛡️ Holy Shield deactivated");
    }
    
    /**
     * Try to block an incoming attack
     * @returns {boolean} true if attack was blocked
     */
    tryBlock(damage = 1) {
        if (!this.active || this.charges <= 0) {
            return false;
        }
        
        this.charges--;
        console.log(`💫 Holy Shield blocked attack! (${this.charges} charges remaining)`);
        
        // Visual feedback
        this.onBlockEffect();
        
        // Deactivate if no charges left
        if (this.charges <= 0) {
            this.deactivate();
            this.onDepletedEffect();
        }
        
        return true;
    }
    
    /**
     * Visual effect when blocking an attack
     */
    onBlockEffect() {
        if (this.owner) {
            // Flash gold
            const originalColor = this.owner.color;
            this.owner.color = '#ffdd00';
            setTimeout(() => {
                if (this.owner) this.owner.color = originalColor;
            }, 100);
            
            // Grant brief invincibility
            if (this.owner.healthManager) {
                this.owner.healthManager.invulnTimer = 30; // 0.5 seconds
            }
        }
    }
    
    /**
     * Effect when shield is fully depleted
     */
    onDepletedEffect() {
        // Override in subclasses for custom effects
    }
    
    /**
     * Add charges to the shield
     */
    addCharges(amount) {
        const before = this.charges;
        this.charges = Math.min(this.charges + amount, this.maxCharges);
        if (this.charges > 0) {
            this.active = true;
        }
        console.log(`🛡️ addCharges(${amount}): ${before} → ${this.charges} (max: ${this.maxCharges})`);
    }
    
    /**
     * Check if shield has any charges
     */
    hasCharges() {
        return this.active && this.charges > 0;
    }
}
