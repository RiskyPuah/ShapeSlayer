import { BaseWeapon } from '../BaseWeapon.js';
import { Game, ctx } from '../../engine/Game.js';

export class ToxicSpray extends BaseWeapon {
    constructor(owner) {
        super(owner, 'toxicSpray');
    }
    
    initializeWeapon() {
        // Load stats from config or set defaults
        this.loadStatsFromConfig();
        
        // Ammo system (if not set by config, use defaults)
        this.maxAmmo = this.maxAmmo || 3;
        this.ammo = this.maxAmmo;
        this.reloadTime = this.reloadTime || 90;
        this.isReloading = false;
        this.reloadStartFrame = 0;
        
        // Toxic spray properties (loaded from config, fallbacks only)
        this.spraySpeed = this.spraySpeed || 8;
        this.sprayRadius = this.sprayRadius || 12;
        this.poisonDuration = this.poisonDuration || 180;
        
        console.log(`✅ Toxic Spray initialized - ${this.maxAmmo} ammo, ${this.reloadTime/60}s reload`);
    }
    
    // Check if weapon can fire
    canFire() {
        if (this.isReloading) return false;
        if (this.ammo <= 0) return false;
        if (Game.frameCount - this.lastShot <= this.fireRate) return false;
        return true;
    }
    
    // Override shoot to consume ammo
    shoot(mouseX, mouseY) {
        if (!this.canFire()) return;
        
        // Consume ammo
        this.ammo--;
        this.updateAmmoDisplay();
        
        // Fire projectiles
        this.createProjectiles(mouseX, mouseY);
        this.lastShot = Game.frameCount;
        
        // Start reload if out of ammo
        if (this.ammo <= 0) {
            this.startReload();
        }
    }
    
    // Start reload process
    startReload() {
        if (this.isReloading || this.ammo === this.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadStartFrame = Game.frameCount;
        console.log(`💨 Toxic Spray reloading... (${this.reloadTime/60}s)`);
    }
    
    // Manual reload (R key)
    reload() {
        if (!this.isReloading && this.ammo < this.maxAmmo) {
            this.startReload();
        }
    }
    
    // Cancel reload (when picking up ammo)
    cancelReload() {
        if (this.isReloading) {
            this.isReloading = false;
            console.log('🚫 Reload cancelled');
        }
    }
    
    // Update weapon state
    update() {
        // Handle reload
        if (this.isReloading) {
            const reloadProgress = Game.frameCount - this.reloadStartFrame;
            if (reloadProgress >= this.reloadTime) {
                // Reload complete
                this.ammo = this.maxAmmo;
                this.isReloading = false;
                this.updateAmmoDisplay();
                console.log('✅ Toxic Spray reloaded!');
            }
        }
        
        // Call parent update for shooting
        super.update();
    }
    
    // Create 3 sequential toxic spray waves (EMZ-style)
    createProjectiles(mouseX, mouseY) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const baseAngle = Math.atan2(dy, dx);
        
        // Fire 3 waves with delays (EMZ-style sequential spray)
        for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
            setTimeout(() => {
                // Each wave fires 3 projectiles in a spread (gas cloud effect)
                for (let i = 0; i < 3; i++) {
                    const angleOffset = (i - 1) * 0.2; // Spread: -0.2, 0, 0.2 radians
                    const angle = baseAngle + angleOffset;
                    
                    const vx = Math.cos(angle) * this.spraySpeed;
                    const vy = Math.sin(angle) * this.spraySpeed;
                    
                    // Create wide toxic cloud
                    const bullet = {
                        x: this.owner.x,
                        y: this.owner.y,
                        vx: vx,
                        vy: vy,
                        radius: 14, // Medium-sized clouds
                        color: '#88ff44', // Toxic green
                        damage: this.damage,
                        type: 'poison',
                        weaponType: this.type,
                        age: 0,
                        maxAge: 35 + (waveIndex * 5), // Each wave lasts slightly longer
                        pierceCount: 5, // Limited pierce - not infinite
                        isToxicSpray: true,
                        poisonDuration: this.poisonDuration,
                        waveIndex: waveIndex,
                        
                        // Update toxic cloud
                        update: function() {
                            this.x += this.vx;
                            this.y += this.vy;
                            this.age++;
                            
                            // Slow down over time (spray dissipates)
                            this.vx *= 0.98;
                            this.vy *= 0.98;
                            
                            // Expand slightly as it travels (like real spray)
                            this.radius += 0.12;
                            
                            // Mark as expired when maxAge reached
                            if (this.age >= this.maxAge) {
                                this.isExpired = true;
                            }
                        },
                        
                        // Draw toxic cloud with pulsing effect
                        draw: function() {
                            ctx.save();
                            
                            // Pulsing opacity based on age
                            const agePct = this.age / this.maxAge;
                            const pulseOpacity = 0.7 + Math.sin(this.age * 0.15) * 0.2;
                            ctx.globalAlpha = pulseOpacity * (1 - agePct * 0.4);
                            
                            // Draw toxic cloud
                            const gradient = ctx.createRadialGradient(
                                this.x, this.y, 0,
                                this.x, this.y, this.radius
                            );
                            gradient.addColorStop(0, '#88ff44');
                            gradient.addColorStop(0.5, '#66dd22');
                            gradient.addColorStop(1, 'rgba(102, 221, 34, 0)');
                            
                            ctx.fillStyle = gradient;
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                            ctx.fill();
                            
                            ctx.restore();
                        }
                    };
                    
                    Game.bullets.push(bullet);
                }
            }, waveIndex * 100); // 100ms delay between each wave
        }
        
        console.log(`💨 Toxic Spray fired 3 gas waves (${this.ammo} ammo left)`);
    }
    
    // Update ammo display (now handled by canvas rendering)
    updateAmmoDisplay() {
        // No-op - ammo is now drawn on canvas above character
    }
    
    // Draw ammo bars and reload indicator above character (Brawl Stars style)
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
                // Full ammo bar
                ctx.fillStyle = '#88ff44';
                ctx.fillRect(barX, y, barWidth, barHeight);
            } else if (i === this.ammo && this.isReloading) {
                // Reloading bar
                const progress = (Game.frameCount - this.reloadStartFrame) / this.reloadTime;
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
    
    getBulletColor() {
        return '#88ff44'; // Toxic green
    }
}
