import { BaseWeapon } from '../BaseWeapon.js';
import { Game, ctx } from '../../Game.js';
import { Bullet } from '../Bullet.js';

export class PlagueDoctor extends BaseWeapon {
    constructor(owner) {
        super(owner, 'plagueDoctor');
    }
    
    initializeWeapon() {
        this.fireRate = 90;       // Slow throwing rate
        this.damage = 0.5;        // Minimal direct damage
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'potion';
        this.speedModifier = 0.85; // Slightly slower movement (carrying potions)
        this.potionSpeed = 8;     // Slow projectile speed
        this.potionRadius = 8;    // Potion size
        
        // Poison puddle properties
        this.puddleBaseDamage = 0.25;    // DOT damage per tick
        this.puddleSlowEffect = 0.45;    // 45% speed reduction
        this.puddleDuration = 300;      // 5 seconds at 60fps
        this.puddleGrowthRate = 0.2;    // Growth per frame
        this.puddleMaxRadius = 90;      // Maximum puddle size
        this.puddleInitialRadius = 35;  // Starting puddle size
        
        console.log(`✅ Initialized Plague Doctor - slow potions with poison puddles`);
    }
    
    // Override damage upgrade
    applyDamageUpgrade() {
        this.puddleBaseDamage += 0.2; // Increase DOT damage
        console.log(`${this.type} poison damage increased to ${this.puddleBaseDamage} per tick`);
    }
    
    // Plague Doctor specific upgrades
    applyPuddleRangeUpgrade() {
        this.puddleMaxRadius += 10;
        console.log(`${this.type} poison puddle max size increased to ${this.puddleMaxRadius}`);
    }
    
    applyPuddleDurationUpgrade() {
        this.puddleDuration += 60; // Add 1 second
        console.log(`${this.type} poison puddle duration increased to ${this.puddleDuration / 60} seconds`);
    }
    
    applySlowEffectUpgrade() {
        this.puddleSlowEffect = Math.min(this.puddleSlowEffect + 0.1, 0.8); // Max 80% slow
        console.log(`${this.type} slow effect increased to ${(this.puddleSlowEffect * 100).toFixed(0)}%`);
    }
    
    // Override upgrade system to include Plague Doctor options
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'puddleRange':
                this.applyPuddleRangeUpgrade();
                break;
            case 'puddleDuration':
                this.applyPuddleDurationUpgrade();
                break;
            case 'slowEffect':
                this.applySlowEffectUpgrade();
                break;
            default:
                super.applyUpgrade(upgradeType); // Use base weapon upgrades
                break;
        }
    }
    
    // Override to create poison potions
    createProjectiles(mouseX, mouseY) {
        this.throwPotion(mouseX, mouseY);
    }
    
    throwPotion(mouseX, mouseY) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const angle = Math.atan2(dy, dx);
        
        // Calculate velocity components
        const vx = Math.cos(angle) * this.potionSpeed;
        const vy = Math.sin(angle) * this.potionSpeed;
        
        // Create potion bullet
        const potion = new Bullet(this.owner.x, this.owner.y, vx, vy);
        
        // Set potion properties
        potion.radius = this.potionRadius;
        potion.color = '#88ff44'; // Green potion color
        potion.damage = this.damage;
        potion.type = 'potion';
        potion.weaponType = this.type;
        
        // Special potion properties
        potion.isPlaguePotion = true;
        potion.puddleData = {
            baseDamage: this.puddleBaseDamage,
            slowEffect: this.puddleSlowEffect,
            duration: this.puddleDuration,
            growthRate: this.puddleGrowthRate,
            maxRadius: this.puddleMaxRadius,
            initialRadius: this.puddleInitialRadius
        };
        
        Game.bullets.push(potion);
    }
    
    getBulletColor() {
        return '#88ff44'; // Green for poison potions
    }
}