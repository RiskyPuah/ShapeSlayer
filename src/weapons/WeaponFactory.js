import { Pistol } from './types/Pistol.js';
import { Shotgun } from './types/Shotgun.js';
import { Minigun } from './types/Minigun.js';
import { Rocket } from './types/Rocket.js';
import { Paladin } from './types/Paladin.js';
import { Sniper } from './types/Sniper.js';
import { PlagueDoctor } from './types/PlagueDoctor.js';
import { Pyromancer } from './types/Pyromancer.js';
import { CardThrower } from './types/CardThrower.js';
import { modManager } from '../mods-system/ModManager.js';

export class WeaponFactory {
    // Synchronous version for core weapons (fast startup)
    static createWeapon(owner, weaponType) {
        switch(weaponType) {
            case 'pistol':
                return new Pistol(owner);
            case 'shotgun':
                return new Shotgun(owner);
            case 'minigun':
                return new Minigun(owner);
            case 'rocket':
                return new Rocket(owner);
            case 'paladin':
                return new Paladin(owner);
            case 'sniper':
                return new Sniper(owner);
            case 'plagueDoctor':
                return new PlagueDoctor(owner);
            case 'pyromancer':
                return new Pyromancer(owner);
            case 'cardThrower':
                return new CardThrower(owner);
            default:
                console.warn(`Unknown weapon type: ${weaponType}, defaulting to pistol`);
                return new Pistol(owner);
        }
    }
    
    // Async version for mod weapons
    static async createWeaponAsync(owner, weaponType) {
        // Check for mod weapons FIRST
        const modWeapon = await this.createModWeapon(owner, weaponType);
        if (modWeapon) {
            return modWeapon;
        }

        // Then fall back to core weapons
        const coreWeapon = this.createWeapon(owner, weaponType);
        return coreWeapon;
    }

    static async createModWeapon(owner, weaponType) {
        if (!modManager.isInitialized) {
            return null;
        }

        // Look for the weapon in loaded mods
        for (const [modId, mod] of modManager.loadedMods) {
            const manifest = mod.manifest;
            
            if (manifest.content.weapons && manifest.content.weapons.includes(weaponType)) {
                try {
                    // Dynamically import the mod weapon
                    const weaponModule = await import(`../../../mods/${modId}/${this.getWeaponFileName(weaponType)}`);
                    const WeaponClass = weaponModule[this.getWeaponClassName(weaponType)];
                    
                    if (WeaponClass) {
                        console.log(`✅ Created mod weapon '${weaponType}' from mod '${modId}'`);
                        return new WeaponClass(owner);
                    }
                } catch (error) {
                    console.error(`❌ Failed to load mod weapon '${weaponType}' from '${modId}':`, error);
                }
            }
        }

        return null;
    }

    static getWeaponFileName(weaponType) {
        // Convert weaponType to expected filename
        // e.g., 'pierceSniper' -> 'PierceSniper.js'
        return weaponType.charAt(0).toUpperCase() + weaponType.slice(1) + '.js';
    }

    static getWeaponClassName(weaponType) {
        // Convert weaponType to expected class name
        // e.g., 'pierceSniper' -> 'PierceSniper'
        return weaponType.charAt(0).toUpperCase() + weaponType.slice(1);
    }
}