/**
 * PaladinShield.js
 * Paladin's Holy Shield - recharges over time (placeholder mechanics)
 */

import { HolyShield } from './HolyShield.js';

export class PaladinShield extends HolyShield {
    constructor(owner, rechargeCooldown = 7200) {
        super(owner);
        
        // Recharge mechanics
        this.rechargeCooldown = rechargeCooldown; // Frames until recharge (2 minutes at 60fps)
        this.rechargeTimer = 0;
        this.canRecharge = true;
        
        // Start with 1 charge active
        this.activate();
    }
    
    /**
     * Update with recharge mechanics
     */
    update() {
        super.update();
        
        // Handle recharge timer
        if (!this.active && this.canRecharge) {
            this.rechargeTimer++;
            
            if (this.rechargeTimer >= this.rechargeCooldown) {
                this.recharge();
            }
        }
    }
    
    /**
     * Recharge the shield
     */
    recharge() {
        console.log("✨ Paladin Shield recharged!");
        this.activate();
        this.rechargeTimer = 0;
    }
    
    /**
     * Override tryBlock to start recharge timer
     */
    tryBlock(damage = 1) {
        const blocked = super.tryBlock(damage);
        
        if (blocked && !this.active) {
            // Start recharge timer after shield is depleted
            this.rechargeTimer = 0;
        }
        
        return blocked;
    }
    
    /**
     * Effect when shield depletes - start recharge
     */
    onDepletedEffect() {
        console.log(`🛡️ Shield depleted. Recharging in ${(this.rechargeCooldown / 60).toFixed(1)}s...`);
        this.rechargeTimer = 0;
    }
    
    /**
     * Reduce recharge cooldown (for upgrades)
     */
    reduceRechargeCooldown(multiplier = 0.85) {
        this.rechargeCooldown = Math.max(this.rechargeCooldown * multiplier, 60 * 30); // Min 30 seconds
        console.log(`Paladin Shield recharge reduced to ${(this.rechargeCooldown / 60).toFixed(1)}s`);
    }
    
    /**
     * Get recharge progress (0-1)
     */
    getRechargeProgress() {
        if (this.active) return 1;
        return Math.min(this.rechargeTimer / this.rechargeCooldown, 1);
    }
}
