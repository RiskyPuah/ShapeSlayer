import { BaseWeapon } from '../BaseWeapon.js';

export class Pistol extends BaseWeapon {
    constructor(owner) {
        super(owner, 'pistol');
    }
    
    initializeWeapon() {
        this.fireRate = 40;     // Medium speed
        this.damage = 1;
        this.projectileCount = 1;
        this.spread = 0;
        this.projectileType = 'bullet';
        this.speedModifier = 1.0;  // Normal speed
        
        // Pistol doesn't have Holy Shield by default
        this.holyShieldMaxCooldown = 0;
    }
    
    // Pistol uses default shooting behavior from BaseWeapon
}