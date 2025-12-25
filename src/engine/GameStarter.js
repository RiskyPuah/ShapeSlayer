/**
 * GameStarter.js
 * Handles character/weapon selection and game start
 */

import { Game, canvas } from './Game.js';
import { Player } from '../entities/Player.js';
import { WeaponFactory } from '../weapons/WeaponFactory.js';
import { characterManager } from '../characters/CharacterManager.js';
import { gameInitializer } from './GameInitializer.js';
import { gameLoop } from './GameLoop.js';

export class GameStarter {
    constructor() {
        this.selectedWeapon = null;
        this.selectedCharacter = null;
    }

    /**
     * Start the game with selected weapon and character
     */
    async startGame(weaponType, character = null) {
        if (!gameInitializer.isConfigLoaded()) {
            console.warn('Configuration not loaded yet!');
            return;
        }
        
        console.log("🎮 Starting game with:", weaponType, character);
        this.selectedWeapon = weaponType;
        this.selectedCharacter = character;
        
        try {
            // Get starting health from character (default to 2 hearts = 4 HP)
            const startingHealth = character?.startingStats?.health || 4;
            
            // Create player
            console.log("Creating player...");
            Game.player = new Player(canvas.width / 2, canvas.height / 2, startingHealth);
            console.log("✅ Player created");
            
            // Create weapon
            console.log("Creating weapon:", weaponType);
            await this.createWeapon(weaponType);
            
            if (!Game.player.weapon) {
                throw new Error("Failed to create weapon!");
            }
            
            // Apply character traits
            if (this.selectedCharacter) {
                this.applyCharacterTraits();
            }
            
            // Hide menus
            this.hideMenus();
            
            // Start the game
            Game.active = true;
            console.log("✅ GAME STARTED!");
            
            // Force initial draw
            gameLoop.draw();
        } catch (error) {
            console.error("❌ Error starting game:", error);
            alert("Failed to start game: " + error.message);
        }
    }

    /**
     * Create weapon for player
     */
    async createWeapon(weaponType) {
        try {
            Game.player.weapon = WeaponFactory.createWeapon(Game.player, weaponType);
            console.log("✅ Weapon created (sync):", Game.player.weapon);
        } catch (e) {
            console.log("Trying async weapon creation for mod weapon...");
            Game.player.weapon = await WeaponFactory.createWeaponAsync(Game.player, weaponType);
            console.log("✅ Weapon created (async):", Game.player.weapon);
        }
    }

    /**
     * Apply character traits to player
     */
    applyCharacterTraits() {
        characterManager.applyCharacterTraits(Game.player, this.selectedCharacter);
        console.log("Applied character traits for:", this.selectedCharacter.name);
        
        // Apply character-specific stats
        if (this.selectedCharacter.startingStats) {
            if (this.selectedCharacter.startingStats.speed) {
                Game.player.baseSpeed = this.selectedCharacter.startingStats.speed;
            }
        }
        
        // Apply character colors
        if (this.selectedCharacter.colors?.primary) {
            Game.player.color = this.selectedCharacter.colors.primary;
        }
    }

    /**
     * Hide all selection menus
     */
    hideMenus() {
        const characterSelection = document.getElementById('characterSelection');
        const weaponSelection = document.getElementById('weaponSelection');
        if (characterSelection) characterSelection.style.display = 'none';
        if (weaponSelection) weaponSelection.style.display = 'none';
        console.log("✅ Menus hidden");
    }
}

export const gameStarter = new GameStarter();
