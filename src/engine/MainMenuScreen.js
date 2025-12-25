/**
 * MainMenuScreen.js - Main Menu with Splash Screen
 * Displays SHAPESLAYER™ logo and menu options
 */

import { saveManager } from './SaveManager.js';
import { gameStarter } from './GameStarter.js';

export class MainMenuScreen {
    constructor() {
        this.menuVisible = false;
        this.splashAlpha = 1.0;
        this.splashFadeSpeed = 0.01;
        this.showingSplash = true;
        this.splashTimer = 0;
        this.splashDuration = 120; // Frames to show splash (2 seconds at 60fps)
        
        // Menu state
        this.selectedIndex = 0;
        this.menuItems = [
            { label: 'Start Game', action: 'start' },
            { label: 'Options', action: 'options' },
            { label: 'Mod Tools', action: 'mods' },
            { label: 'Character Designer', action: 'designer' },
            { label: 'Credits', action: 'credits' }
        ];
        
        // Check if save file exists and add Continue option
        this.updateMenuItems();
        
        // Colors
        this.colors = {
            background: '#0a0a0a',
            title: '#ff3333',
            titleGlow: '#ff6666',
            button: '#2a2a2a',
            buttonHover: '#ff3333',
            buttonText: '#ffffff',
            trademark: '#888888'
        };
    }

    /**
     * Show the main menu
     */
    show() {
        this.menuVisible = true;
        this.showingSplash = true;
        this.splashTimer = 0;
        this.splashAlpha = 1.0;
        
        // Update menu items based on save file
        this.updateMenuItems();
        
        // Hide game canvas, show menu
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.display = 'none';
        
        const ui = document.getElementById('ui');
        if (ui) ui.style.display = 'none';
        
        this.createMenuHTML();
    }

    /**
     * Update menu items based on save file existence
     */
    updateMenuItems() {
        const hasSave = saveManager.hasSaveFile();
        
        if (hasSave) {
            // Add Continue as first option if save exists
            this.menuItems = [
                { label: 'Continue', action: 'continue' },
                { label: 'New Game', action: 'start' },
                { label: 'Options', action: 'options' },
                { label: 'Mod Tools', action: 'mods' },
                { label: 'Character Designer', action: 'designer' },
                { label: 'Credits', action: 'credits' }
            ];
        } else {
            this.menuItems = [
                { label: 'Start Game', action: 'start' },
                { label: 'Options', action: 'options' },
                { label: 'Mod Tools', action: 'mods' },
                { label: 'Character Designer', action: 'designer' },
                { label: 'Credits', action: 'credits' }
            ];
        }
    }

    /**
     * Hide the main menu
     */
    hide() {
        this.menuVisible = false;
        const menuContainer = document.getElementById('mainMenuContainer');
        if (menuContainer) {
            menuContainer.remove();
        }
        
        // Show game canvas and UI
        const canvas = document.getElementById('gameCanvas');
        if (canvas) canvas.style.display = 'block';
        
        const ui = document.getElementById('ui');
        if (ui) ui.style.display = 'block';
    }

    /**
     * Create the menu HTML structure
     */
    createMenuHTML() {
        // Remove existing menu if present
        const existing = document.getElementById('mainMenuContainer');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'mainMenuContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${this.colors.background};
            z-index: 200;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
        `;

        // Splash Screen
        const splash = document.createElement('div');
        splash.id = 'splashScreen';
        splash.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: #000000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: opacity 0.5s;
        `;

        const title = document.createElement('h1');
        title.style.cssText = `
            font-size: 72px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: ${this.colors.title};
            text-shadow: 
                0 0 10px ${this.colors.titleGlow},
                0 0 20px ${this.colors.titleGlow},
                0 0 30px ${this.colors.titleGlow},
                4px 4px 0px #000000;
            letter-spacing: 8px;
            margin: 0;
            animation: pulse 2s ease-in-out infinite;
        `;
        title.textContent = 'SHAPESLAYER';

        const trademark = document.createElement('span');
        trademark.style.cssText = `
            font-size: 16px;
            color: ${this.colors.trademark};
            margin-top: 10px;
        `;
        trademark.textContent = '™';

        splash.appendChild(title);
        splash.appendChild(trademark);

        // Menu Container (initially hidden)
        const menu = document.createElement('div');
        menu.id = 'mainMenu';
        menu.style.cssText = `
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            opacity: 0;
            transition: opacity 0.5s;
        `;

        // Menu Title
        const menuTitle = document.createElement('h2');
        menuTitle.style.cssText = `
            font-size: 48px;
            color: ${this.colors.title};
            text-shadow: 
                0 0 10px ${this.colors.titleGlow},
                3px 3px 0px #000000;
            letter-spacing: 4px;
            margin-bottom: 40px;
        `;
        menuTitle.textContent = 'SHAPESLAYER™';
        menu.appendChild(menuTitle);

        // Menu Buttons
        this.menuItems.forEach((item, index) => {
            const button = document.createElement('button');
            button.className = 'menu-button';
            button.style.cssText = `
                font-size: 24px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: ${this.colors.buttonText};
                background: ${this.colors.button};
                border: 3px solid ${this.colors.title};
                padding: 15px 60px;
                cursor: pointer;
                transition: all 0.2s;
                letter-spacing: 2px;
                text-transform: uppercase;
            `;
            button.textContent = item.label;

            // Hover effects
            button.addEventListener('mouseenter', () => {
                button.style.background = this.colors.buttonHover;
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = `0 0 20px ${this.colors.titleGlow}`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = this.colors.button;
                button.style.transform = 'scale(1)';
                button.style.boxShadow = 'none';
            });

            button.addEventListener('click', () => this.handleMenuAction(item.action));

            menu.appendChild(button);
        });

        container.appendChild(splash);
        container.appendChild(menu);
        document.body.appendChild(container);

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { text-shadow: 
                    0 0 10px ${this.colors.titleGlow},
                    0 0 20px ${this.colors.titleGlow},
                    0 0 30px ${this.colors.titleGlow},
                    4px 4px 0px #000000; }
                50% { text-shadow: 
                    0 0 20px ${this.colors.titleGlow},
                    0 0 40px ${this.colors.titleGlow},
                    0 0 60px ${this.colors.titleGlow},
                    4px 4px 0px #000000; }
            }
        `;
        document.head.appendChild(style);

        // Auto-transition from splash to menu after duration
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                menu.style.display = 'flex';
                setTimeout(() => {
                    menu.style.opacity = '1';
                }, 50);
            }, 500);
        }, this.splashDuration * 16.67); // Convert frames to ms
    }

    /**
     * Handle menu button actions
     */
    handleMenuAction(action) {
        console.log(`🎮 Menu action: ${action}`);

        switch (action) {
            case 'continue':
                this.hide();
                // Load saved game
                const loaded = gameStarter.loadSavedGame();
                if (!loaded) {
                    alert('❌ Failed to load save file!');
                    this.show();
                }
                break;

            case 'start':
                this.hide();
                // Show character selection for new game
                if (window.characterSelectionScreen) {
                    window.characterSelectionScreen.showCharacterSelection();
                }
                break;

            case 'options':
                this.showOptions();
                break;

            case 'mods':
                this.hide();
                // Show mod manager
                if (window.modManagerScreen) {
                    window.modManagerScreen.show();
                }
                break;

            case 'designer':
                this.hide();
                // Show character designer
                if (window.characterSelectionScreen) {
                    window.characterSelectionScreen.showCharacterSelection();
                    setTimeout(() => {
                        window.characterSelectionScreen.showCharacterCreation();
                    }, 100);
                }
                break;

            case 'credits':
                this.showCredits();
                break;
        }
    }

    /**
     * Show options screen (placeholder)
     */
    showOptions() {
        alert('⚙️ Options menu coming soon!\n\nFeatures planned:\n- Sound volume\n- Graphics quality\n- Controls remapping\n- Auto-save settings');
    }

    /**
     * Show credits screen
     */
    showCredits() {
        alert('🎮 SHAPESLAYER™\n\nA survival shooter game\n\nLicense: MIT\nVersion: 1.2.5.1\n\nMade with ❤️ on December 25, 2025\n Made by Ruefox and assisted by passion and assistance :3.');
    }
}

// Create singleton instance
export const mainMenuScreen = new MainMenuScreen();
