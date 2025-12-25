import { Game, ctx } from '../engine/Game.js';

/**
 * HealthManager - Manages player health with hearts system (Binding of Isaac style)
 * Each heart = 2 HP (half heart = 1 HP)
 * Example: 100 HP = 50 hearts = 25 full heart containers
 */
export class HealthManager {
    constructor(maxHealth) {
        // Convert health value to hearts (each heart = 2 HP)
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.maxHearts = Math.ceil(maxHealth / 2); // Number of heart containers
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 60; // frames of invulnerability after hit
        
        // Visual feedback
        this.hitFlash = false;
        this.hitFlashTimer = 0;
    }

    /**
     * Take damage
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} true if player died, false otherwise
     */
    takeDamage(amount) {
        if (this.invulnerable) return false;

        this.currentHealth -= amount;
        
        // Trigger hit effects
        this.hitFlash = true;
        this.hitFlashTimer = 10;
        this.invulnerable = true;
        this.invulnerabilityTimer = this.invulnerabilityDuration;

        console.log(`💔 Player took ${amount} damage! Health: ${this.currentHealth}/${this.maxHealth}`);

        // Check for death
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            console.log("☠️ Player died!");
            return true;
        }

        return false;
    }

    /**
     * Heal player
     * @param {number} amount - Amount of HP to heal
     */
    heal(amount) {
        const oldHealth = this.currentHealth;
        this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
        
        if (this.currentHealth > oldHealth) {
            console.log(`❤️ Player healed ${this.currentHealth - oldHealth} HP! Health: ${this.currentHealth}/${this.maxHealth}`);
        }
    }

    /**
     * Add max health (increase heart containers)
     * @param {number} amount - Amount to increase max health by (in HP, not hearts)
     */
    addMaxHealth(amount) {
        this.maxHealth += amount;
        this.maxHearts = Math.ceil(this.maxHealth / 2);
        this.currentHealth += amount; // Also heal when gaining max health
        
        console.log(`💗 Max health increased! Now ${this.maxHealth} HP (${this.maxHearts} hearts)`);
    }

    /**
     * Update invulnerability timer and effects
     */
    update() {
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer--;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Update hit flash
        if (this.hitFlash) {
            this.hitFlashTimer--;
            if (this.hitFlashTimer <= 0) {
                this.hitFlash = false;
            }
        }
    }

    /**
     * Draw hearts UI (Binding of Isaac style)
     * @param {number} x - X position to start drawing
     * @param {number} y - Y position to draw at
     */
    drawHearts(x, y) {
        const heartSize = 20;
        const heartSpacing = 25;
        const heartsPerRow = 10;

        const fullHearts = Math.floor(this.currentHealth / 2);
        const hasHalfHeart = this.currentHealth % 2 === 1;

        for (let i = 0; i < this.maxHearts; i++) {
            const row = Math.floor(i / heartsPerRow);
            const col = i % heartsPerRow;
            const heartX = x + (col * heartSpacing);
            const heartY = y + (row * heartSpacing);

            // Determine heart state
            let heartType = 'empty';
            if (i < fullHearts) {
                heartType = 'full';
            } else if (i === fullHearts && hasHalfHeart) {
                heartType = 'half';
            }

            this.drawHeart(heartX, heartY, heartSize, heartType);
        }
    }

    /**
     * Draw a single heart
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of the heart
     * @param {string} type - 'full', 'half', or 'empty'
     */
    drawHeart(x, y, size, type) {
        ctx.save();

        // Heart outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Heart fill color based on type
        if (type === 'full') {
            ctx.fillStyle = '#ff0000';
        } else if (type === 'half') {
            ctx.fillStyle = '#ff0000';
        } else {
            ctx.fillStyle = '#333333';
        }

        // Draw heart shape (simplified as a square with notch)
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.lineTo(x + size * 0.5, y);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.lineTo(x + size * 0.5, y + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw half overlay if needed
        if (type === 'half') {
            ctx.fillStyle = '#333333';
            ctx.fillRect(x + size * 0.5, y, size * 0.5, size);
        }

        ctx.restore();
    }

    /**
     * Check if player is dead
     * @returns {boolean}
     */
    isDead() {
        return this.currentHealth <= 0;
    }

    /**
     * Check if player is currently invulnerable
     * @returns {boolean}
     */
    isInvulnerable() {
        return this.invulnerable;
    }

    /**
     * Check if player should flash (for visual feedback)
     * @returns {boolean}
     */
    shouldFlash() {
        return this.hitFlash || (this.invulnerable && Math.floor(this.invulnerabilityTimer / 5) % 2 === 0);
    }

    /**
     * Get current health percentage
     * @returns {number} 0-1 representing health percentage
     */
    getHealthPercentage() {
        return this.currentHealth / this.maxHealth;
    }
}
