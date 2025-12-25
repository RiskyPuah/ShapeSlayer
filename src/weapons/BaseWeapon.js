import { Game } from '../engine/Game.js';
import { Bullet } from './Bullet.js';
import { gameConfig } from '../characters/ConfigManager.js';

export class BaseWeapon {
    constructor(owner, type) {
        this.owner = owner;
        this.type = type;
        this.level = 1;
        this.lastShot = 0;
        
        // Load weapon configuration from JSON
        this.weaponConfig = gameConfig.getWeapon(type);
        if (!this.weaponConfig) {
            console.warn(`No configuration found for weapon type: ${type}`);
            this.weaponConfig = { stats: {}, upgrades: {}, visuals: {} };
        }
        
        // Initialize default stats that will be set by subclasses or config
        this.fireRate = 40;
        this.damage = 1;
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'bullet';
        this.speedModifier = 1.0;
        
        // Upgrade tracking - shared by all weapons
        this.upgradePoints = 0;
        this.nextUpgradeAt = gameConfig.getGameSetting('gameplay.levelProgression.weaponUpgradeInterval') || 2;
        this.sizeUpgrades = 0; // Track projectile size upgrades
        
        // Holy Shield properties (shared by all weapons)
        this.holyShieldActive = false;
        this.holyShieldCooldown = 0;
        this.holyShieldMaxCooldown = gameConfig.getGameSetting('gameplay.combat.holyShieldBaseCooldown') || 7200;
        this.invincibilityFrames = 0;
        this.maxInvincibilityFrames = gameConfig.getGameSetting('gameplay.combat.invincibilityFrames') || 60;
        
        // Universal upgrade properties
        this.xpMultiplier = gameConfig.getGameSetting('gameplay.combat.baseXpMultiplier') || 1.0;
        this.gemAbsorptionRange = gameConfig.getGameSetting('gameplay.combat.baseGemAbsorptionRange') || 100;
        
        // Call subclass initialization
        this.initializeWeapon();
    }
    
    // Override this in subclasses to set weapon-specific stats
    initializeWeapon() {
        // Default implementation - subclasses should override
        // Load stats from configuration
        this.loadStatsFromConfig();
    }
    
    // Load weapon stats from JSON configuration
    loadStatsFromConfig() {
        if (!this.weaponConfig || !this.weaponConfig.stats) {
            console.warn(`No stats configuration found for weapon: ${this.type}`);
            return;
        }
        
        const stats = this.weaponConfig.stats;
        
        // Load basic stats
        this.fireRate = stats.fireRate || this.fireRate;
        this.damage = stats.damage || this.damage;
        this.projectileCount = stats.projectileCount || this.projectileCount;
        this.spread = stats.spread || this.spread;
        this.speedModifier = stats.speedModifier || this.speedModifier;
        this.projectileType = stats.projectileType || this.projectileType;
        this.holyShieldMaxCooldown = stats.holyShieldMaxCooldown !== undefined ? stats.holyShieldMaxCooldown : this.holyShieldMaxCooldown;
        
        // Load weapon-specific stats
        if (stats.arcRange !== undefined) this.arcRange = stats.arcRange;
        if (stats.arcAngle !== undefined) this.arcAngle = stats.arcAngle;
        if (stats.pierceCount !== undefined) this.pierceCount = stats.pierceCount;
        if (stats.explosionRadius !== undefined) this.explosionRadius = stats.explosionRadius;
        if (stats.bulletSpeed !== undefined) this.bulletSpeed = stats.bulletSpeed;
        if (stats.bulletRadius !== undefined) this.bulletRadius = stats.bulletRadius;
        if (stats.smiteEnabled !== undefined) this.smiteEnabled = stats.smiteEnabled;
        if (stats.smiteDamage !== undefined) this.smiteDamage = stats.smiteDamage;
        
        console.log(`✅ Loaded ${this.type} configuration:`, stats);
    }
    
    upgrade() {
        this.level++;
        this.upgradePoints++;
        
        // Check if weapon upgrade is available
        if (this.upgradePoints >= this.nextUpgradeAt) {
            this.upgradePoints = 0;
            this.nextUpgradeAt = Math.floor(Math.random() * 2) + 2; // 2-3 levels
            return true; // Upgrade available
        }
        
        console.log(`${this.type} Level:`, this.level, `- Next weapon upgrade in ${this.nextUpgradeAt - this.upgradePoints} levels`);
        return false;
    }
    
    // Base upgrade system - can be overridden by subclasses for special behavior
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'damage':
                this.applyDamageUpgrade();
                break;
            case 'fireRate':
                this.applyFireRateUpgrade();
                break;
            case 'projectileCount':
                this.projectileCount++;
                console.log(`${this.type} projectile count increased to ${this.projectileCount}`);
                break;
            case 'accuracy':
                this.applyAccuracyUpgrade();
                break;
            case 'size':
                this.sizeUpgrades++;
                console.log(`${this.type} projectile size increased!`);
                break;
            case 'xpGain':
                this.applyXpGainUpgrade();
                break;
            case 'gemRange':
                this.applyGemRangeUpgrade();
                break;
            case 'holyShieldCooldown':
                this.applyHolyShieldCooldownUpgrade();
                break;
        }
    }
    
    // Default damage upgrade - can be overridden
    applyDamageUpgrade() {
        const increaseAmount = this.weaponConfig?.upgrades?.damageIncrease || 0.5;
        this.damage += increaseAmount;
        console.log(`${this.type} damage increased to ${this.damage}`);
    }
    
    // Default fire rate upgrade - can be overridden
    applyFireRateUpgrade() {
        const decreaseAmount = this.weaponConfig?.upgrades?.fireRateDecrease || 3;
        const minRate = this.weaponConfig?.upgrades?.fireRateMin || 15;
        if (this.fireRate > minRate) {
            this.fireRate -= decreaseAmount;
            console.log(`${this.type} fire rate improved to ${this.fireRate}`);
        }
    }
    
    // Default accuracy upgrade
    applyAccuracyUpgrade() {
        if (this.spread > 0) {
            this.spread = Math.max(0, this.spread - 0.1);
            console.log(`${this.type} accuracy improved, spread: ${this.spread}`);
        }
    }
    
    // Universal upgrades
    applyXpGainUpgrade() {
        this.xpMultiplier += 0.25; // 25% more XP
        console.log(`${this.type} XP gain increased! Multiplier: ${this.xpMultiplier}x`);
    }
    
    applyGemRangeUpgrade() {
        this.gemAbsorptionRange += 30; // Increase gem collection range
        console.log(`${this.type} gem absorption range increased to ${this.gemAbsorptionRange}`);
    }
    
    applyHolyShieldCooldownUpgrade() {
        if (this.holyShieldMaxCooldown > 0) {
            this.holyShieldMaxCooldown = Math.max(this.holyShieldMaxCooldown * 0.8, 60 * 20); // Reduce by 20%, min 20 seconds
            console.log(`${this.type} Holy Shield cooldown reduced to ${(this.holyShieldMaxCooldown / 60).toFixed(1)} seconds`);
        } else {
            console.log(`${this.type} doesn't have a Holy Shield to upgrade!`);
        }
    }
    
    activateHolyShield() {
        this.holyShieldActive = true;
        this.holyShieldCooldown = this.holyShieldMaxCooldown;
        console.log("Holy Shield activated! Next attack will be blocked.");
        
        // Visual effect - make player glow
        if (this.owner) {
            this.owner.color = '#ffdd00'; // Gold glow
            setTimeout(() => {
                if (this.owner) this.owner.color = '#00ccff'; // Back to normal
            }, 200);
        }
    }
    
    updateHolyShield() {
        if (this.holyShieldCooldown > 0) {
            this.holyShieldCooldown--;
        }
        
        // Update invincibility frames
        if (this.invincibilityFrames > 0) {
            this.invincibilityFrames--;
        }
        
        // Update UI
        this.updateHolyShieldUI();
    }
    
    updateHolyShieldUI() {
        const holyShieldBar = document.getElementById('holy-shield-bar');
        const holyShieldStatus = document.getElementById('holy-shield-status');
        
        if (this.holyShieldMaxCooldown <= 0) {
            // Hide UI for weapons without Holy Shield
            if (holyShieldBar) holyShieldBar.style.display = 'none';
            if (holyShieldStatus) holyShieldStatus.style.display = 'none';
            return;
        }
        
        // Show UI for weapons with Holy Shield
        if (holyShieldBar) holyShieldBar.style.display = 'block';
        if (holyShieldStatus) holyShieldStatus.style.display = 'block';
        
        if (holyShieldBar && holyShieldStatus) {
            if (this.holyShieldActive) {
                // Shield is active (will block next attack)
                holyShieldBar.style.background = 'linear-gradient(90deg, #ffdd00 100%, #333 100%)';
                holyShieldStatus.textContent = '🛡️ Holy Shield: ACTIVE';
                holyShieldStatus.style.color = '#ffdd00';
            } else if (this.holyShieldCooldown > 0) {
                // Shield is on cooldown
                const cooldownPercent = ((this.holyShieldMaxCooldown - this.holyShieldCooldown) / this.holyShieldMaxCooldown) * 100;
                holyShieldBar.style.background = `linear-gradient(90deg, #ffaa00 ${cooldownPercent}%, #333 ${cooldownPercent}%)`;
                const secondsLeft = Math.ceil(this.holyShieldCooldown / 60);
                holyShieldStatus.textContent = `🛡️ Holy Shield: ${secondsLeft}s`;
                holyShieldStatus.style.color = '#ffaa00';
            } else {
                // Shield is ready
                holyShieldBar.style.background = 'linear-gradient(90deg, #00ff00 100%, #333 100%)';
                holyShieldStatus.textContent = '🛡️ Holy Shield: Ready';
                holyShieldStatus.style.color = '#00ff00';
            }
        }
    }
    
    tryBlockAttack(damage) {
        if (this.holyShieldActive) {
            console.log("💫 Holy Shield blocked the attack!");
            this.holyShieldActive = false;
            this.holyShieldCooldown = this.holyShieldMaxCooldown; // Start cooldown
            this.invincibilityFrames = this.maxInvincibilityFrames; // Grant invincibility frames
            
            // Visual effect
            if (this.owner) {
                this.owner.color = '#ffffff'; // White flash
                setTimeout(() => {
                    if (this.owner) this.owner.color = '#00ccff'; // Back to normal
                }, 300);
            }
            
            // Add screen shake or other effects here if desired
            return true; // Attack was blocked
        } else if (this.invincibilityFrames > 0) {
            console.log("💨 Attack missed due to invincibility frames!");
            return true; // Attack was avoided due to invincibility
        }
        
        return false; // Attack was not blocked
    }
    
    // Base shooting method - should be overridden by subclasses
    shoot(mouseX, mouseY) {
        if (Game.frameCount - this.lastShot > this.fireRate) {
            this.createProjectiles(mouseX, mouseY);
            this.lastShot = Game.frameCount;
        }
    }
    
    // Override this in subclasses to create different projectile patterns
    createProjectiles(mouseX, mouseY) {
        this.createBullet(mouseX, mouseY);
    }
    
    // Helper method to create a single bullet with optional angle offset
    createBullet(mouseX, mouseY, angleOffset = 0) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const angle = Math.atan2(dy, dx) + angleOffset;
        
        // Calculate velocity components
        const bulletSpeed = this.bulletSpeed || gameConfig.getProjectileConfig(this.projectileType)?.baseSpeed || 15;
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;
        
        // Create bullet
        const bullet = new Bullet(this.owner.x, this.owner.y, vx, vy);
        
        // Set bullet properties
        bullet.radius = (this.bulletRadius || gameConfig.getProjectileConfig(this.projectileType)?.baseRadius || 5) + this.sizeUpgrades;
        bullet.color = this.getBulletColor();
        bullet.damage = this.damage;
        bullet.type = this.projectileType;
        
        // Set weapon type for decay system
        bullet.weaponType = this.type;
        
        // Set type-specific properties
        if (this.projectileType === 'rocket') {
            bullet.explosionRadius = this.explosionRadius || gameConfig.getProjectileConfig('rocket')?.explosionRadius || 60;
        }
        
        Game.bullets.push(bullet);
    }
    
    getBulletColor() {
        // Get color from config or use defaults
        const configColor = this.weaponConfig?.visuals?.color;
        if (configColor) return configColor;
        
        const projectileConfig = gameConfig.getProjectileConfig(this.projectileType);
        return projectileConfig?.color || '#ffff00';
    }
    
    update() {
        // Auto-fire at nearest enemy
        const target = this.getNearestEnemy();
        if (target) {
            this.shoot(target.x, target.y);
        }
    }
    
    // Find the closest enemy to target
    getNearestEnemy() {
        if (!Game.enemies || Game.enemies.length === 0) return null;
        
        let nearest = null;
        let minDist = Infinity;
        
        Game.enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.owner.x, enemy.y - this.owner.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
}