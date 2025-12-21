import { BaseWeapon } from '../BaseWeapon.js';

export class Rocket extends BaseWeapon {
    constructor(owner) {
        super(owner, 'rocket');
    }
    
    initializeWeapon() {
        this.fireRate = 120;    // Very slow
        this.damage = 3;
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'rocket';
        this.speedModifier = 0.6; // 40% slower (heaviest weapon)
        
        // Rocket doesn't have Holy Shield by default
        this.holyShieldMaxCooldown = 0;
    }
    
    // Override damage upgrade for rockets
    applyDamageUpgrade() {
        this.damage += 1; // Rockets get +1 damage instead of +0.5
        console.log(`${this.type} damage increased to ${this.damage}`);
    }
    
    // Override fire rate upgrade for rocket-specific behavior
    applyFireRateUpgrade() {
        const minRate = 60; // Rocket minimum fire rate
        if (this.fireRate > minRate) {
            this.fireRate -= 5;
            console.log(`${this.type} fire rate improved to ${this.fireRate}`);
        }
    }
    
    // Rockets use the default createBullet method from BaseWeapon
    // which will automatically set the correct type and explosion radius
}