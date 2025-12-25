/**
 * SaveManager.js - Game Save/Load System
 * Manages saving and loading game state to localStorage and files
 */

export class SaveManager {
    constructor() {
        this.saveKey = 'shapeslayer_savegame';
        this.autoSaveInterval = 30000; // Auto-save every 30 seconds
        this.autoSaveTimer = null;
        this.lastSaveTime = 0;
    }

    /**
     * Save current game state
     * @param {Game} game - The game instance
     * @returns {boolean} Success status
     */
    saveGame(game) {
        try {
            if (!game || !game.player) {
                console.warn('❌ Cannot save: No active game');
                return false;
            }

            const saveData = {
                version: '1.2.5.1',
                timestamp: Date.now(),
                
                // Player data
                player: {
                    x: game.player.x,
                    y: game.player.y,
                    health: game.player.healthManager?.currentHealth || 4,
                    maxHealth: game.player.healthManager?.maxHealth || 4,
                    speed: game.player.speed,
                    invulnerable: game.player.invulnerable,
                    invulnerableFrames: game.player.invulnerableFrames,
                    isDead: game.player.isDead,
                    sprite: game.player.sprite?.src || null
                },
                
                // Character data
                character: {
                    id: game.player.character?.id || 'ranger',
                    name: game.player.character?.name || 'Ranger',
                    traits: game.player.character?.traits || []
                },
                
                // Shield data
                shield: game.player.shield ? {
                    charges: game.player.shield.charges,
                    maxCharges: game.player.shield.maxCharges,
                    type: game.player.shield.constructor.name
                } : null,
                
                // Weapon data
                weapon: {
                    type: game.player.weapon?.type || 'pistol',
                    level: game.player.weapon?.level || 1,
                    upgrades: game.player.weapon?.upgrades || [],
                    ammo: game.player.weapon?.ammo || null,
                    maxAmmo: game.player.weapon?.maxAmmo || null
                },
                
                // Game progress
                progress: {
                    level: game.player.level || 1,
                    xp: game.player.xp || 0,
                    xpToNext: game.player.xpToNext || 10,
                    score: game.score || 0,
                    kills: game.kills || 0
                },
                
                // Enemies (limited to nearby enemies for performance)
                enemies: game.enemies.slice(0, 50).map(enemy => ({
                    x: enemy.x,
                    y: enemy.y,
                    health: enemy.health,
                    maxHealth: enemy.maxHealth,
                    type: enemy.type || 'normal',
                    speed: enemy.speed
                })),
                
                // Active powerups
                activePowerups: [],
                
                // Game settings
                settings: {
                    difficulty: game.difficulty || 'normal',
                    elapsed: game.elapsed || 0
                }
            };

            // Save to localStorage
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            this.lastSaveTime = Date.now();
            
            console.log('💾 Game saved successfully!', {
                level: saveData.progress.level,
                health: saveData.player.health,
                enemies: saveData.enemies.length
            });

            return true;

        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load saved game state
     * @returns {Object|null} Saved game data or null if not found
     */
    loadGame() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            
            if (!savedData) {
                console.log('ℹ️ No save file found');
                return null;
            }

            const data = JSON.parse(savedData);
            
            // Validate save data
            if (!this.validateSaveData(data)) {
                console.warn('⚠️ Save data is corrupted or incompatible');
                return null;
            }

            console.log('📂 Game loaded successfully!', {
                version: data.version,
                level: data.progress.level,
                character: data.character.name,
                saveAge: Math.floor((Date.now() - data.timestamp) / 1000) + 's ago'
            });

            return data;

        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    }

    /**
     * Check if a save file exists
     * @returns {boolean}
     */
    hasSaveFile() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Delete save file
     * @returns {boolean} Success status
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('🗑️ Save file deleted');
            return true;
        } catch (error) {
            console.error('❌ Failed to delete save:', error);
            return false;
        }
    }

    /**
     * Validate save data structure
     * @param {Object} data - Save data to validate
     * @returns {boolean}
     */
    validateSaveData(data) {
        return data &&
               data.version &&
               data.player &&
               data.character &&
               data.weapon &&
               data.progress &&
               typeof data.player.x === 'number' &&
               typeof data.player.y === 'number' &&
               typeof data.player.health === 'number';
    }

    /**
     * Start auto-save timer
     * @param {Game} game - Game instance to auto-save
     */
    startAutoSave(game) {
        this.stopAutoSave(); // Clear existing timer
        
        console.log(`🔄 Starting auto-save (interval: ${this.autoSaveInterval}ms = ${this.autoSaveInterval/1000}s)`);
        
        this.autoSaveTimer = setInterval(() => {
            if (game && game.active && game.player && !game.player.isDead) {
                const timeSinceLastSave = Date.now() - this.lastSaveTime;
                console.log(`⏰ Auto-save triggered (${Math.floor(timeSinceLastSave/1000)}s since last save)`);
                this.saveGame(game);
                this.showSaveNotification();
            }
        }, this.autoSaveInterval);

        console.log('✅ Auto-save timer started');
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Show save notification (brief UI feedback)
     */
    showSaveNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.8);
            color: black;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        notification.textContent = '💾 Game Saved';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-10px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    /**
     * Export save data as downloadable JSON file
     * @param {Game} game - Game instance
     */
    exportSaveFile(game) {
        try {
            const saveData = this.saveGame(game);
            if (!saveData) return;

            const data = localStorage.getItem(this.saveKey);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `shapeslayer_save_${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('📥 Save file exported');
        } catch (error) {
            console.error('❌ Failed to export save:', error);
        }
    }

    /**
     * Import save data from file
     * @param {File} file - JSON file to import
     * @returns {Promise<Object|null>}
     */
    async importSaveFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.validateSaveData(data)) {
                throw new Error('Invalid save file format');
            }

            localStorage.setItem(this.saveKey, text);
            console.log('📤 Save file imported');
            return data;
        } catch (error) {
            console.error('❌ Failed to import save:', error);
            return null;
        }
    }

    /**
     * Get save file info without loading the full game
     * @returns {Object|null}
     */
    getSaveInfo() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (!savedData) return null;

            const data = JSON.parse(savedData);
            return {
                character: data.character.name,
                level: data.progress.level,
                score: data.progress.score,
                health: data.player.health,
                timestamp: data.timestamp,
                age: Math.floor((Date.now() - data.timestamp) / 1000)
            };
        } catch (error) {
            return null;
        }
    }
}

// Create singleton instance
export const saveManager = new SaveManager();
