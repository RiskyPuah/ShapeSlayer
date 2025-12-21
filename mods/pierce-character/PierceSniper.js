import { BaseWeapon } from '../../src/weapons/BaseWeapon.js';
import { Game } from '../../src/Game.js';
import { Bullet } from '../../src/weapons/Bullet.js';
import { AmmoPack } from './AmmoPack.js';

export class PierceSniper extends BaseWeapon {
    constructor(owner) {
        super(owner, 'pierceSniper');
        this.ammo = 4;
        this.maxAmmo = 4;
        this.isReloading = false;
        this.reloadTime = 120; // 2 seconds at 60fps
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
        return super.canFire() && this.ammo > 0 && !this.isReloading;
    }
    
    // Override fire to consume ammo
    fire(mouseX, mouseY) {
        if (!this.canFire()) return;
        
        // Fire the weapon
        super.fire(mouseX, mouseY);
        
        // Consume ammo
        this.ammo--;
        console.log(`Pierce Sniper fired! Ammo: ${this.ammo}/${this.maxAmmo}`);
        
        // Auto-reload when out of ammo
        if (this.ammo <= 0) {
            this.startReload();
        }
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
    
    // Complete reload and drop ammo pack
    completeReload() {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
        this.reloadTimer = 0;
        
        // Drop ammo pack at player position
        this.dropAmmoPack();
        
        console.log("Pierce Sniper reload complete!");
    }
    
    // Drop ammo pack that restores ammo and spawns projectile
    dropAmmoPack() {
        if (!Game.ammoPacks) {
            Game.ammoPacks = [];
        }
        
        // Create ammo pack slightly behind the player
        const angle = Math.atan2(Game.mouseY - this.owner.y, Game.mouseX - this.owner.x);
        const dropX = this.owner.x - Math.cos(angle) * 30;
        const dropY = this.owner.y - Math.sin(angle) * 30;
        
        const ammoPack = new AmmoPack(dropX, dropY, this);
        Game.ammoPacks.push(ammoPack);
        
        console.log("Ammo pack dropped!");
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
            
            Game.bullets.push(bullet);
        }
    }
}