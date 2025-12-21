/**
 * CharacterSelectionScreen - Handles character selection and creation UI
 */
import { characterManager } from './CharacterManager.js';
import { gameConfig } from './ConfigManager.js';

export class CharacterSelectionScreen {
    constructor() {
        this.selectedTraits = [];
        this.currentTraitCategory = 'combat';
        this.selectedCharacter = null;
    }

    /**
     * Show the character selection screen
     */
    showCharacterSelection() {
        const characterSelection = document.getElementById('characterSelection');
        const weaponSelection = document.getElementById('weaponSelection');
        
        if (characterSelection) characterSelection.style.display = 'block';
        if (weaponSelection) weaponSelection.style.display = 'none';
        
        this.showCharacterTab('default');
    }

    /**
     * Show character creation screen
     */
    showCharacterCreation() {
        const characterCreation = document.getElementById('characterCreation');
        const characterSelection = document.getElementById('characterSelection');
        
        if (characterCreation) characterCreation.style.display = 'block';
        if (characterSelection) characterSelection.style.display = 'none';
        
        this.initializeCharacterCreation();
    }

    /**
     * Initialize character creation form
     */
    initializeCharacterCreation() {
        // Reset form
        document.getElementById('characterName').value = '';
        document.getElementById('characterDescription').value = '';
        document.getElementById('characterIcon').value = '🧑';
        document.getElementById('characterPrimaryColor').value = '#00ccff';
        this.selectedTraits = [];
        this.updateTraitBudget();

        // Populate weapon dropdown
        this.populateWeaponDropdown();

        // Show combat traits by default
        this.showTraitCategory('combat');
    }

    /**
     * Populate weapon dropdown
     */
    populateWeaponDropdown() {
        const weaponSelect = document.getElementById('characterWeapon');
        if (!weaponSelect) return;

        weaponSelect.innerHTML = '';
        const weaponTypes = gameConfig.getWeaponTypes();
        
        for (const weaponType of weaponTypes) {
            const weapon = gameConfig.getWeapon(weaponType);
            const option = document.createElement('option');
            option.value = weaponType;
            option.textContent = `${weapon.visuals?.icon || '🔫'} ${weapon.name}`;
            weaponSelect.appendChild(option);
        }
    }

    /**
     * Show characters by tab
     */
    showCharacterTab(tabType) {
        const characterList = document.getElementById('characterList');
        if (!characterList) return;

        // Update tab buttons
        const defaultBtn = document.getElementById('defaultCharTab');
        const customBtn = document.getElementById('customCharTab');
        
        if (tabType === 'default') {
            if (defaultBtn) {
                defaultBtn.style.background = '#00ff88';
                defaultBtn.style.color = 'black';
            }
            if (customBtn) {
                customBtn.style.background = '#666';
                customBtn.style.color = 'white';
            }
            this.displayCharacters(characterManager.characters, false);
        } else {
            if (customBtn) {
                customBtn.style.background = '#00ff88';
                customBtn.style.color = 'black';
            }
            if (defaultBtn) {
                defaultBtn.style.background = '#666';
                defaultBtn.style.color = 'white';
            }
            this.displayCharacters(characterManager.customCharacters, true);
        }
    }

    /**
     * Display characters in the list
     */
    displayCharacters(characters, isCustom) {
        const characterList = document.getElementById('characterList');
        if (!characterList) return;

        characterList.innerHTML = '';

        if (Object.keys(characters).length === 0) {
            const message = document.createElement('div');
            message.style.cssText = 'color: #666; font-style: italic; padding: 40px; width: 100%;';
            message.textContent = isCustom ? 'No custom characters created yet.' : 'No default characters available.';
            characterList.appendChild(message);
            return;
        }

        Object.entries(characters).forEach(([id, character]) => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            characterCard.style.borderColor = character.colors?.primary || '#666';
            
            // Get trait names for display
            const traitNames = character.traits?.map(traitId => {
                const trait = characterManager.getTrait(traitId);
                return trait ? trait.name : traitId;
            }).join(', ') || 'None';

            characterCard.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 10px;">${character.icon}</div>
                <h3 style="color: ${character.colors?.primary || '#ffffff'}; margin: 10px 0;">${character.name}</h3>
                <p style="font-size: 12px; color: #aaa; margin-bottom: 15px;">${character.description}</p>
                <div style="font-size: 11px; color: #ccc;">
                    <div><strong>Weapon:</strong> ${this.getWeaponName(character.startingWeapon)}</div>
                    <div style="margin-top: 5px;"><strong>Traits:</strong> ${traitNames}</div>
                </div>
                ${isCustom ? `<button onclick="characterSelectionScreen.deleteCharacter('${id}')" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-top: 10px; font-size: 10px;">Delete</button>` : ''}
            `;

            characterCard.onclick = () => this.selectCharacter(id);
            characterList.appendChild(characterCard);
        });
    }

    /**
     * Get weapon display name
     */
    getWeaponName(weaponType) {
        const weapon = gameConfig.getWeapon(weaponType);
        return weapon ? `${weapon.visuals?.icon || ''} ${weapon.name}` : weaponType;
    }

    /**
     * Show traits by category
     */
    showTraitCategory(category) {
        this.currentTraitCategory = category;
        
        // Update category buttons
        ['combat', 'mobility', 'utility', 'special'].forEach(cat => {
            const btn = document.getElementById(`${cat}TraitBtn`);
            if (btn) {
                btn.style.background = cat === category ? '#00ff88' : '#666';
                btn.style.color = cat === category ? 'black' : 'white';
            }
        });

        this.displayTraits(category);
    }

    /**
     * Display traits for category
     */
    displayTraits(category) {
        const traitList = document.getElementById('traitList');
        if (!traitList) return;

        traitList.innerHTML = '';
        const traits = characterManager.getTraitsByCategory(category);

        Object.entries(traits).forEach(([traitId, trait]) => {
            const traitCard = document.createElement('div');
            traitCard.className = 'trait-card';
            
            const isSelected = this.selectedTraits.includes(traitId);
            const cost = characterManager.traitPointBudget[trait.rarity] || 0;
            const canAfford = this.getRemainingPoints() >= cost || isSelected;
            const hasConflicts = this.hasTraitConflicts(traitId);
            const atMaxTraits = this.selectedTraits.length >= characterManager.maxTraits && !isSelected;

            if (isSelected) {
                traitCard.classList.add('selected');
            } else if (!canAfford || hasConflicts || atMaxTraits) {
                traitCard.classList.add('disabled');
            }

            const rarityColor = characterManager.rarityColors[trait.rarity] || '#ffffff';

            traitCard.innerHTML = `
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: bold; color: ${rarityColor};">${trait.name}</span>
                    <span class="trait-rarity" style="color: ${rarityColor};">${trait.rarity} (${cost}pts)</span>
                </div>
                <div style="font-size: 12px; color: #ccc; margin-bottom: 8px;">${trait.description}</div>
                ${hasConflicts ? '<div style="font-size: 10px; color: #ff6666;">⚠️ Conflicts with selected traits</div>' : ''}
            `;

            traitCard.onclick = () => this.toggleTrait(traitId);
            traitList.appendChild(traitCard);
        });
    }

    /**
     * Check if trait has conflicts with selected traits
     */
    hasTraitConflicts(traitId) {
        const trait = characterManager.getTrait(traitId);
        if (!trait || !trait.conflicts) return false;
        
        return trait.conflicts.some(conflictId => this.selectedTraits.includes(conflictId));
    }

    /**
     * Toggle trait selection
     */
    toggleTrait(traitId) {
        if (this.selectedTraits.includes(traitId)) {
            // Remove trait
            this.selectedTraits = this.selectedTraits.filter(id => id !== traitId);
        } else {
            // Add trait if valid
            const validation = characterManager.validateTraitCombination([...this.selectedTraits, traitId]);
            if (validation.valid) {
                this.selectedTraits.push(traitId);
            } else {
                alert(`Cannot select trait: ${validation.errors.join(', ')}`);
                return;
            }
        }

        this.updateTraitBudget();
        this.displayTraits(this.currentTraitCategory);
    }

    /**
     * Update trait budget display
     */
    updateTraitBudget() {
        const remainingPointsSpan = document.getElementById('remainingPoints');
        const selectedCountSpan = document.getElementById('selectedTraitCount');

        if (remainingPointsSpan) {
            remainingPointsSpan.textContent = this.getRemainingPoints();
        }
        if (selectedCountSpan) {
            selectedCountSpan.textContent = this.selectedTraits.length;
        }
    }

    /**
     * Get remaining trait points
     */
    getRemainingPoints() {
        let usedPoints = 0;
        for (const traitId of this.selectedTraits) {
            const trait = characterManager.getTrait(traitId);
            if (trait) {
                usedPoints += characterManager.traitPointBudget[trait.rarity] || 0;
            }
        }
        return characterManager.maxTraitPoints - usedPoints;
    }

    /**
     * Save custom character
     */
    saveCustomCharacter() {
        try {
            const characterData = {
                name: document.getElementById('characterName').value || 'Custom Character',
                description: document.getElementById('characterDescription').value || 'A custom survivor',
                icon: document.getElementById('characterIcon').value || '🧑',
                startingWeapon: document.getElementById('characterWeapon').value || 'pistol',
                traits: this.selectedTraits,
                colors: {
                    primary: document.getElementById('characterPrimaryColor').value || '#00ccff',
                    secondary: '#ffffff'
                }
            };

            const result = characterManager.createCharacter(characterData);
            alert(`Character "${result.character.name}" created successfully!`);
            this.cancelCharacterCreation();
            
        } catch (error) {
            alert(`Failed to create character: ${error.message}`);
        }
    }

    /**
     * Cancel character creation
     */
    cancelCharacterCreation() {
        const characterCreation = document.getElementById('characterCreation');
        const characterSelection = document.getElementById('characterSelection');
        
        if (characterCreation) characterCreation.style.display = 'none';
        if (characterSelection) characterSelection.style.display = 'block';
    }

    /**
     * Select character and start game
     */
    selectCharacter(characterId) {
        this.selectedCharacter = characterId;
        const character = characterManager.getCharacter(characterId);
        
        if (character) {
            console.log('Selected character:', character);
            
            // Hide character selection
            const characterSelection = document.getElementById('characterSelection');
            if (characterSelection) characterSelection.style.display = 'none';
            
            // Trigger weapon selection (or skip if we want to start directly)
            if (window.selectWeapon) {
                window.selectWeapon(character.startingWeapon, character);
            }
        }
    }

    /**
     * Delete custom character
     */
    deleteCharacter(characterId) {
        if (confirm('Are you sure you want to delete this character?')) {
            if (characterManager.deleteCharacter(characterId)) {
                this.showCharacterTab('custom'); // Refresh the custom character list
            }
        }
    }
}

// Global functions for HTML onclick handlers
window.showCharacterTab = function(tabType) {
    if (window.characterSelectionScreen) {
        window.characterSelectionScreen.showCharacterTab(tabType);
    }
};

window.showCharacterCreation = function() {
    if (window.characterSelectionScreen) {
        window.characterSelectionScreen.showCharacterCreation();
    }
};

window.showTraitCategory = function(category) {
    if (window.characterSelectionScreen) {
        window.characterSelectionScreen.showTraitCategory(category);
    }
};

window.saveCustomCharacter = function() {
    if (window.characterSelectionScreen) {
        window.characterSelectionScreen.saveCustomCharacter();
    }
};

window.cancelCharacterCreation = function() {
    if (window.characterSelectionScreen) {
        window.characterSelectionScreen.cancelCharacterCreation();
    }
};