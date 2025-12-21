import { BaseWeapon } from '../BaseWeapon.js';

export class Minigun extends BaseWeapon {
    constructor(owner) {
        super(owner, 'minigun');
    }
    
    initializeWeapon() {
        this.fireRate = 18;      // Fast!
        this.damage = 0.5;      // Half damage of pistol
        this.projectileCount = 1;
        this.spread = 0.1;      // Slight inaccuracy due to rapid fire
        this.projectileType = 'bullet';
        this.speedModifier = 0.7; // 30% slower (very heavy)
        
        // Minigun doesn't have Holy Shield by default
        this.holyShieldMaxCooldown = 0;
    }
    
    // Override fire rate upgrade for minigun-specific behavior
    applyFireRateUpgrade() {
        const minRate = 8; // Minigun minimum fire rate
        if (this.fireRate > minRate) {
            this.fireRate -= 2; // Smaller increments for minigun
            console.log(`${this.type} fire rate improved to ${this.fireRate}`);
        }
    }
    
    // Override projectile creation to include spread
    createProjectiles(mouseX, mouseY) {
        const spreadAngle = (Math.random() - 0.5) * this.spread;
        this.createBullet(mouseX, mouseY, spreadAngle);
    }
}