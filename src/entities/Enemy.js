import { Game, ctx, canvas } from '../engine/Game.js';
import { gameConfig } from '../characters/ConfigManager.js';

export class Enemy {
    constructor() {
        // Spawn at a random edge
        const edge = Math.floor(Math.random() * 4);
        // 0:top, 1:right, 2:bottom, 3:left
        if (edge === 0) { this.x = Math.random() * canvas.width; this.y = -20; }
        if (edge === 1) { this.x = canvas.width + 20; this.y = Math.random() * canvas.height; }
        if (edge === 2) { this.x = Math.random() * canvas.width; this.y = canvas.height + 20; }
        if (edge === 3) { this.x = -20; this.y = Math.random() * canvas.height; }

        // Enemy type selection using weights from config
        this.type = this.selectEnemyType();
        
        // Load configuration for this enemy type
        const enemyConfig = gameConfig.getEnemy(this.type);
        if (!enemyConfig) {
            console.warn(`No configuration found for enemy type: ${this.type}`);
            // Fallback to normal enemy stats
            this.size = 20;
            this.maxHealth = 2;
            this.color = '#ff4444';
            this.xpValue = 1;
        } else {
            const stats = enemyConfig.stats;
            const visuals = enemyConfig.visuals;
            
            this.size = stats.size;
            this.maxHealth = stats.maxHealth;
            this.color = visuals.color;
            this.xpValue = stats.xpValue;
            
            // Use simpler speed calculation for better performance
            this.speed = stats.baseSpeed;
            
            // Only apply level scaling if player exists and has leveled up
            if (Game.player && Game.player.level > 1) {
                this.speed += (Game.player.level - 1) * stats.speedLevelMultiplier;
            }
        }
        
        this.health = this.maxHealth;
        
        // Shield system for shielded enemies
        this.hasShield = this.type === 'shielded';
        this.shield = this.hasShield ? 1 : 0; // 1 hit shield
        this.speedBoostWhenShieldBroken = 1.3; // 30% speed boost
        this.originalSpeed = this.speed;
        
        // Poison effect tracking
        this.isPoisoned = false;
        this.poisonTimer = 0;
        
        // Burn effect tracking
        this.isBurning = false;
        this.burnDamage = 0;
        this.burnDuration = 0;
        this.burnTimer = 0;
        this.burnTickCounter = 0;
        
        console.log(`Spawned ${this.type} enemy: health=${this.maxHealth}, size=${this.size}, speed=${this.speed.toFixed(2)}${this.hasShield ? ', shielded' : ''}`);
    }
    
    selectEnemyType() {
        if (!gameConfig.isLoaded()) {
            // Fallback if config not loaded
            return Math.random() < 0.7 ? 'normal' : 'medium';
        }
        
        const enemyTypes = gameConfig.getEnemyTypes();
        const weights = [];
        let totalWeight = 0;
        
        // Build weighted array
        for (const type of enemyTypes) {
            const config = gameConfig.getEnemy(type);
            if (config && config.spawning) {
                const weight = config.spawning.weight || config.spawning.probability * 100;
                weights.push({ type, weight });
                totalWeight += weight;
            }
        }
        
        if (weights.length === 0) {
            return 'normal'; // Fallback
        }
        
        // Select based on weight
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        
        for (const { type, weight } of weights) {
            currentWeight += weight;
            if (random <= currentWeight) {
                return type;
            }
        }
        
        return weights[0].type; // Fallback to first type
    }

    update() {
        if (!Game.player) return;

        // Handle float-away animation (from InstantDeath powerup)
        if (this.floatAway) {
            this.floatTimer++;
            this.y -= 2; // Float upward
            this.floatOpacity = 1 - (this.floatTimer / this.floatDuration);
            
            if (this.floatTimer >= this.floatDuration) {
                this.dead = true; // Mark for removal
            }
            return; // Don't do normal movement
        }

        // Move toward player
        const angle = Math.atan2(Game.player.y - this.y, Game.player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
        
        // Update poison visual effect
        if (this.poisonTimer > 0) {
            this.poisonTimer--;
            
            // Apply poison damage every 30 frames (2 times per second)
            if (this.poisonTimer % 30 === 0 && this.poisonDamage) {
                const isDead = this.takeDamage(this.poisonDamage, 'poison');
                if (isDead) {
                    this.dead = true; // Mark for removal
                }
            }
            
            if (this.poisonTimer <= 0) {
                this.isPoisoned = false;
                this.poisonDamage = 0;
            }
        }
        
        // Update burn effect
        if (this.isBurning && this.burnTimer > 0) {
            this.burnTimer--;
            this.burnTickCounter++;
            
            // Apply burn damage every 20 frames (3 times per second)
            if (this.burnTickCounter % 20 === 0) {
                const isDead = this.takeDamage(this.burnDamage, 'fire');
                if (isDead) {
                    this.dead = true; // Mark for removal
                }
            }
            
            // End burn effect
            if (this.burnTimer <= 0) {
                this.isBurning = false;
                this.burnTickCounter = 0;
            }
        }
    }

    takeDamage(damage = 1, damageType = 'normal') {
        // Poison bypasses shields
        if (damageType === 'poison') {
            this.health -= damage;
            return this.health <= 0;
        }
        
        // Normal damage - check shield first
        if (this.hasShield && this.shield > 0) {
            this.shield -= 1;
            
            // Shield broken - increase speed
            if (this.shield <= 0) {
                this.speed = this.originalSpeed * this.speedBoostWhenShieldBroken;
                console.log(`${this.type} enemy shield broken! Speed increased to ${this.speed.toFixed(2)}`);
            }
            
            return false; // Enemy survives shield hit
        }
        
        // No shield or shield already broken - take health damage
        this.health -= damage;
        return this.health <= 0; // Returns true if enemy is dead
    }

    // Apply poison effect
    applyPoison(damage, duration) {
        this.isPoisoned = true;
        this.poisonDamage = damage;
        this.poisonTimer = Math.max(this.poisonTimer, duration); // Extend duration if longer
        console.log(`Enemy poisoned for ${duration} frames with ${damage} damage`);
    }

    // Apply burn effect
    applyBurn(damage, duration) {
        this.isBurning = true;
        this.burnDamage = damage;
        this.burnTimer = Math.max(this.burnTimer, duration); // Extend duration if longer
        this.burnDuration = duration;
        console.log(`Enemy burning for ${duration} frames with ${damage} damage`);
    }

    draw() {
        // Apply opacity for float-away animation
        if (this.floatAway && this.floatOpacity !== undefined) {
            ctx.globalAlpha = this.floatOpacity;
        }
        
        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Draw shield indicator
        if (this.hasShield && this.shield > 0) {
            ctx.strokeStyle = '#00ccff';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - this.size/2 - 2, this.y - this.size/2 - 2, this.size + 4, this.size + 4);
        }
        
        // Draw poison effect
        if (this.isPoisoned) {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        }
        
        // Draw burn effect
        if (this.isBurning) {
            // Flickering fire effect
            ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + Math.random() * 0.3})`;
            ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
            
            // Fire particles
            for (let i = 0; i < 3; i++) {
                const particleX = this.x + (Math.random() - 0.5) * this.size;
                const particleY = this.y + (Math.random() - 0.5) * this.size;
                ctx.fillStyle = `rgba(255, ${50 + Math.random() * 100}, 0, ${Math.random()})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, Math.random() * 2 + 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Reset opacity
        if (this.floatAway && this.floatOpacity !== undefined) {
            ctx.globalAlpha = 1;
        }
        
        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            const barWidth = this.size;
            const barHeight = 4;
            const barY = this.y - this.size/2 - 8;
            
            // Background (red)
            ctx.fillStyle = '#660000';
            ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
            
            // Health (green)
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        }
        
        // Draw shield bar if shielded
        if (this.hasShield) {
            const barWidth = this.size;
            const barHeight = 3;
            const barY = this.y - this.size/2 - 14; // Above health bar
            
            // Shield background
            ctx.fillStyle = '#003366';
            ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
            
            // Shield amount
            if (this.shield > 0) {
                ctx.fillStyle = '#00ccff';
                ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
            }
        }
    }
}