import { BaseWeapon } from '../BaseWeapon.js';
import { Game, ctx } from '../../Game.js';
import { Bullet } from '../Bullet.js';

export class CardThrower extends BaseWeapon {
    constructor(owner) {
        super(owner, 'cardThrower');
    }
    
    initializeWeapon() {
        this.fireRate = 90;       // Average attack speed
        this.damage = 0.75;          // 0.75 damage per card
        this.projectileCount = 3; // 3 cards per throw
        this.spread = Math.PI / 15; // 12 degrees total (6 degrees each side)
        this.projectileType = 'card';
        this.speedModifier = 1.0; // Normal movement speed
        this.cardSpeed = 5;      // Medium projectile speed
        this.cardRadius = 10;      // Card size (increased for visibility)
        this.pierceCount = 3;     // Pierce through 3 enemies
        
        // Special card enhancement properties
        this.hasPoison = false;   // Upgrade: poison cards
        this.hasFire = false;     // Upgrade: fire cards
        this.poisonDamage = 0.15; // DOT from poison cards
        this.fireDamage = 0.1;    // DOT from fire cards
        this.dotDuration = 120;   // 2 seconds DOT
        
        console.log(`✅ Initialized Card Thrower - 3 piercing cards in spread pattern`);
    }
    
    // Override damage upgrade
    applyDamageUpgrade() {
        this.damage += 0.5; // Increase card damage
        console.log(`${this.type} card damage increased to ${this.damage}`);
    }
    
    // Card Thrower specific upgrades
    applyPierceUpgrade() {
        this.pierceCount += 2;
        console.log(`${this.type} pierce count increased to ${this.pierceCount}`);
    }
    
    applyCardCountUpgrade() {
        this.projectileCount += 1;
        this.spread = Math.min(this.spread + Math.PI / 20, Math.PI / 6); // Max 30 degrees
        console.log(`${this.type} now throws ${this.projectileCount} cards with ${(this.spread * 180 / Math.PI).toFixed(0)}° spread`);
    }
    
    applyPoisonCardsUpgrade() {
        this.hasPoison = true;
        console.log(`${this.type} cards now apply poison DOT!`);
    }
    
    applyFireCardsUpgrade() {
        this.hasFire = true;
        console.log(`${this.type} cards now apply burn DOT!`);
    }
    
    applyCardSpeedUpgrade() {
        this.cardSpeed += 3;
        console.log(`${this.type} card speed increased to ${this.cardSpeed}`);
    }
    
    // Override upgrade system to include Card Thrower options
    applyUpgrade(upgradeType) {
        switch(upgradeType) {
            case 'pierce':
                this.applyPierceUpgrade();
                break;
            case 'cardCount':
                this.applyCardCountUpgrade();
                break;
            case 'poisonCards':
                this.applyPoisonCardsUpgrade();
                break;
            case 'fireCards':
                this.applyFireCardsUpgrade();
                break;
            case 'cardSpeed':
                this.applyCardSpeedUpgrade();
                break;
            default:
                super.applyUpgrade(upgradeType); // Use base weapon upgrades
                break;
        }
    }
    
    // Override to create spread of piercing cards
    createProjectiles(mouseX, mouseY) {
        this.throwCards(mouseX, mouseY);
    }
    
    throwCards(mouseX, mouseY) {
        const dx = mouseX - this.owner.x;
        const dy = mouseY - this.owner.y;
        const baseAngle = Math.atan2(dy, dx);
        
        // Calculate spread angles for each card
        for (let i = 0; i < this.projectileCount; i++) {
            // Center the spread around the base angle
            const angleOffset = (i - (this.projectileCount - 1) / 2) * this.spread / (this.projectileCount - 1);
            const cardAngle = baseAngle + angleOffset;
            
            // Calculate velocity components
            const vx = Math.cos(cardAngle) * this.cardSpeed;
            const vy = Math.sin(cardAngle) * this.cardSpeed;
            
            // Create piercing card
            const card = new Bullet(this.owner.x, this.owner.y, vx, vy);
            
            // Set card properties
            card.radius = this.cardRadius;
            card.color = this.getCardColor();
            card.damage = this.damage;
            card.type = 'piercing';
            card.weaponType = this.type;
            card.pierceCount = this.pierceCount;
            card.enemiesHit = []; // Track which enemies this card has hit
            
            // Special card enhancements
            card.hasPoison = this.hasPoison;
            card.hasFire = this.hasFire;
            card.poisonDamage = this.poisonDamage;
            card.fireDamage = this.fireDamage;
            card.dotDuration = this.dotDuration;
            
            Game.bullets.push(card);
        }
    }
    
    getCardColor() {
        if (this.hasPoison && this.hasFire) {
            return '#ff8844'; // Orange-green mix for both effects
        } else if (this.hasPoison) {
            return '#88ff44'; // Green for poison
        } else if (this.hasFire) {
            return '#ff4400'; // Red-orange for fire
        } else {
            return '#4488ff'; // Blue for normal cards
        }
    }
    
    getBulletColor() {
        return this.getCardColor();
    }
}