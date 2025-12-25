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
import { saveManager } from './SaveManager.js';

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
            
            // Enable auto-save
            saveManager.startAutoSave(Game);
            
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
        // Try async first for mod weapons, then fall back to sync for core weapons
        try {
            console.log(`🔍 Creating weapon: ${weaponType}`);
            Game.player.weapon = await WeaponFactory.createWeaponAsync(Game.player, weaponType);
            console.log("✅ Weapon created:", Game.player.weapon);
        } catch (error) {
            console.error("❌ Failed to create weapon:", error);
            // Fall back to pistol
            Game.player.weapon = WeaponFactory.createWeapon(Game.player, 'pistol');
            console.log("⚠️ Defaulted to pistol");
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

    /**
     * Load and restore saved game
     * @returns {boolean} Success status
     */
    loadSavedGame() {
        const saveData = saveManager.loadGame();
        
        if (!saveData) {
            console.log('No save file to load');
            return false;
        }

        try {
            console.log('📂 Restoring saved game...');

            // Restore player
            Game.player = new Player(
                saveData.player.x,
                saveData.player.y,
                saveData.player.maxHealth
            );
            
            Game.player.healthManager.currentHealth = saveData.player.health;
            Game.player.speed = saveData.player.speed;
            Game.player.isDead = saveData.player.isDead || false;

            // Restore weapon
            const weaponType = saveData.weapon.type;
            this.selectedWeapon = weaponType;
            Game.player.weapon = WeaponFactory.createWeapon(Game.player, weaponType);
            Game.player.weapon.level = saveData.weapon.level;
            Game.player.weapon.upgrades = saveData.weapon.upgrades || [];

            // Restore shield if present
            if (saveData.shield) {
                // Shield restoration handled by character traits or powerups
                console.log('Shield data found:', saveData.shield);
            }

            // Restore character
            this.selectedCharacter = saveData.character;

            // Restore game progress to player
            Game.player.level = saveData.progress.level;
            Game.player.xp = saveData.progress.xp;
            Game.player.xpToNext = saveData.progress.xpToNext || saveData.progress.xpThreshold || 10;
            Game.score = saveData.progress.score;
            Game.kills = saveData.progress.kills || 0;

            // Update UI
            document.getElementById('lvl').textContent = Game.player.level;
            document.getElementById('score').textContent = Game.score;

            // Hide menus and start game
            this.hideMenus();
            Game.active = true;
            
            // Enable auto-save
            saveManager.startAutoSave(Game);

            console.log('✅ Game restored successfully!');
            return true;

        } catch (error) {
            console.error('❌ Failed to restore saved game:', error);
            return false;
        }
    }
}

export const gameStarter = new GameStarter();
