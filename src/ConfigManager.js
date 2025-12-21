/**
 * ConfigManager - Handles loading and managing JSON configuration files
 * This makes the game easily customizable without code changes
 */
export class ConfigManager {
    constructor() {
        this.configs = {};
        this.loaded = false;
    }

    /**
     * Load all configuration files asynchronously
     */
    async loadConfigurations() {
        try {
            const configFiles = [
                { key: 'weapons', path: './data/weapons.json' },
                { key: 'enemies', path: './data/enemies.json' },
                { key: 'upgrades', path: './data/upgrades.json' },
                { key: 'gameSettings', path: './data/gameSettings.json' }
            ];

            // Load all config files in parallel
            const loadPromises = configFiles.map(async (config) => {
                const response = await fetch(config.path);
                if (!response.ok) {
                    throw new Error(`Failed to load ${config.key}: ${response.statusText}`);
                }
                const data = await response.json();
                this.configs[config.key] = data;
                console.log(`✅ Loaded ${config.key} configuration`);
            });

            await Promise.all(loadPromises);
            this.loaded = true;
            console.log('🎮 All game configurations loaded successfully!');
            
        } catch (error) {
            console.error('❌ Failed to load configurations:', error);
            throw error;
        }
    }

    /**
     * Get weapon configuration by type
     */
    getWeapon(weaponType) {
        if (!this.loaded) {
            throw new Error('Configurations not loaded yet!');
        }
        return this.configs.weapons?.weapons?.[weaponType];
    }

    /**
     * Get all weapon types
     */
    getWeaponTypes() {
        if (!this.loaded) return [];
        return Object.keys(this.configs.weapons?.weapons || {});
    }

    /**
     * Get enemy configuration by type
     */
    getEnemy(enemyType) {
        if (!this.loaded) {
            throw new Error('Configurations not loaded yet!');
        }
        return this.configs.enemies?.enemyTypes?.[enemyType];
    }

    /**
     * Get all enemy types
     */
    getEnemyTypes() {
        if (!this.loaded) return [];
        return Object.keys(this.configs.enemies?.enemyTypes || {});
    }

    /**
     * Get spawn settings for enemies
     */
    getSpawnSettings() {
        return this.configs.enemies?.spawnSettings || {};
    }

    /**
     * Get upgrade configuration by ID
     */
    getUpgrade(upgradeId, category = 'universal') {
        if (!this.loaded) {
            throw new Error('Configurations not loaded yet!');
        }
        
        const upgrades = this.configs.upgrades;
        
        if (category === 'universal') {
            return upgrades?.universalUpgrades?.[upgradeId];
        } else {
            return upgrades?.weaponSpecificUpgrades?.[category]?.[upgradeId];
        }
    }

    /**
     * Get available upgrades for a weapon type
     */
    getWeaponUpgrades(weaponType) {
        if (!this.loaded) return [];
        
        const upgrades = this.configs.upgrades;
        const categories = upgrades?.upgradeCategories || {};
        
        // Start with universal upgrades
        let availableUpgrades = [...(categories.universal || [])];
        
        // Add weapon-specific upgrades
        if (categories[weaponType]) {
            availableUpgrades.push(...categories[weaponType]);
        }
        
        // Add projectile weapon upgrades for applicable weapons
        if (['pistol', 'shotgun', 'minigun', 'rocket'].includes(weaponType)) {
            availableUpgrades.push(...(categories.projectileWeapons || []));
        }
        
        return availableUpgrades;
    }

    /**
     * Get game setting by path (e.g., 'gameplay.player.baseSpeed')
     */
    getGameSetting(path) {
        if (!this.loaded) {
            throw new Error('Configurations not loaded yet!');
        }
        
        const pathParts = path.split('.');
        let current = this.configs.gameSettings;
        
        for (const part of pathParts) {
            if (current && typeof current === 'object') {
                current = current[part];
            } else {
                return undefined;
            }
        }
        
        return current;
    }

    /**
     * Get projectile configuration by type
     */
    getProjectileConfig(projectileType) {
        return this.getGameSetting(`projectiles.${projectileType}`) || {};
    }

    /**
     * Check if configurations are loaded
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Reload all configurations
     */
    async reload() {
        this.configs = {};
        this.loaded = false;
        await this.loadConfigurations();
    }

    /**
     * Get raw config object (for debugging)
     */
    getRawConfig(configType) {
        return this.configs[configType];
    }
}

// Create global instance
export const gameConfig = new ConfigManager();