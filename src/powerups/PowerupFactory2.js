import { Magnetic } from './Magnetic.js';
import { InstantDeath } from './InstantDeath.js';
import { HolyShieldPowerup } from './HolyShieldPowerup.js';

/**
 * PowerupFactory - Static factory for creating and spawning powerups
 * VERSION 2.0 - CACHE BUSTER
 */
export class PowerupFactory {
    // Configuration constants
    static INSTANT_DEATH_SPAWN_CHANCE = 0.01;
    static MAGNETIC_SPAWN_CHANCE = 0.04;
    static HOLY_SHIELD_SPAWN_CHANCE = 0.05; // 5% drop rate
    
    static __VERSION__ = "2.0-CACHE-BUST";

    /**
     * Spawn a random powerup at position
     * Uses configured drop chances
     */
    static spawnPowerup(x, y) {
        // CRITICAL DEBUG - This MUST appear in console
        console.error("🔴🔴🔴 POWERUP FACTORY V2.0 LOADED 🔴🔴🔴");
        console.error("⚠️ PowerupFactory.spawnPowerup() called at", x, y);
        
        // Offset position to avoid overlap with gems
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        const spawnX = x + offsetX;
        const spawnY = y + offsetY;

        // Roll once and decide which powerup to spawn
        const roll = Math.random();
        
        console.error(`🎲 Powerup roll: ${roll.toFixed(3)} (ID=${this.INSTANT_DEATH_SPAWN_CHANCE}, Mag=${this.MAGNETIC_SPAWN_CHANCE}, Shield=${this.HOLY_SHIELD_SPAWN_CHANCE})`);
        
        if (roll < this.INSTANT_DEATH_SPAWN_CHANCE) {
            console.error("📌 Spawning InstantDeath powerup at", spawnX, spawnY);
            return new InstantDeath(spawnX, spawnY);
        } else if (roll < this.INSTANT_DEATH_SPAWN_CHANCE + this.MAGNETIC_SPAWN_CHANCE) {
            console.error("📌 Spawning Magnetic powerup at", spawnX, spawnY);
            return new Magnetic(spawnX, spawnY);
        } else if (roll < this.INSTANT_DEATH_SPAWN_CHANCE + this.MAGNETIC_SPAWN_CHANCE + this.HOLY_SHIELD_SPAWN_CHANCE) {
            console.error("📌 Spawning HolyShield powerup at", spawnX, spawnY);
            return new HolyShieldPowerup(spawnX, spawnY);
        }

        console.error("❌ No powerup spawned (roll too high)");
        return null; // No powerup spawned
    }

    /**
     * Spawn specific powerup type
     */
    static spawnByType(type, x, y) {
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        const spawnX = x + offsetX;
        const spawnY = y + offsetY;

        switch(type.toLowerCase()) {
            case 'instant_death':
            case 'instantdeath':
                return new InstantDeath(spawnX, spawnY);
            case 'magnetic':
                return new Magnetic(spawnX, spawnY);
            case 'holy_shield':
            case 'holyshield':
                return new HolyShieldPowerup(spawnX, spawnY);
            default:
                return null;
        }
    }

    /**
     * Set spawn chance for a specific powerup type
     */
    static setSpawnChance(powerupType, chance) {
        chance = Math.max(0, Math.min(1, chance)); // Clamp 0-1
        
        switch(powerupType.toLowerCase()) {
            case 'instant_death':
            case 'instantdeath':
                this.INSTANT_DEATH_SPAWN_CHANCE = chance;
                console.log(`⚙️ InstantDeath spawn chance set to ${chance}`);
                break;
            case 'magnetic':
                this.MAGNETIC_SPAWN_CHANCE = chance;
                console.log(`⚙️ Magnetic spawn chance set to ${chance}`);
                break;
            case 'holy_shield':
            case 'holyshield':
                this.HOLY_SHIELD_SPAWN_CHANCE = chance;
                console.log(`⚙️ HolyShield spawn chance set to ${chance}`);
                break;
        }
    }
}
