/**
 * CharacterManager - Handles character creation, traits, and save/load functionality
 */
import { gameConfig } from './ConfigManager.js';

export class CharacterManager {
    constructor() {
        this.characters = {};
        this.traits = {};
        this.customCharacters = {};
        this.currentCharacter = null;
        this.loaded = false;
    }

    /**
     * Load character and trait configurations
     */
    async loadConfigurations() {
        try {
            const [charactersResponse, traitsResponse] = await Promise.all([
                fetch('./data/characters.json'),
                fetch('./data/traits.json')
            ]);

            if (!charactersResponse.ok) {
                throw new Error(`Failed to load characters: ${charactersResponse.statusText}`);
            }
            if (!traitsResponse.ok) {
                throw new Error(`Failed to load traits: ${traitsResponse.statusText}`);
            }

            const charactersData = await charactersResponse.json();
            const traitsData = await traitsResponse.json();

            this.characters = charactersData.defaultCharacters;
            this.traits = traitsData.traits;
            this.traitCategories = traitsData.traitCategories;
            this.rarityColors = traitsData.rarityColors;
            this.maxTraits = charactersData.maxTraits;
            this.traitPointBudget = charactersData.traitPointBudget;
            this.maxTraitPoints = charactersData.maxTraitPoints;

            // Load custom characters from localStorage
            this.loadCustomCharacters();

            // Load mod characters
            await this.loadModCharacters();

            this.loaded = true;
            console.log('✅ Loaded character and trait configurations');
            
        } catch (error) {
            console.error('❌ Failed to load character configurations:', error);
            throw error;
        }
    }

    /**
     * Get all available characters (default + custom)
     */
    getAllCharacters() {
        return { ...this.characters, ...this.customCharacters };
    }

    /**
     * Get character by ID
     */
    getCharacter(characterId) {
        return this.getAllCharacters()[characterId];
    }

    /**
     * Get trait by ID
     */
    getTrait(traitId) {
        return this.traits[traitId];
    }

    /**
     * Get all traits in a category
     */
    getTraitsByCategory(category) {
        return Object.entries(this.traits)
            .filter(([_, trait]) => trait.category === category)
            .reduce((acc, [id, trait]) => {
                acc[id] = trait;
                return acc;
            }, {});
    }

    /**
     * Validate trait combination for conflicts and point budget
     */
    validateTraitCombination(traitIds) {
        const errors = [];
        let totalPoints = 0;

        // Check point budget
        for (const traitId of traitIds) {
            const trait = this.getTrait(traitId);
            if (trait) {
                const cost = this.traitPointBudget[trait.rarity] || 0;
                totalPoints += cost;
            }
        }

        if (totalPoints > this.maxTraitPoints) {
            errors.push(`Trait combination costs ${totalPoints} points, but maximum is ${this.maxTraitPoints}`);
        }

        // Check conflicts
        for (const traitId of traitIds) {
            const trait = this.getTrait(traitId);
            if (trait && trait.conflicts) {
                const conflictingTraits = traitIds.filter(id => trait.conflicts.includes(id));
                if (conflictingTraits.length > 0) {
                    errors.push(`${trait.name} conflicts with: ${conflictingTraits.map(id => this.getTrait(id).name).join(', ')}`);
                }
            }
        }

        // Check maximum trait count
        if (traitIds.length > this.maxTraits) {
            errors.push(`Maximum ${this.maxTraits} traits allowed, but ${traitIds.length} selected`);
        }

        return {
            valid: errors.length === 0,
            errors,
            totalPoints,
            remainingPoints: this.maxTraitPoints - totalPoints
        };
    }

    /**
     * Create a new custom character
     */
    createCharacter(characterData) {
        const validation = this.validateTraitCombination(characterData.traits || []);
        
        if (!validation.valid) {
            throw new Error(`Invalid character: ${validation.errors.join(', ')}`);
        }

        // Ensure required fields
        const character = {
            name: characterData.name || 'Custom Character',
            description: characterData.description || 'A custom survivor',
            icon: characterData.icon || '🧑',
            startingWeapon: characterData.startingWeapon || 'pistol',
            startingStats: {
                health: characterData.startingStats?.health || 100,
                speed: characterData.startingStats?.speed || 4,
                xp: 0,
                level: 1
            },
            traits: characterData.traits || [],
            colors: {
                primary: characterData.colors?.primary || '#00ccff',
                secondary: characterData.colors?.secondary || '#ffffff'
            },
            custom: true,
            created: Date.now()
        };

        // Generate unique ID
        const characterId = this.generateCharacterId(character.name);
        this.customCharacters[characterId] = character;
        
        // Save to localStorage
        this.saveCustomCharacters();
        
        console.log(`✅ Created custom character: ${character.name}`);
        return { id: characterId, character };
    }

    /**
     * Generate unique character ID
     */
    generateCharacterId(name) {
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        let id = base;
        let counter = 1;
        
        while (this.getAllCharacters()[id]) {
            id = `${base}_${counter}`;
            counter++;
        }
        
        return id;
    }

    /**
     * Apply character traits to player
     */
    applyCharacterTraits(player, character) {
        if (!character || !character.traits) return;

        for (const traitId of character.traits) {
            const trait = this.getTrait(traitId);
            if (trait && trait.effects) {
                this.applyTraitEffects(player, trait);
                console.log(`Applied trait: ${trait.name}`);
            }
        }
    }

    /**
     * Apply individual trait effects
     */
    applyTraitEffects(player, trait) {
        const effects = trait.effects;

        // Apply stat modifiers
        if (effects.speedMultiplier) {
            player.baseSpeed *= effects.speedMultiplier;
        }
        if (effects.speedReduction) {
            player.baseSpeed *= (1 - effects.speedReduction);
        }
        if (effects.xpMultiplier && player.weapon) {
            player.weapon.xpMultiplier *= effects.xpMultiplier;
        }
        if (effects.gemRangeMultiplier && player.weapon) {
            player.weapon.gemAbsorptionRange *= effects.gemRangeMultiplier;
        }

        // Store trait-specific effects for later use
        if (!player.traitEffects) {
            player.traitEffects = {};
        }
        
        // Store effects that need to be checked during gameplay
        if (effects.damageMultiplier) player.traitEffects.damageMultiplier = (player.traitEffects.damageMultiplier || 1) * effects.damageMultiplier;
        if (effects.damageReduction) player.traitEffects.damageReduction = (player.traitEffects.damageReduction || 0) + effects.damageReduction;
        if (effects.dodgeChance) player.traitEffects.dodgeChance = (player.traitEffects.dodgeChance || 0) + effects.dodgeChance;
        if (effects.lifeSteal) player.traitEffects.lifeSteal = (player.traitEffects.lifeSteal || 0) + effects.lifeSteal;
        if (effects.explosionChance) player.traitEffects.explosionChance = effects.explosionChance;
        if (effects.explosionRadius) player.traitEffects.explosionRadius = effects.explosionRadius;
    }

    /**
     * Save custom characters to localStorage
     */
    saveCustomCharacters() {
        try {
            localStorage.setItem('shapeslayer_custom_characters', JSON.stringify(this.customCharacters));
        } catch (error) {
            console.warn('Failed to save custom characters:', error);
        }
    }

    /**
     * Load custom characters from localStorage
     */
    loadCustomCharacters() {
        try {
            const saved = localStorage.getItem('shapeslayer_custom_characters');
            if (saved) {
                this.customCharacters = JSON.parse(saved);
                console.log(`Loaded ${Object.keys(this.customCharacters).length} custom characters`);
            }
        } catch (error) {
            console.warn('Failed to load custom characters:', error);
            this.customCharacters = {};
        }
    }

    /**
     * Load characters from enabled mods
     */
    async loadModCharacters() {
        try {
            console.log('🔍 Loading mod characters...');
            
            // Import modManager here to avoid circular dependency
            const { modManager } = await import('../mods-system/ModManager.js');
            
            if (!modManager.isInitialized) {
                console.log('⚠️ ModManager not initialized, skipping mod character loading');
                return;
            }

            console.log('📦 Found', modManager.loadedMods.size, 'loaded mods');

            let modCharactersLoaded = 0;

            for (const [modId, mod] of modManager.loadedMods) {
                const manifest = mod.manifest;
                console.log(`🔍 Checking mod '${modId}' for characters...`, manifest.content.characters);
                
                if (manifest.content.characters && manifest.content.characters.length > 0) {
                    try {
                        // Load character definition from mod
                        console.log(`📥 Loading character data from ./mods/${modId}/character.json`);
                        const characterResponse = await fetch(`./mods/${modId}/character.json`);
                        if (characterResponse.ok) {
                            const characterData = await characterResponse.json();
                            console.log('📊 Character data loaded:', characterData);
                            
                            // Add mod characters to the character list
                            for (const [characterId, character] of Object.entries(characterData)) {
                                if (manifest.content.characters.includes(characterId)) {
                                    // Mark as mod character and add source info
                                    character.isModCharacter = true;
                                    character.modId = modId;
                                    character.modName = manifest.name;
                                    
                                    this.characters[characterId] = character;
                                    modCharactersLoaded++;
                                    
                                    console.log(`📦 Loaded mod character '${characterId}' from '${manifest.name}'`);
                                }
                            }
                        } else {
                            console.warn(`❌ Failed to fetch character.json from mod '${modId}': ${characterResponse.status}`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Failed to load characters from mod '${modId}':`, error);
                    }
                }
            }

            if (modCharactersLoaded > 0) {
                console.log(`✅ Loaded ${modCharactersLoaded} characters from mods`);
                console.log('🎮 All characters now available:', Object.keys(this.characters));
            } else {
                console.log('ℹ️ No mod characters to load');
            }

        } catch (error) {
            console.warn('Failed to load mod characters:', error);
        }
    }

    /**
     * Delete custom character
     */
    deleteCharacter(characterId) {
        if (this.customCharacters[characterId]) {
            delete this.customCharacters[characterId];
            this.saveCustomCharacters();
            console.log(`Deleted custom character: ${characterId}`);
            return true;
        }
        return false;
    }

    /**
     * Export character as JSON
     */
    exportCharacter(characterId) {
        const character = this.getCharacter(characterId);
        if (character) {
            const exportData = {
                character,
                exported: Date.now(),
                version: '1.0'
            };
            return JSON.stringify(exportData, null, 2);
        }
        return null;
    }

    /**
     * Import character from JSON
     */
    importCharacter(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            if (importData.character) {
                return this.createCharacter(importData.character);
            }
            throw new Error('Invalid character data');
        } catch (error) {
            throw new Error(`Failed to import character: ${error.message}`);
        }
    }

    /**
     * Check if configurations are loaded
     */
    isLoaded() {
        return this.loaded;
    }
}

// Create global instance
export const characterManager = new CharacterManager();