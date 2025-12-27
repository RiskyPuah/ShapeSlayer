import { BaseWeapon } from '../../src/weapons/BaseWeapon.js';
import { Game } from '../../src/engine/Game.js';
import { Bullet } from '../../src/weapons/Bullet.js';
import { AmmoPack } from './AmmoPack.js';

export class PierceSniper extends BaseWeapon {
    constructor(owner) {
        super(owner, 'pierceSniper');
        this.ammo = 4;
        this.maxAmmo = 4;
        this.isReloading = false;
        this.reloadTime = 300; // 5 seconds at 60fps
        this.reloadTimer = 0;
    }
    
    initializeWeapon() {
        this.fireRate = 80;        // Slow but powerful
        this.damage = 4;           // High damage to compensate for limited ammo
        this.projectileCount = 1;  // Single shot
        this.spread = 0;           // Perfect accuracy
        this.speedModifier = 0.9;  // Slightly slower when aiming
        this.projectileType = 'bullet';
        this.range = 99999;        // Sniper range
        
        console.log(`✅ Initialized Pierce Sniper - Limited ammo tactical weapon`);
    }
    
    // Override canFire to check ammo
    canFire() {
        // Check fire rate cooldown and ammo
        return (Game.frameCount - this.lastShot > this.fireRate) && this.ammo > 0 && !this.isReloading;
    }
    
    // Override shoot to consume ammo
    shoot(mouseX, mouseY) {
        if (!this.canFire()) return;
        
        // Fire the weapon using BaseWeapon's shoot
        this.createProjectiles(mouseX, mouseY);
        this.lastShot = Game.frameCount;
        
        // Consume ammo
        this.ammo--;
        console.log(`Pierce Sniper fired! Ammo: ${this.ammo}/${this.maxAmmo}`);
        
        // Update ammo display
        this.updateAmmoDisplay();
        
        // Auto-reload when out of ammo
        if (this.ammo <= 0) {
            this.startReload();
        }
    }
    
    // Update ammo display (now handled by canvas rendering)
    updateAmmoDisplay() {
        // No-op - ammo is now drawn on canvas above character
    }
    
    // Start reload process
    startReload() {
        if (this.isReloading || this.ammo === this.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadTimer = this.reloadTime;
        console.log("Pierce Sniper reloading...");
    }
    
    // Update reload progress
    update() {
        super.update();
        
        if (this.isReloading) {
            this.reloadTimer--;
            
            if (this.reloadTimer <= 0) {
                this.completeReload();
            }
        }
    }
    
    // Complete reload - no ammo pack drop, just reload
    completeReload() {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
        this.reloadTimer = 0;
        this.updateAmmoDisplay();
        
        console.log("✅ Pierce Sniper reload complete!");
    }
    
    // Manual reload (for player control)
    reload() {
        if (this.ammo < this.maxAmmo && !this.isReloading) {
            this.startReload();
        }
    }
    
    // Override damage upgrades to account for limited ammo
    applyDamageUpgrade() {
        this.damage += 1.5; // Higher damage increase for Pierce
        console.log(`${this.type} damage increased to ${this.damage}`);
    }
    
    // Pierce-specific upgrades
    applyAmmoUpgrade() {
        this.maxAmmo += 1;
        this.ammo = Math.min(this.ammo + 1, this.maxAmmo); // Add one ammo immediately
        console.log(`${this.type} max ammo increased to ${this.maxAmmo}`);
    }
    
    applyReloadSpeedUpgrade() {
        this.reloadTime = Math.max(this.reloadTime - 20, 40); // Minimum 40 frames (0.67s)
        console.log(`${this.type} reload speed improved to ${(this.reloadTime/60).toFixed(1)}s`);
    }
    
    applyAmmoPackUpgrade() {
        // Future: Enhance ammo pack effects
        console.log(`${this.type} ammo pack effectiveness increased`);
    }
    
    // Override upgrade system
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'ammo':
                this.applyAmmoUpgrade();
                break;
            case 'reloadSpeed':
                this.applyReloadSpeedUpgrade();
                break;
            case 'ammoPackBonus':
                this.applyAmmoPackUpgrade();
                break;
            default:
                super.applyUpgrade(upgradeType);
                break;
        }
    }
    
    // Get ammo display info
    getAmmoInfo() {
        return {
            current: this.ammo,
            max: this.maxAmmo,
            isReloading: this.isReloading,
            reloadProgress: this.isReloading ? (this.reloadTime - this.reloadTimer) / this.reloadTime : 0
        };
    }
    
    // Custom projectile creation for high damage
    createProjectiles(mouseX, mouseY) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 0) {
            const vx = (dx / distance) * 15; // Fast bullet
            const vy = (dy / distance) * 15;
            
            const bullet = new Bullet(this.owner.x, this.owner.y, vx, vy);
            bullet.damage = this.damage;
            bullet.color = '#00aaff'; // Pierce color
            bullet.radius = 6; // Slightly larger bullet
            bullet.weaponType = this.type;
            bullet.type = 'bullet';
            bullet.pierceSniper = true; // Mark as Pierce Sniper bullet
            bullet.pierceSniperWeapon = this; // Reference to weapon for ammo pack drop
            
            Game.bullets.push(bullet);
        }
    }
    
    // Drop ammo pack at specific position
    dropAmmoPackAt(x, y) {
        if (!Game.ammoPacks) {
            Game.ammoPacks = [];
        }
        
        const ammoPack = new AmmoPack(x, y, this);
        Game.ammoPacks.push(ammoPack);
        
        console.log("📦 Ammo pack dropped behind player!");
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
                // Full ammo bar (Pierce blue)
                ctx.fillStyle = '#00aaff';
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
}