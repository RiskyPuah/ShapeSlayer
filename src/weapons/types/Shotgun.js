import { BaseWeapon } from '../BaseWeapon.js';

export class Shotgun extends BaseWeapon {
    constructor(owner) {
        super(owner, 'shotgun');
    }
    
    initializeWeapon() {
        this.fireRate = 80;     // Slow
        this.damage = 1;
        this.projectileCount = 5;
        this.spread = 0.6;      // Wide spread
        this.projectileType = 'bullet';
        this.speedModifier = 0.8; // 20% slower (heavy weapon)
        
        // Shotgun doesn't have Holy Shield by default
        this.holyShieldMaxCooldown = 0;
    }
    
    // Override fire rate upgrade for shotgun-specific behavior
    applyFireRateUpgrade() {
        const minRate = 30; // Shotgun minimum fire rate
        if (this.fireRate > minRate) {
            this.fireRate -= 5;
            console.log(`${this.type} fire rate improved to ${this.fireRate}`);
        }
    }
    
    // Override projectile creation for multiple pellets
    createProjectiles(mouseX, mouseY) {
        // Create multiple pellets with spread
        for (let i = 0; i < this.projectileCount; i++) {
            const spreadAngle = (Math.random() - 0.5) * this.spread;
            this.createBullet(mouseX, mouseY, spreadAngle);
        }
    }
}