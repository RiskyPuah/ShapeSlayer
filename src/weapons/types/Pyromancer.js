import { BaseWeapon } from '../BaseWeapon.js';
import { Game, ctx } from '../../Game.js';
import { Gem } from '../../Gem.js';
import { Powerup } from '../../Powerup.js';

export class Pyromancer extends BaseWeapon {
    constructor(owner) {
        super(owner, 'pyromancer');
    }
    
    initializeWeapon() {
        this.fireRate = 15;       // Fast fire rate for continuous flame
        this.damage = 0.1;        // Low direct damage
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'flame';
        this.speedModifier = 0.8; // Slightly slower movement
        
        // Flame arc properties
        this.flameRange = 200;    // Long range for flamethrower
        this.flameAngle = Math.PI / 4; // 45-degree arc
        this.flameBurnDamage = 0.2; // DOT damage per tick
        this.flameBurnDuration = 180; // 3 seconds at 60fps
        
        // Visual effect properties
        this.flameEffect = null;
        
        console.log(`✅ Initialized Pyromancer - arc flamethrower with burn DOT`);
    }
    
    // Override damage upgrade
    applyDamageUpgrade() {
        this.damage += 0.2; // Increase direct flame damage
        this.flameBurnDamage += 0.1; // Increase burn DOT
        console.log(`${this.type} flame damage increased to ${this.damage}, burn DOT: ${this.flameBurnDamage}`);
    }
    
    // Pyromancer specific upgrades
    applyFlameRangeUpgrade() {
        this.flameRange += 20;
        console.log(`${this.type} flame range increased to ${this.flameRange}`);
    }
    
    applyFlameAngleUpgrade() {
        this.flameAngle = Math.min(this.flameAngle + Math.PI / 8, Math.PI / 2); // Max 90 degrees
        console.log(`${this.type} flame arc increased to ${(this.flameAngle * 180 / Math.PI).toFixed(0)} degrees`);
    }
    
    applyBurnDurationUpgrade() {
        this.flameBurnDuration += 60; // Add 1 second
        console.log(`${this.type} burn duration increased to ${this.flameBurnDuration / 60} seconds`);
    }
    
    // Override upgrade system to include Pyromancer options
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'flameRange':
                this.applyFlameRangeUpgrade();
                break;
            case 'flameAngle':
                this.applyFlameAngleUpgrade();
                break;
            case 'burnDuration':
                this.applyBurnDurationUpgrade();
                break;
            default:
                super.applyUpgrade(upgradeType); // Use base weapon upgrades
                break;
        }
    }
    
    // Override to use flame arc instead of projectiles
    createProjectiles(mouseX, mouseY) {
        this.performFlameArc(mouseX, mouseY);
    }
    
    performFlameArc(mouseX, mouseY) {
        if (!this.owner || !Game.enemies) return;
        
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const targetAngle = Math.atan2(dy, dx);
        
        // Create visual flame effect
        this.flameEffect = {
            x: this.owner.x,
            y: this.owner.y,
            angle: targetAngle,
            arcAngle: this.flameAngle,
            range: this.flameRange,
            duration: 8, // frames
            age: 0,
            opacity: 1.0
        };
        
        const enemiesHit = [];
        
        Game.enemies.forEach(enemy => {
            if (!enemy) return;
            
            // Check if enemy is in range
            const distToEnemy = Math.hypot(enemy.x - this.owner.x, enemy.y - this.owner.y);
            if (distToEnemy > this.flameRange) return;
            
            // Check if enemy is in the flame arc
            const angleToEnemy = Math.atan2(enemy.y - this.owner.y, enemy.x - this.owner.x);
            let angleDiff = angleToEnemy - targetAngle;
            
            // Normalize angle difference to [-π, π]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            if (Math.abs(angleDiff) <= this.flameAngle / 2) {
                // Enemy is in the flame arc!
                
                // Apply direct flame damage
                const isDead = enemy.takeDamage(this.damage, 'fire');
                
                // Apply burn effect
                enemy.isBurning = true;
                enemy.burnDamage = this.flameBurnDamage;
                enemy.burnDuration = this.flameBurnDuration;
                enemy.burnTimer = this.flameBurnDuration;
                
                enemiesHit.push({enemy, damage: this.damage});
                
                if (isDead) {
                    // Remove enemy and drop rewards
                    const index = Game.enemies.indexOf(enemy);
                    if (index > -1) {
                        Game.enemies.splice(index, 1);
                        Game.gems.push(new Gem(enemy.x, enemy.y, enemy.xpValue));
                        
                        // 10% chance to drop powerup
                        if (Math.random() < 0.1) {
                            Game.powerups.push(new Powerup(enemy.x, enemy.y));
                            console.log("Powerup dropped from flame kill!");
                        }
                        
                        Game.score += 10;
                        document.getElementById('score').innerText = Game.score;
                    }
                }
            }
        });
        
        // No projectiles to add since this is an instant arc effect
        console.log(`🔥 Pyromancer hit ${enemiesHit.length} enemies with flame arc`);
    }
    
    getBulletColor() {
        return '#ff4400'; // Orange-red for flames
    }
    
    // Draw flame arc effect
    drawArcEffect() {
        if (!this.flameEffect) return;
        
        const effect = this.flameEffect;
        
        ctx.save();
        ctx.globalAlpha = effect.opacity * (1 - effect.age / effect.duration);
        
        // Create flame gradient
        const gradient = ctx.createRadialGradient(
            effect.x, effect.y, 0,
            effect.x, effect.y, effect.range
        );
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)'); // Bright orange center
        gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.4)'); // Red middle
        gradient.addColorStop(1, 'rgba(100, 0, 0, 0.1)'); // Dark red edge
        
        // Draw flame arc
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.arc(effect.x, effect.y, effect.range,
               effect.angle - effect.arcAngle/2, effect.angle + effect.arcAngle/2);
        ctx.closePath();
        ctx.fill();
        
        // Add flickering particles
        for (let i = 0; i < 8; i++) {
            const particleAngle = effect.angle + (Math.random() - 0.5) * effect.arcAngle;
            const particleRange = Math.random() * effect.range;
            const particleX = effect.x + Math.cos(particleAngle) * particleRange;
            const particleY = effect.y + Math.sin(particleAngle) * particleRange;
            
            ctx.fillStyle = `rgba(255, ${50 + Math.random() * 100}, 0, ${Math.random() * 0.8})`;
            ctx.beginPath();
            ctx.arc(particleX, particleY, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Update effect
        effect.age++;
        if (effect.age >= effect.duration) {
            this.flameEffect = null;
        }
    }
}