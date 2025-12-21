import { Game, ctx } from '../../src/Game.js';
import { Bullet } from '../../src/weapons/Bullet.js';

export class AmmoPack {
    constructor(x, y, weapon) {
        this.x = x;
        this.y = y;
        this.weapon = weapon; // Reference to the Pierce Sniper
        this.size = 12;
        this.collectionRadius = 25;
        this.lifetime = 600; // 10 seconds
        this.age = 0;
        this.collected = false;
        this.pulseOffset = Math.random() * Math.PI * 2; // Random pulse timing
    }
    
    update() {
        this.age++;
        
        // Check if lifetime expired
        if (this.age >= this.lifetime) {
            this.markForRemoval();
            return;
        }
        
        // Check for collection by player
        if (Game.player && !this.collected) {
            const dist = Math.hypot(this.x - Game.player.x, this.y - Game.player.y);
            
            if (dist <= this.collectionRadius) {
                this.collect();
            }
        }
    }
    
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        
        // Restore ammo to Pierce Sniper
        if (this.weapon && this.weapon.type === 'pierceSniper') {
            const ammoToRestore = Math.min(2, this.weapon.maxAmmo - this.weapon.ammo);
            this.weapon.ammo += ammoToRestore;
            console.log(`Ammo pack collected! Restored ${ammoToRestore} ammo`);
        }
        
        // Spawn projectile toward nearest enemy
        this.spawnProjectile();
        
        // Mark for removal
        this.markForRemoval();
    }
    
    spawnProjectile() {
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        if (Game.enemies && Game.enemies.length > 0) {
            for (const enemy of Game.enemies) {
                const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestEnemy = enemy;
                }
            }
        }
        
        if (nearestEnemy) {
            // Calculate direction to enemy
            const dx = nearestEnemy.x - this.x;
            const dy = nearestEnemy.y - this.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance > 0) {
                const speed = 12;
                const vx = (dx / distance) * speed;
                const vy = (dy / distance) * speed;
                
                // Create homing projectile
                const bullet = new Bullet(this.x, this.y, vx, vy);
                bullet.damage = 1;
                bullet.color = '#ffaa00'; // Orange ammo pack projectile
                bullet.radius = 4;
                bullet.weaponType = 'ammoPack';
                bullet.type = 'bullet';
                
                if (!Game.bullets) {
                    Game.bullets = [];
                }
                Game.bullets.push(bullet);
                
                console.log("Ammo pack fired projectile at nearest enemy!");
            }
        }
    }
    
    markForRemoval() {
        this.shouldRemove = true;
    }
    
    draw() {
        if (this.collected) return;
        
        // Pulsing effect
        const pulse = Math.sin(this.age * 0.1 + this.pulseOffset) * 0.3 + 0.7;
        const fadeAlpha = this.age > this.lifetime - 120 ? 
            Math.max(0, (this.lifetime - this.age) / 120) : 1;
        
        ctx.save();
        ctx.globalAlpha = fadeAlpha;
        
        // Main ammo pack body
        ctx.fillStyle = `rgba(0, 170, 255, ${pulse})`;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Ammo pack border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Ammo symbol (cross)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Horizontal line
        ctx.moveTo(this.x - this.size/3, this.y);
        ctx.lineTo(this.x + this.size/3, this.y);
        // Vertical line
        ctx.moveTo(this.x, this.y - this.size/3);
        ctx.lineTo(this.x, this.y + this.size/3);
        ctx.stroke();
        
        // Collection radius indicator (faint)
        if (Game.player) {
            const playerDist = Math.hypot(this.x - Game.player.x, this.y - Game.player.y);
            if (playerDist <= this.collectionRadius * 1.5) {
                ctx.strokeStyle = `rgba(0, 170, 255, 0.2)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.collectionRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}