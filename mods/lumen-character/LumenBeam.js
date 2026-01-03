import { BaseWeapon } from '../../src/weapons/BaseWeapon.js';
import { Game } from '../../src/engine/Game.js';
import { Bullet } from '../../src/weapons/Bullet.js';

export class LumenBeam extends BaseWeapon {
    constructor(owner) {
        super(owner, 'lumenBeam');
        this.ammo = 3;
        this.maxAmmo = 3;
        this.isReloading = false;
        this.reloadTime = 120; // 2 seconds at 60fps (medium reload)
        this.reloadTimer = 0;
        
        // Beam system
        this.activeBeams = []; // Max 3 beams
        this.maxBeams = 3;
        this.beamDamage = 0.07; // Damage per tick
        this.beamTickRate = 6; // 0.1 seconds at 60fps
        this.beamColor = '#0004ffff'; // Blue light
        this.beamWidth = 5;
    }
    
    initializeWeapon() {
        this.fireRate = 50;        // Medium fire rate
        this.damage = 0.3;         // Projectile impact damage
        this.projectileCount = 1;  
        this.spread = 0;           
        this.speedModifier = 0.95; 
        this.projectileType = 'bullet';
        this.projectileSpeed = 10; // Semi-fast
        
        console.log(`✅ Initialized Lumen Beam - Light tether weapon`);
    }
    
    // Override canFire to check ammo
    canFire() {
        return (Game.frameCount - this.lastShot > this.fireRate) && this.ammo > 0 && !this.isReloading;
    }
    
    // Override shoot to consume ammo
    shoot(mouseX, mouseY) {
        if (!this.canFire()) return;
        
        this.createProjectiles(mouseX, mouseY);
        this.lastShot = Game.frameCount;
        
        // Consume ammo
        this.ammo--;
        console.log(`Lumen Beam fired! Ammo: ${this.ammo}/${this.maxAmmo}`);
        
        this.updateAmmoDisplay();
        
        // Auto-reload when out of ammo
        if (this.ammo <= 0) {
            this.startReload();
        }
    }
    
    // Update ammo display (handled by canvas)
    updateAmmoDisplay() {
        // No-op - ammo is drawn on canvas above character
    }
    
    // Start reload process
    startReload() {
        if (this.isReloading || this.ammo === this.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadTimer = this.reloadTime;
        console.log("Lumen Beam reloading...");
    }
    
    // Update weapon and beams
    update() {
        super.update();
        
        // Handle reload
        if (this.isReloading) {
            this.reloadTimer--;
            
            if (this.reloadTimer <= 0) {
                this.completeReload();
            }
        }
        
        // Update active beams
        this.updateBeams();
    }
    
    // Complete reload
    completeReload() {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
        this.reloadTimer = 0;
        this.updateAmmoDisplay();
        
        console.log("✅ Lumen Beam reload complete!");
    }
    
    // Manual reload
    reload() {
        if (this.ammo < this.maxAmmo && !this.isReloading) {
            this.startReload();
        }
    }
    
    // Create projectile that will create beam on hit
    createProjectiles(mouseX, mouseY) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 0) {
            const vx = (dx / distance) * this.projectileSpeed;
            const vy = (dy / distance) * this.projectileSpeed;
            
            const bullet = new Bullet(this.owner.x, this.owner.y, vx, vy);
            bullet.damage = this.damage;
            bullet.color = this.beamColor;
            bullet.radius = 5;
            bullet.weaponType = this.type;
            bullet.type = 'lumenBeam'; // Special type for beam creation
            bullet.lumenWeapon = this; // Reference to weapon
            
            Game.bullets.push(bullet);
        }
    }
    
    // Create beam tether to enemy
    createBeam(enemy) {
        // Remove oldest beam if at max capacity
        if (this.activeBeams.length >= this.maxBeams) {
            const oldestBeam = this.activeBeams.shift();
            console.log(`💡 Removed oldest beam, attaching to new enemy`);
        }
        
        // Create new beam
        const beam = {
            target: enemy,
            createdFrame: Game.frameCount,
            lastTickFrame: Game.frameCount,
            totalDamage: 0
        };
        
        this.activeBeams.push(beam);
        console.log(`💡 Beam attached! Active beams: ${this.activeBeams.length}/${this.maxBeams}`);
    }
    
    // Smart targeting: Filter out enemies that already have beams
    getEnemyFilter() {
        return (enemy) => {
            // Check if this enemy already has a beam
            const hasBeam = this.activeBeams.some(beam => beam.target === enemy);
            return !hasBeam; // Only target enemies without beams
        };
    }
    
    // Check if an enemy has a beam attached
    hasBeamOnEnemy(enemy) {
        return this.activeBeams.some(beam => beam.target === enemy);
    }
    
    // Update all active beams
    updateBeams() {
        for (let i = this.activeBeams.length - 1; i >= 0; i--) {
            const beam = this.activeBeams[i];
            
            // Check if target is still in the game
            if (!Game.enemies.includes(beam.target)) {
                this.activeBeams.splice(i, 1);
                console.log(`💡 Beam disconnected. Active beams: ${this.activeBeams.length}`);
                continue;
            }
            
            // Check if target is already dead (health <= 0)
            if (beam.target.health <= 0) {
                // Manually remove dead enemy
                const enemyIndex = Game.enemies.indexOf(beam.target);
                if (enemyIndex !== -1) {
                    this.removeDeadEnemy(beam.target, enemyIndex);
                }
                this.activeBeams.splice(i, 1);
                console.log(`💡 Beam killed enemy! Active beams: ${this.activeBeams.length}`);
                continue;
            }
            
            // Apply damage tick
            if (Game.frameCount - beam.lastTickFrame >= this.beamTickRate) {
                const isDead = beam.target.takeDamage(this.beamDamage, 'normal');
                beam.lastTickFrame = Game.frameCount;
                beam.totalDamage += this.beamDamage;
                
                // If enemy just died, remove it
                if (isDead) {
                    const enemyIndex = Game.enemies.indexOf(beam.target);
                    if (enemyIndex !== -1) {
                        this.removeDeadEnemy(beam.target, enemyIndex);
                    }
                    this.activeBeams.splice(i, 1);
                    console.log(`💡 Beam killed enemy! Active beams: ${this.activeBeams.length}`);
                }
            }
        }
    }
    
    // Remove dead enemy and spawn rewards
    removeDeadEnemy(enemy, index) {
        Game.enemies.splice(index, 1);
        
        // Spawn XP gem
        if (window.Gem) {
            Game.gems.push(new window.Gem(enemy.x, enemy.y, enemy.xpValue || 1));
        }
        
        // Update score
        Game.score += 10;
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.innerText = Game.score;
        }
    }
    
    // Draw ammo bars and beams
    drawReloadIndicator(ctx) {
        if (!this.owner) return;
        
        const x = this.owner.x;
        const y = this.owner.y - 40;
        const barWidth = 8;
        const barHeight = 12;
        const barSpacing = 3;
        const totalWidth = (barWidth * this.maxAmmo) + (barSpacing * (this.maxAmmo - 1));
        const startX = x - totalWidth / 2;
        
        ctx.save();
        
        // Draw ammo bars
        for (let i = 0; i < this.maxAmmo; i++) {
            const barX = startX + (i * (barWidth + barSpacing));
            
            // Background bar
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(barX, y, barWidth, barHeight);
            
            if (i < this.ammo) {
                // Full ammo bar (yellow)
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(barX, y, barWidth, barHeight);
            } else if (i === this.ammo && this.isReloading) {
                // Reloading bar
                const progress = (this.reloadTime - this.reloadTimer) / this.reloadTime;
                ctx.fillStyle = '#ffaa44';
                ctx.fillRect(barX, y + barHeight * (1 - progress), barWidth, barHeight * progress);
            }
            
            // Bar outline
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, y, barWidth, barHeight);
        }
        
        ctx.restore();
    }
    
    // Draw beams
    drawBeams(ctx) {
        if (!this.owner) return;
        
        ctx.save();
        
        for (const beam of this.activeBeams) {
            if (!beam.target || !Game.enemies.includes(beam.target)) continue;
            
            // Calculate beam animation
            const age = Game.frameCount - beam.createdFrame;
            const pulse = Math.sin(age * 0.15) * 0.3 + 0.7;
            
            // Draw beam line
            ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
            ctx.lineWidth = this.beamWidth;
            ctx.beginPath();
            ctx.moveTo(this.owner.x, this.owner.y);
            ctx.lineTo(beam.target.x, beam.target.y);
            ctx.stroke();
            
            // Draw glow effect
            ctx.strokeStyle = `rgba(255, 255, 100, ${pulse * 0.4})`;
            ctx.lineWidth = this.beamWidth + 4;
            ctx.beginPath();
            ctx.moveTo(this.owner.x, this.owner.y);
            ctx.lineTo(beam.target.x, beam.target.y);
            ctx.stroke();
            
            // Draw connection point on enemy
            ctx.fillStyle = `rgba(255, 255, 0, ${pulse})`;
            ctx.beginPath();
            ctx.arc(beam.target.x, beam.target.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    getBulletColor() {
        return this.beamColor;
    }
}
