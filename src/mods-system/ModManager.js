/**
 * ModManager - Handles mod discovery, loading, validation, and management
 * Provides a flexible system for extending ShapeSlayer with custom content
 */
export class ModManager {
    constructor() {
        this.mods = new Map(); // All discovered mods
        this.enabledMods = new Map(); // Currently enabled mods
        this.loadedMods = new Map(); // Successfully loaded mods
        this.modConfigs = {};
        this.gameVersion = "1.0.0";
        this.isInitialized = false;
        this.loadErrors = [];
    }

    /**
     * Initialize the mod system
     */
    async initialize() {
        console.log("🔧 Initializing Mod Manager...");
        
        try {
            await this.loadEnabledList();
            await this.discoverMods();
            await this.validateMods();
            await this.loadEnabledMods();
            
            this.isInitialized = true;
            console.log(`✅ Mod Manager initialized successfully. ${this.loadedMods.size} mods loaded.`);
            
        } catch (error) {
            console.error("❌ Failed to initialize Mod Manager:", error);
            this.loadErrors.push({
                type: 'initialization',
                message: error.message,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Load the enabled mods list
     */
    async loadEnabledList() {
        try {
            // First try to load from localStorage (for user changes)
            const savedConfig = localStorage.getItem('modConfigs');
            if (savedConfig) {
                this.modConfigs = JSON.parse(savedConfig);
                console.log('📂 Loaded mod configuration from localStorage');
                return;
            }
            
            // Fallback to enabled.json
            const response = await fetch('./mods/enabled.json');
            if (!response.ok) {
                throw new Error(`Failed to load enabled mods: ${response.statusText}`);
            }
            
            this.modConfigs = await response.json();
            console.log(`📋 Loaded mod configuration:`, this.modConfigs);
            
        } catch (error) {
            console.warn("⚠️ No enabled.json found, using defaults");
            this.modConfigs = { enabled: [], loadOrder: [], settings: {} };
        }
    }

    /**
     * Discover all available mods in the mods folder
     */
    async discoverMods() {
        console.log("🔍 Discovering mods...");
        
        // For now, we'll manually list known mods since we can't directory scan from browser
        // In a real implementation, this would scan the mods folder
        // Note: 'mod-template' is just a template, not a real mod
        const knownMods = ['pierce-character', 'lumen-character'];
        
        for (const modId of knownMods) {
            try {
                await this.loadModManifest(modId);
            } catch (error) {
                console.warn(`⚠️ Failed to load mod '${modId}':`, error.message);
                this.loadErrors.push({
                    type: 'discovery',
                    modId,
                    message: error.message,
                    timestamp: Date.now()
                });
            }
        }
        
        console.log(`📦 Discovered ${this.mods.size} mods`);
    }

    /**
     * Load mod manifest from mod.json
     */
    async loadModManifest(modId) {
        try {
            const response = await fetch(`./mods/${modId}/mod.json`);
            if (!response.ok) {
                throw new Error(`Manifest not found: ${response.statusText}`);
            }
            
            const manifest = await response.json();
            
            // Validate manifest structure
            this.validateManifest(manifest);
            
            // Store the mod
            this.mods.set(modId, {
                id: modId,
                manifest: manifest,
                status: 'discovered',
                loadedComponents: new Set()
            });
            
            console.log(`📄 Loaded manifest for mod '${modId}' v${manifest.version}`);
            
        } catch (error) {
            throw new Error(`Failed to load manifest for '${modId}': ${error.message}`);
        }
    }

    /**
     * Validate mod manifest structure
     */
    validateManifest(manifest) {
        const required = ['id', 'name', 'version', 'description', 'gameVersion'];
        for (const field of required) {
            if (!manifest[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate version format (basic semver check)
        if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
            throw new Error(`Invalid version format: ${manifest.version}`);
        }
    }

    /**
     * Validate mod compatibility
     */
    async validateMods() {
        console.log("✅ Validating mod compatibility...");
        
        for (const [modId, mod] of this.mods) {
            try {
                // Check game version compatibility
                if (!this.isVersionCompatible(mod.manifest.gameVersion)) {
                    throw new Error(`Incompatible game version. Requires: ${mod.manifest.gameVersion}, Current: ${this.gameVersion}`);
                }
                
                // Check dependencies
                if (mod.manifest.compatibility?.requires) {
                    for (const dependency of mod.manifest.compatibility.requires) {
                        if (!this.mods.has(dependency)) {
                            throw new Error(`Missing dependency: ${dependency}`);
                        }
                    }
                }
                
                // Check conflicts
                if (mod.manifest.compatibility?.conflicts) {
                    for (const conflict of mod.manifest.compatibility.conflicts) {
                        if (this.modConfigs.enabled.includes(conflict)) {
                            throw new Error(`Conflicts with enabled mod: ${conflict}`);
                        }
                    }
                }
                
                mod.status = 'validated';
                
            } catch (error) {
                console.warn(`⚠️ Mod '${modId}' failed validation:`, error.message);
                mod.status = 'invalid';
                mod.error = error.message;
                
                this.loadErrors.push({
                    type: 'validation',
                    modId,
                    message: error.message,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Check if a mod version is compatible with current game version
     */
    isVersionCompatible(requiredVersion) {
        // Basic version compatibility check
        // In production, you'd want proper semver comparison
        const [reqMajor, reqMinor] = requiredVersion.split('.').map(Number);
        const [gameMajor, gameMinor] = this.gameVersion.split('.').map(Number);
        
        return gameMajor === reqMajor && gameMinor >= reqMinor;
    }

    /**
     * Load enabled mods
     */
    async loadEnabledMods() {
        console.log("🚀 Loading enabled mods...");
        
        const enabledList = this.modConfigs.enabled || [];
        const loadOrder = this.modConfigs.loadOrder || enabledList;
        
        for (const modId of loadOrder) {
            if (!enabledList.includes(modId)) continue;
            
            const mod = this.mods.get(modId);
            if (!mod) {
                console.warn(`⚠️ Enabled mod '${modId}' not found`);
                continue;
            }
            
            if (mod.status !== 'validated') {
                console.warn(`⚠️ Skipping invalid mod '${modId}': ${mod.error || 'Validation failed'}`);
                continue;
            }
            
            try {
                await this.loadMod(modId);
                this.loadedMods.set(modId, mod);
                console.log(`✅ Successfully loaded mod '${modId}'`);
                
            } catch (error) {
                console.error(`❌ Failed to load mod '${modId}':`, error.message);
                this.loadErrors.push({
                    type: 'loading',
                    modId,
                    message: error.message,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Load individual mod components
     */
    async loadMod(modId) {
        const mod = this.mods.get(modId);
        const manifest = mod.manifest;
        
        // Load mod's main script if it exists
        if (manifest.files?.main) {
            try {
                const modModule = await import(`../../mods/${modId}/${manifest.files.main}`);
                if (modModule.default && typeof modModule.default.initialize === 'function') {
                    await modModule.default.initialize(this);
                    mod.loadedComponents.add('main');
                }
            } catch (error) {
                console.warn(`⚠️ Could not load main script for '${modId}': ${error.message}`);
            }
        }
        
        mod.status = 'loaded';
    }

    /**
     * Get all mods with their status
     */
    getAllMods() {
        const result = [];
        for (const [modId, mod] of this.mods) {
            result.push({
                id: modId,
                name: mod.manifest.name,
                version: mod.manifest.version,
                description: mod.manifest.description,
                author: mod.manifest.author,
                status: mod.status,
                enabled: this.modConfigs.enabled.includes(modId),
                error: mod.error || null
            });
        }
        return result;
    }

    /**
     * Enable a mod
     */
    async enableMod(modId) {
        if (!this.mods.has(modId)) {
            throw new Error(`Mod '${modId}' not found`);
        }
        
        if (!this.modConfigs.enabled.includes(modId)) {
            this.modConfigs.enabled.push(modId);
            this.modConfigs.loadOrder.push(modId);
            
            // Save configuration
            await this.saveEnabledMods();
            console.log(`✅ Enabled mod '${modId}'`);
        }
    }

    /**
     * Disable a mod
     */
    async disableMod(modId) {
        const index = this.modConfigs.enabled.indexOf(modId);
        if (index > -1) {
            this.modConfigs.enabled.splice(index, 1);
            
            const orderIndex = this.modConfigs.loadOrder.indexOf(modId);
            if (orderIndex > -1) {
                this.modConfigs.loadOrder.splice(orderIndex, 1);
            }
            
            // Remove from loaded mods
            this.loadedMods.delete(modId);
            
            // Save configuration
            await this.saveEnabledMods();
            console.log(`❌ Disabled mod '${modId}'`);
        }
    }

    /**
     * Save enabled mods configuration (simplified for demo)
     */
    async saveEnabledMods() {
        // In a browser environment, we can't write files directly
        // This would typically require a server endpoint
        // For now, just update localStorage as a fallback
        const config = {
            enabled: this.modConfigs.enabled,
            loadOrder: this.modConfigs.loadOrder,
            settings: this.modConfigs.settings
        };
        
        localStorage.setItem('modConfigs', JSON.stringify(config));
        console.log('💾 Saved mod configuration to localStorage');
    }

    /**
     * Get mod-specific content for integration with game systems
     */
    getModContent(contentType) {
        const content = [];
        
        for (const [modId, mod] of this.loadedMods) {
            if (mod.manifest.content?.[contentType]) {
                for (const item of mod.manifest.content[contentType]) {
                    content.push({
                        modId,
                        modName: mod.manifest.name,
                        contentId: item,
                        contentType
                    });
                }
            }
        }
        
        return content;
    }

    /**
     * Get loading errors for debugging
     */
    getErrors() {
        return [...this.loadErrors];
    }
}

// Global mod manager instance
export const modManager = new ModManager();