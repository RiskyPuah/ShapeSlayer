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
        
        if (characterSelection) {
            characterSelection.classList.add('visible');
            characterSelection.style.display = 'block';
        }
        if (weaponSelection) weaponSelection.style.display = 'none';
        
        this.showCharacterTab('default');
    }

    /**
     * Refresh character selection (useful after mod loading)
     */
    refreshCharacterSelection() {
        this.showCharacterTab('default');
        console.log("📋 Character selection refreshed");
    }

    /**
     * Show character creation screen
     */
    showCharacterCreation() {
        const characterCreation = document.getElementById('characterCreation');
        const characterSelection = document.getElementById('characterSelection');
        
        if (characterCreation) {
            characterCreation.style.display = 'block';
            characterCreation.innerHTML = `
                <h1 style="margin-top: 10%;">Character Creation</h1>
                <div style="margin: 50px auto; max-width: 600px; text-align: center;">
                    <div style="background: rgba(0, 0, 0, 0.8); padding: 40px; border-radius: 10px; border: 2px solid #666;">
                        <h2 style="color: #ff8800; margin-bottom: 30px;">🚧 Coming Soon!</h2>
                        <p style="color: #ccc; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                            Character creation is currently under development. You can create custom characters by:
                        </p>
                        <ul style="color: #aaa; text-align: left; max-width: 400px; margin: 0 auto 30px auto;">
                            <li>Editing character files directly in the /data folder</li>
                            <li>Using the mod system to add new characters</li>
                            <li>Creating character mods like the Pierce character example</li>
                        </ul>
                        <p style="color: #888; font-size: 14px; margin-bottom: 30px;">
                            For now, enjoy the default characters and Pierce mod character!
                        </p>
                        <button onclick="characterSelectionScreen.backToCharacterSelection()" 
                                style="padding: 15px 30px; background: #006600; color: white; border: 1px solid #00aa00; cursor: pointer; border-radius: 5px; font-size: 16px;">
                            Back to Character Selection
                        </button>
                    </div>
                </div>
            `;
        }
        if (characterSelection) characterSelection.style.display = 'none';
    }

    /**
     * Return to character selection screen
     */
    backToCharacterSelection() {
        const characterCreation = document.getElementById('characterCreation');
        const characterSelection = document.getElementById('characterSelection');
        
        if (characterCreation) characterCreation.style.display = 'none';
        if (characterSelection) characterSelection.style.display = 'block';
        
        this.showCharacterTab('default');
    }

    /**
     * Show character tab (default or custom)
     */
    showCharacterTab(tabType) {
        const characterList = document.getElementById('characterList');
        if (!characterList) return;

        // Update tab buttons
        const defaultBtn = document.getElementById('defaultCharTab');
        const customBtn = document.getElementById('customCharTab');
        
        // Reset tab styles
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (tabType === 'default') {
            if (defaultBtn) defaultBtn.classList.add('active');
            this.displayCharacters(characterManager.characters, false);
        } else {
            if (customBtn) customBtn.classList.add('active');
            this.displayCharacters(characterManager.customCharacters, true);
        }
    }

    /**
     * Display characters in the grid
     */
    displayCharacters(characters, isCustom) {
        const characterList = document.getElementById('characterList');
        if (!characterList) return;

        characterList.innerHTML = '';

        if (Object.keys(characters).length === 0) {
            const message = document.createElement('div');
            message.style.cssText = 'color: #999; font-size: 18px; padding: 50px; text-align: center;';
            message.textContent = isCustom ? 'No custom characters created yet' : 'No default characters available';
            characterList.appendChild(message);
            return;
        }

        // Create character cards
        for (const [characterId, character] of Object.entries(characters)) {
            const card = this.createCharacterCard(characterId, character, isCustom);
            characterList.appendChild(card);
        }
    }

    /**
     * Create a character card element
     */
    createCharacterCard(characterId, character, isCustom) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = characterId;
        
        // Add mod badge if this is a mod character
        let modBadge = '';
        if (character.isModCharacter) {
            modBadge = `<div class="mod-badge">🔧 MOD: ${character.modName}</div>`;
        }
        
        card.innerHTML = `
            ${modBadge}
            <div class="character-icon">${character.icon || '👤'}</div>
            <h3>${character.name}</h3>
            <p style="color: #aaa; font-size: 12px;">${character.description || 'No description available'}</p>
            <div style="margin-top: 10px;">
                <strong>Weapon:</strong> ${character.startingWeapon || 'Unknown'}
            </div>
        `;
        
        // Add click handler
        card.onclick = () => this.selectCharacterCard(card, characterId, character);
        
        return card;
    }

    /**
     * Handle character card selection
     */
    selectCharacterCard(cardElement, characterId, character) {
        // Remove selection from other cards
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        
        // Select this card
        cardElement.classList.add('selected');
        this.selectedCharacter = {
            id: characterId,
            data: character
        };
        
        // Start the game immediately with this character
        console.log('🎮 Starting game with character:', characterId);
        
        // Hide character selection
        const characterSelection = document.getElementById('characterSelection');
        if (characterSelection) characterSelection.style.display = 'none';
        
        // Start the game with selected character
        if (window.selectWeapon) {
            window.selectWeapon(character.startingWeapon, character);
        }
    }

    /**
     * Update character information display
     */
    updateCharacterInfo(character) {
        const nameEl = document.getElementById('characterName');
        const descEl = document.getElementById('characterDescription');
        const traitsEl = document.getElementById('characterTraits');
        
        if (nameEl) nameEl.textContent = character.name;
        if (descEl) descEl.textContent = character.description || 'No description available';
        
        if (traitsEl) {
            traitsEl.innerHTML = '';
            if (character.traits && character.traits.length > 0) {
                character.traits.forEach(traitId => {
                    const trait = characterManager.getTrait(traitId);
                    if (trait) {
                        const traitSpan = document.createElement('span');
                        traitSpan.className = 'character-trait';
                        traitSpan.textContent = trait.name;
                        traitsEl.appendChild(traitSpan);
                    }
                });
            }
        }
    }

    /**
     * Select the current character and start the game
     */
    selectCharacter() {
        if (!this.selectedCharacter) {
            alert('Please select a character first!');
            return;
        }

        console.log('🎮 Starting game with character:', this.selectedCharacter.id);
        
        // Hide character selection
        const characterSelection = document.getElementById('characterSelection');
        if (characterSelection) characterSelection.style.display = 'none';
        
        // Start the game with selected character
        if (window.selectWeapon) {
            window.selectWeapon(this.selectedCharacter.data.startingWeapon, this.selectedCharacter.data);
        }
    }

    /**
     * Initialize character creation (placeholder)
     */
    initializeCharacterCreation() {
        // Placeholder - character creation will be implemented later
        console.log('Character creation system - coming soon!');
    }
}

// Export instance for global access
export const characterSelectionScreen = new CharacterSelectionScreen();

// Make it globally available
window.characterSelectionScreen = characterSelectionScreen;