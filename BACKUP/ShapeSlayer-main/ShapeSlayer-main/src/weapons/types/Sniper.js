import { BaseWeapon } from '../BaseWeapon.js';
import { Bullet } from '../Bullet.js';
import { Game } from '../../Game.js';
import { gameConfig } from '../../ConfigManager.js';

export class Sniper extends BaseWeapon {
    constructor(owner) {
        super(owner, 'sniper');
    }
    
    initializeWeapon() {
        // Load stats from JSON configuration
        this.loadStatsFromConfig();
        
        // Sniper doesn't have Holy Shield by default
        this.holyShieldMaxCooldown = 0;
        
        console.log(`✅ Initialized ${this.type} with pierce count: ${this.pierceCount}`);
    }
    
    // Override damage upgrade for snipers
    applyDamageUpgrade() {
        const increaseAmount = this.weaponConfig?.upgrades?.damageIncrease || 0.75;
        this.damage += increaseAmount;
        console.log(`${this.type} damage increased to ${this.damage}`);
    }
    
    // Override fire rate upgrade for sniper-specific behavior
    applyFireRateUpgrade() {
        const decreaseAmount = this.weaponConfig?.upgrades?.fireRateDecrease || 8;
        const minRate = this.weaponConfig?.upgrades?.fireRateMin || 45;
        if (this.fireRate > minRate) {
            this.fireRate -= decreaseAmount;
            console.log(`${this.type} fire rate improved to ${this.fireRate}`);
        }
    }
    
    // Sniper-specific upgrades
    applyPierceCountUpgrade() {
        this.pierceCount += 1; // Increase pierce count
        console.log(`${this.type} pierce count increased to ${this.pierceCount}`);
    }
    
    // Override upgrade system to include Sniper-specific options
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'pierceCount':
                this.applyPierceCountUpgrade();
                break;
            default:
                super.applyUpgrade(upgradeType); // Use base weapon upgrades for others
                break;
        }
    }
    
    // Override bullet creation for piercing bullets
    createProjectiles(mouseX, mouseY) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const angle = Math.atan2(dy, dx);
        
        // Calculate velocity components (faster than normal bullets)
        const bulletSpeed = this.bulletSpeed || gameConfig.getProjectileConfig(this.projectileType)?.baseSpeed || 20;
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;
        
        // Create piercing bullet
        const bullet = new Bullet(this.owner.x, this.owner.y, vx, vy);
        
        // Set bullet properties
        bullet.radius = (this.bulletRadius || gameConfig.getProjectileConfig(this.projectileType)?.baseRadius || 2) + this.sizeUpgrades;
        bullet.color = this.getBulletColor();
        bullet.damage = this.damage;
        bullet.type = 'piercing';
        bullet.weaponType = this.type; // Set weapon type for decay system
        bullet.pierceCount = this.pierceCount;
        bullet.enemiesHit = []; // Track which enemies this bullet has already hit
        
        Game.bullets.push(bullet);
    }
}