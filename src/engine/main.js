/**
 * main.js - Game Entry Point
 * Simplified and modular main file that coordinates all game systems
 */

import { Game } from './Game.js';
import { gameInitializer } from './GameInitializer.js';
import { gameLoop } from './GameLoop.js';
import { gameStarter } from './GameStarter.js';
import { eventHandlers, chooseWeaponUpgrade, rerollWeaponUpgrades, spawnPowerup } from './EventHandlers.js';
import { SelectionScreen, selectionScreen } from '../characters/SelectionScreen.js';
import { characterSelectionScreen } from '../characters/CharacterSelectionScreen.js';
import { modManager } from '../mods-system/ModManager.js';
import { modManagerScreen } from '../mods-system/ModManagerScreen.js';

console.log("🎮 ShapeSlayer Game Loading...");

// Initialize the game configuration
gameInitializer.loadGameConfig();

// Expose global functions for HTML onclick handlers
window.selectWeapon = (weaponType, character = null) => gameStarter.startGame(weaponType, character);
window.chooseWeaponUpgrade = chooseWeaponUpgrade;
window.rerollWeaponUpgrades = rerollWeaponUpgrades;
window.spawnPowerup = spawnPowerup;

// Expose game objects for debugging and external access
window.Game = Game;
window.selectionScreen = selectionScreen;
window.characterSelectionScreen = characterSelectionScreen;
window.modManager = modManager;
window.modManagerScreen = modManagerScreen;

// Expose character screen functions for HTML onclick handlers
window.showCharacterTab = (tab) => characterSelectionScreen.showCharacterTab(tab);
window.showCharacterCreation = () => characterSelectionScreen.showCharacterCreation();
window.showTraitCategory = (category) => characterSelectionScreen.showTraitCategory(category);
window.saveCustomCharacter = () => characterSelectionScreen.saveCharacter();
window.cancelCharacterCreation = () => characterSelectionScreen.cancelCreation();

// Start the game loop (paused until player selects character)
Game.active = false;
gameLoop.start();

console.log("✅ ShapeSlayer Ready!");
