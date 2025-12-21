import { BaseWeapon } from '../BaseWeapon.js';
import { Game, ctx } from '../../Game.js';
import { Gem } from '../../Gem.js';
import { Powerup } from '../../Powerup.js';

export class Paladin extends BaseWeapon {
    constructor(owner) {
        super(owner, 'paladin');
        
        // Visual effect properties
        this.arcEffect = null; // Will store arc effect data
    }
    
    initializeWeapon() {
        this.fireRate = 60;     // Medium-slow attack rate
        this.damage = 1.5;        // Base damage
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'arc';
        this.speedModifier = 0.9; // 10% slower (armored)
        this.arcRange = 100;     // Range of the arc attack
        this.arcAngle = Math.PI / 3; // 60-degree arc
        
        // Paladin starts with Holy Shield active!
        this.activateHolyShield();
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
        this.holyShieldMaxCooldown = Math.max(this.holyShieldMaxCooldown * 0.85, 60 * 30); // Reduce by 15%, min 30 seconds
        console.log(`${this.type} Holy Shield cooldown reduced to ${(this.holyShieldMaxCooldown / 60).toFixed(1)} seconds`);
    }
    
    // Override to use arc attack instead of projectiles
    createProjectiles(mouseX, mouseY) {
        this.performArcAttack(mouseX, mouseY);
    }
    
    performArcAttack(mouseX, mouseY) {
        if (!this.owner || !Game.enemies) return;
        
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const targetAngle = Math.atan2(dy, dx);
        
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
                if (this.smiteEnabled && this.holyShieldActive) {
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
                    
                    // 10% chance to drop powerup
                    if (Math.random() < 0.1) {
                        Game.powerups.push(new Powerup(enemy.x, enemy.y));
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