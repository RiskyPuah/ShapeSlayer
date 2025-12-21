import { Pistol } from './types/Pistol.js';
import { Shotgun } from './types/Shotgun.js';
import { Minigun } from './types/Minigun.js';
import { Rocket } from './types/Rocket.js';
import { Paladin } from './types/Paladin.js';
import { Sniper } from './types/Sniper.js';
import { PlagueDoctor } from './types/PlagueDoctor.js';
import { Pyromancer } from './types/Pyromancer.js';
import { CardThrower } from './types/CardThrower.js';

export class WeaponFactory {
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
}