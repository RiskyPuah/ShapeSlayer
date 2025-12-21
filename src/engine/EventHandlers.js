/**
 * EventHandlers.js
 * Handles all DOM and input events
 */

import { Game, canvas } from './Game.js';
import { Powerup } from '../powerups/Powerup.js';
import { Orbital } from '../projectiles/Orbital.js';
import { modManagerScreen } from '../mods-system/ModManagerScreen.js';
import { SelectionScreen, selectionScreen } from '../characters/SelectionScreen.js';

export class EventHandlers {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupSpriteUpload();
        this.setupKeyboardEvents();
        this.setupMouseEvents();
    }

    /**
     * Setup sprite upload functionality
     */
    setupSpriteUpload() {
        const uploadInput = document.getElementById('spriteUpload');
        if (uploadInput) {
            uploadInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        Game.player.sprite = img;
                    };
                }
            });
        }
    }

    /**
     * Setup keyboard event handlers
     */
    setupKeyboardEvents() {
        document.addEventListener('keydown', function(event) {
            // Handle mod manager screen first
            if (modManagerScreen.handleKeyPress(event.key)) {
                event.preventDefault();
                return;
            }
            
            // Open mod manager with 'M' key
            if (event.key.toLowerCase() === 'm' && !modManagerScreen.isVisible) {
                modManagerScreen.show();
                event.preventDefault();
                return;
            }
            
            // Handle Pierce character reload with 'R' key
            if (event.key.toLowerCase() === 'r' && Game.player && Game.player.weapon) {
                if (Game.player.weapon.type === 'pierceSniper' && typeof Game.player.weapon.reload === 'function') {
                    Game.player.weapon.reload();
                    event.preventDefault();
                }
            }
        });
    }

    /**
     * Setup mouse event handlers
     */
    setupMouseEvents() {
        // Mouse click handler
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            if (modManagerScreen.handleClick(x, y)) {
                event.preventDefault();
            }
        });

        // Mouse scroll handler
        canvas.addEventListener('wheel', function(event) {
            if (modManagerScreen.isVisible) {
                const deltaY = Math.sign(event.deltaY);
                if (modManagerScreen.handleScroll(deltaY)) {
                    event.preventDefault();
                }
            }
        });
    }
}

/**
 * Upgrade system functions
 */
export function chooseWeaponUpgrade(upgradeType) {
    if (Game.player && Game.player.weapon) {
        Game.player.weapon.applyUpgrade(upgradeType);
    }
    
    selectionScreen.hideWeaponUpgradeMenu();
    Game.active = true;
}

export function rerollWeaponUpgrades() {
    if (selectionScreen.rerollUpgrades()) {
        console.log("Upgrades rerolled!");
    } else {
        console.log("No rerolls remaining!");
    }
}

/**
 * Debug function to spawn powerup
 */
export function spawnPowerup() {
    if (!Game.player) return;
    const x = Game.player.x + (Math.random() - 0.5) * 200;
    const y = Game.player.y + (Math.random() - 0.5) * 200;
    Game.powerups.push(new Powerup(x, y));
    console.log("Debug powerup spawned at", x, y);
}

export const eventHandlers = new EventHandlers();
