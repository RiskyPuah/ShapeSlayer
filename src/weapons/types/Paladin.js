import { BaseWeapon } from '../BaseWeapon.js';
import { Game, ctx } from '../../engine/Game.js';
import { Gem } from '../../entities/Gem.js';
import { PowerupFactory } from '../../powerups/PowerupFactory2.js';
import { PaladinShield } from '../../shields/PaladinShield.js';

export class Paladin extends BaseWeapon {
    constructor(owner) {
        super(owner, 'paladin');
        
        // Visual effect properties
        this.arcEffect = null; // Will store arc effect data
        
        // Give player a Paladin Shield
        if (this.owner) {
            this.owner.shield = new PaladinShield(this.owner, 7200); // 2 minute recharge
        }
    }
    
    initializeWeapon() {
        this.fireRate = 60;     // Medium-slow attack rate
        this.damage = 1.5;        // Base damage
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'arc';
        this.speedModifier = 0.9; // 10% slower (armored)
        this.arcRange = 100;     // Range of the arc attack
        this.arcAngle = Math.PI / 2; // 90-degree arc
    }
    
    // Override damage upgrade for paladins
    applyDamageUpgrade() {
        this.damage += 0.75; // Paladins get good damage upgrades
        console.log(`${this.type} damage increased to ${this.damage}`);
    }
    
    // Paladin-specific upgrades
    applyArcRangeUpgrade() {
        this.arcRange += 20; // Increase arc attack range
        console.log(`${this.type} arc range increased to ${this.arcRange}`);
    }
    
    applyArcAngleUpgrade() {
        this.arcAngle = Math.min(this.arcAngle + Math.PI / 6, Math.PI); // Increase by 30 degrees, max 180
        console.log(`${this.type} arc angle increased to ${(this.arcAngle * 180 / Math.PI).toFixed(0)} degrees`);
    }
    
    applySmiteUpgrade() {
        if (!this.smiteEnabled) {
            this.smiteEnabled = true;
            console.log(`${this.type} learned Smite! Arc attacks deal bonus damage when Holy Shield is active.`);
        } else {
            this.smiteMultiplier = (this.smiteMultiplier || 1.5) + 0.5;
            console.log(`${this.type} Smite power increased! Multiplier: ${this.smiteMultiplier}x`);
        }
    }
    
    // Override upgrade system to include Paladin-specific options
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'arcRange':
                this.applyArcRangeUpgrade();
                break;
            case 'arcAngle':
                this.applyArcAngleUpgrade();
                break;
            case 'smite':
                this.applySmiteUpgrade();
                break;
            case 'holyShieldCooldown':
                this.applyHolyShieldCooldownUpgrade();
                break;
            default:
                super.applyUpgrade(upgradeType); // Use base weapon upgrades for others
                break;
        }
    }
    
    applyHolyShieldCooldownUpgrade() {
        // Upgrade the shield directly
        if (this.owner && this.owner.shield && this.owner.shield.reduceRechargeCooldown) {
            this.owner.shield.reduceRechargeCooldown(0.85);
        } else {
            console.log("No shield to upgrade!");
        }
    }
    
    // Override to use arc attack instead of projectiles
    createProjectiles(mouseX, mouseY) {
        this.performArcAttack(mouseX, mouseY);
    }
    
    /**
     * Smart targeting for Paladin - finds the best angle to hit the most enemies
     */
    findBestArcTarget() {
        if (!this.owner || !Game.enemies || Game.enemies.length === 0) return null;
        
        let bestTarget = null;
        let bestScore = -1;
        
        // Test each enemy as a potential target
        Game.enemies.forEach(enemy => {
            const distToEnemy = Math.hypot(enemy.x - this.owner.x, enemy.y - this.owner.y);
            
            // Skip if out of range
            if (distToEnemy > this.arcRange) return;
            
            // Calculate angle to this enemy
            const angleToEnemy = Math.atan2(enemy.y - this.owner.y, enemy.x - this.owner.x);
            
            // Count how many enemies would be hit if we aimed at this angle
            let hitCount = 0;
            let totalHealth = 0;
            
            Game.enemies.forEach(otherEnemy => {
                const distToOther = Math.hypot(otherEnemy.x - this.owner.x, otherEnemy.y - this.owner.y);
                if (distToOther > this.arcRange) return;
                
                const angleToOther = Math.atan2(otherEnemy.y - this.owner.y, otherEnemy.x - this.owner.x);
                let angleDiff = angleToOther - angleToEnemy;
                
                // Normalize angle difference
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                
                if (Math.abs(angleDiff) <= this.arcAngle / 2) {
                    hitCount++;
                    totalHealth += otherEnemy.health || 1;
                }
            });
            
            // Calculate score: prioritize hit count, then total health, with distance penalty
            // More enemies hit = better score
            // Closer targets get slight bonus
            const distanceFactor = 1 - (distToEnemy / this.arcRange) * 0.3; // 30% bonus for closer targets
            const score = (hitCount * 100) + (totalHealth * 10) + (distanceFactor * 50);
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = {
                    x: enemy.x,
                    y: enemy.y,
                    angle: angleToEnemy,
                    hitCount: hitCount,
                    distance: distToEnemy
                };
            }
        });
        
        return bestTarget;
    }
    
    performArcAttack(mouseX, mouseY) {
        if (!this.owner || !Game.enemies) return;
        
        // Use smart targeting to find best arc angle
        const target = this.findBestArcTarget();
        if (!target) return; // No enemies in range
        
        const targetAngle = target.angle;
        
        console.log(`🎯 Paladin targeting cluster: ${target.hitCount} enemies at ${target.distance.toFixed(0)}px`);
        
        // Create visual arc effect
        this.arcEffect = {
            x: this.owner.x,
            y: this.owner.y,
            angle: targetAngle,
            arcAngle: this.arcAngle,
            range: this.arcRange,
            duration: 15, // frames
            age: 0,
            opacity: 1.0
        };
        
        const enemiesHit = [];
        
        Game.enemies.forEach(enemy => {
            if (!enemy) return;
            
            // Check if enemy is in range
            const distToEnemy = Math.hypot(enemy.x - this.owner.x, enemy.y - this.owner.y);
            if (distToEnemy > this.arcRange) return;
            
            // Check if enemy is in the arc
            const angleToEnemy = Math.atan2(enemy.y - this.owner.y, enemy.x - this.owner.x);
            let angleDiff = angleToEnemy - targetAngle;
            
            // Normalize angle difference to [-π, π]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            if (Math.abs(angleDiff) <= this.arcAngle / 2) {
                // Enemy is in the arc! Calculate damage based on enemy type
                let damage = this.damage;
                if (enemy.type === 'medium') {
                    damage = this.damage * 2; // Double damage to medium enemies
                }
                
                // Apply Smite bonus if Holy Shield is active and Smite is learned
                const shieldActive = this.owner?.shield?.hasCharges();
                if (this.smiteEnabled && shieldActive) {
                    damage *= (this.smiteMultiplier || 1.5);
                    console.log("SMITE activated! Bonus damage applied.");
                }
                
                enemiesHit.push({enemy, damage});
            }
        });
        
        // Apply damage to all enemies in arc
        enemiesHit.forEach(({enemy, damage}) => {
            const isDead = enemy.takeDamage(damage);
            if (isDead) {
                // Remove enemy and drop rewards
                const index = Game.enemies.indexOf(enemy);
                if (index > -1) {
                    Game.enemies.splice(index, 1);
                    Game.gems.push(new Gem(enemy.x, enemy.y, enemy.xpValue));
                    
                    // Use PowerupFactory for proper powerup spawning
                    const powerup = PowerupFactory.spawnPowerup(enemy.x, enemy.y);
                    if (powerup) {
                        Game.powerups.push(powerup);
                    }
                    
                    Game.score += 10;
                    document.getElementById('score').innerText = Game.score;
                }
            }
        });
        
        console.log(`Paladin arc attack hit ${enemiesHit.length} enemies`);
    }
    
    // Override update to handle arc visual effects
    update() {
        super.update(); // Call base weapon update
        
        // Update arc effect
        if (this.arcEffect) {
            this.arcEffect.age++;
            this.arcEffect.opacity = 1.0 - (this.arcEffect.age / this.arcEffect.duration);
            
            if (this.arcEffect.age >= this.arcEffect.duration) {
                this.arcEffect = null;
            }
        }
    }
    
    // Draw the arc effect
    drawArcEffect() {
        if (!this.arcEffect) return;
        
        ctx.save();
        ctx.globalAlpha = this.arcEffect.opacity;
        
        // Draw the arc
        ctx.beginPath();
        ctx.strokeStyle = '#ffaa00'; // Golden color
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Draw arc from center angle - arcAngle/2 to center angle + arcAngle/2
        const startAngle = this.arcEffect.angle - this.arcEffect.arcAngle / 2;
        const endAngle = this.arcEffect.angle + this.arcEffect.arcAngle / 2;
        
        ctx.arc(this.arcEffect.x, this.arcEffect.y, this.arcEffect.range, startAngle, endAngle);
        ctx.stroke();
        
        // Draw sword effect lines
        for (let i = 0; i < 5; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / 4);
            const innerRadius = this.arcEffect.range * 0.3;
            const outerRadius = this.arcEffect.range;
            
            ctx.beginPath();
            ctx.moveTo(
                this.arcEffect.x + Math.cos(angle) * innerRadius,
                this.arcEffect.y + Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                this.arcEffect.x + Math.cos(angle) * outerRadius,
                this.arcEffect.y + Math.sin(angle) * outerRadius
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
}