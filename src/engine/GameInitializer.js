/**
 * GameInitializer.js
 * Handles game configuration loading and initialization
 */

import { gameConfig } from '../characters/ConfigManager.js';
import { characterManager } from '../characters/CharacterManager.js';
import { modManager } from '../mods-system/ModManager.js';
import { characterSelectionScreen } from '../characters/CharacterSelectionScreen.js';

export class GameInitializer {
    constructor() {
        this.configLoaded = false;
    }

    /**
     * Load all game configurations
     */
    async loadGameConfig() {
        try {
            console.log('🔄 Loading game configuration...');
            
            // First load basic configs
            await Promise.all([
                gameConfig.loadConfigurations()
            ]);
            console.log('✅ Basic configs loaded');
            
            // Initialize mod system and WAIT for it to complete
            // This ensures mods are loaded before character manager tries to load mod characters
            try {
                await modManager.initialize();
                console.log('✅ Mod system initialized');
            } catch (error) {
                console.warn('⚠️ Mod system failed to initialize:', error);
            }
            
            // Load character manager (will now include mod characters)
            await characterManager.loadConfigurations();
            console.log('✅ Character manager loaded');
            
            this.configLoaded = true;
            console.log('🎮 Game ready to start!');
            
            // Note: Main menu will handle showing character selection
            // Don't auto-show character selection anymore
            
        } catch (error) {
            console.error('❌ Failed to load game configuration:', error);
            alert('Failed to load game configuration. Please refresh the page.');
        }
    }

    isConfigLoaded() {
        return this.configLoaded;
    }
}

export const gameInitializer = new GameInitializer();
