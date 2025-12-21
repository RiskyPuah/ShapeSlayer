import { Game, ctx } from './Game.js';
import { Gem } from './Gem.js';
import { Powerup } from './Powerup.js';

export class Explosion {
    constructor(x, y, radius, damage) {
        this.x = x;
        this.y = y;
        this.maxRadius = radius;
        this.damage = damage;
        this.currentRadius = 0;
        this.lifetime = 30; // frames
        this.age = 0;
        this.opacity = 1;
        
        // Damage all enemies in range immediately
        this.dealDamage();
    }
    
    dealDamage() {
        // Check all enemies for damage
        for (let i = Game.enemies.length - 1; i >= 0; i--) {
            let enemy = Game.enemies[i];
            const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
            
            if (dist < this.maxRadius) {
                const isDead = enemy.takeDamage(this.damage);
                if (isDead) {
                    Game.enemies.splice(i, 1);
                    Game.gems.push(new Gem(enemy.x, enemy.y, enemy.xpValue));
                    
                    // 10% chance to drop powerup from explosion kills
                    if (Math.random() < 0.1) {
                        Game.powerups.push(new Powerup(enemy.x, enemy.y));
                    }
                    
                    Game.score += 10;
                    document.getElementById('score').innerText = Game.score;
                }
            }
        }
    }
    
    update() {
        this.age++;
        
        // Expand radius over time
        const progress = this.age / this.lifetime;
        this.currentRadius = this.maxRadius * Math.min(progress * 2, 1); // Expand in first half
        
        // Fade out over time
        this.opacity = Math.max(0, 1 - (progress * 1.5));
        
        return this.age >= this.lifetime; // Return true when explosion should be removed
    }
    
    draw() {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Outer explosion ring (white)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Inner explosion ring (orange)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#ff8800';
        ctx.fill();
        
        // Core explosion (yellow)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        
        ctx.restore();
    }
}