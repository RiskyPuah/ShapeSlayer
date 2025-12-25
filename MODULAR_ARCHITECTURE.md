# ShapeSlayer - Modular Architecture

## Main.js Refactoring (Completed)

The game engine has been refactored from a monolithic `main.js` (600+ lines) into smaller, focused modules:

### New Module Structure

#### 📦 **main.js** (40 lines)
- **Purpose**: Entry point that coordinates all systems
- **Responsibilities**: 
  - Initialize game configuration
  - Expose global functions
  - Start game loop
- **Dependencies**: Imports all other modules

#### 🎯 **GameInitializer.js**
- **Purpose**: Handles game configuration and mod loading
- **Key Functions**:
  - `loadGameConfig()` - Load all configurations
  - `isConfigLoaded()` - Check if ready to start
- **What it does**: Loads configs, mods, characters before game starts

#### 🔄 **GameLoop.js**
- **Purpose**: Main update/draw loop
- **Key Functions**:
  - `update()` - Update all game entities
  - `draw()` - Render everything
  - `updateEnemies()`, `updateBullets()`, etc. - Specific update logic
- **What it does**: Core game loop separated into logical update methods

#### 🚀 **GameStarter.js**
- **Purpose**: Handles character/weapon selection and game start
- **Key Functions**:
  - `startGame(weaponType, character)` - Initialize player and start
  - `createWeapon()` - Handle weapon creation
  - `applyCharacterTraits()` - Apply character bonuses
- **What it does**: Bridges character selection to actual gameplay

#### 🎮 **EventHandlers.js**
- **Purpose**: Handles all DOM events and user input
- **Key Functions**:
  - `setupEventListeners()` - Initialize all events
  - `chooseUpgrade()` - Level up system
  - `spawnPowerup()` - Debug functions
- **What it does**: Manages keyboard, mouse, and UI interactions

#### 🖥️ **MainMenuScreen.js** *(Added v1.3.0)*
- **Purpose**: Professional main menu with splash screen
- **Key Functions**:
  - `show()` - Display menu with splash animation
  - `hide()` - Hide menu and restore game UI
  - `createMenuHTML()` - Build menu structure
  - `handleMenuAction()` - Process menu button clicks
- **What it does**: Provides SHAPESLAYER™ splash (2s), menu navigation, Continue button if save exists

#### 💾 **SaveManager.js** *(Added v1.3.0)*
- **Purpose**: Game state persistence system
- **Key Functions**:
  - `saveGame()` - Save complete game state to localStorage
  - `loadGame()` - Restore saved game state
  - `startAutoSave()` - Enable auto-save every 30 seconds
  - `exportSaveFile()` / `importSaveFile()` - JSON backup/restore
  - `deleteSave()` - Clear saved data
  - `getSaveInfo()` - Check save status and timestamp
- **What it does**: Manages save/load, auto-save timer, localStorage persistence

### Benefits of Modular Structure

✅ **Easier Debugging**: Issues isolated to specific modules
✅ **Better Testing**: Each module can be tested independently  
✅ **Cleaner Code**: Single responsibility per file
✅ **Easier Maintenance**: Find and fix code faster
✅ **Less Coupling**: Changes in one module don't break others
✅ **Scalability**: Add new features without bloating main.js

### Migration Notes

- Old `main.js` backed up as `main.js.old`
- All functionality preserved
- No breaking changes to game behavior
- HTML/CSS remain unchanged

### File Structure
```
src/
├── engine/                # Core game engine
│   ├── main.js            # Entry point (40 lines)
│   ├── GameInitializer.js # Config loading
│   ├── GameLoop.js        # Update/Draw loop
│   ├── GameStarter.js     # Game start logic
│   ├── EventHandlers.js   # Input handling
│   ├── MainMenuScreen.js  # Main menu system (v1.3.0)
│   ├── SaveManager.js     # Save/load system (v1.3.0)
│   └── Game.js            # Game state
├── entities/              # Game entities
│   ├── Player.js          # Player entity
│   ├── Enemy.js           # Enemy entity
│   └── Gem.js             # XP gem system
├── characters/            # Character system
│   ├── CharacterManager.js
│   ├── CharacterSelectionScreen.js
│   └── ConfigManager.js
├── mods-system/           # Mod system (✅ Stable v1.3.0)
│   ├── ModManager.js      # Mod discovery & loading
│   └── ModManagerScreen.js # Mod management UI
├── weapons/               # Weapon system
│   ├── BaseWeapon.js
│   ├── WeaponFactory.js
│   └── types/             # Individual weapons
└── ...                    # Other game systems
```

### Future Improvements

Potential areas for further modularization:
- Separate collision detection into `CollisionManager.js`
- Extract upgrade system to `UpgradeSystem.js`
- Create `EntityManager.js` for entity lifecycle
- Add `InputManager.js` for cleaner input handling

## Save System Architecture *(v1.3.0)*

### **SaveManager.js**

The save system uses browser localStorage with the following structure:

#### **Save Data Format**
```json
{
  "player": {
    "x": 400,
    "y": 300,
    "health": 80,
    "maxHealth": 100,
    "speed": 4.5,
    "shieldCharges": 2
  },
  "weapon": {
    "type": "pierceSniper",
    "level": 5,
    "damageBonus": 1.5,
    "fireRateBonus": 0.8,
    "upgrades": ["piercingRounds", "fasterReload"]
  },
  "progress": {
    "xp": 250,
    "level": 8,
    "score": 15420,
    "kills": 234,
    "selectedCharacter": "Pierce"
  },
  "enemies": [
    { "x": 200, "y": 150, "health": 5, "type": "normal" }
  ],
  "timestamp": 1703577600000
}
```

#### **Key Features**
- **Auto-save**: Timer-based (30s intervals) during gameplay
- **Manual save**: Press 'S' key for instant save
- **Validation**: Checks save integrity before loading
- **Import/Export**: JSON file backup and restore
- **Notifications**: Visual feedback on save/load actions

#### **Integration Points**
- `GameStarter.js`: Calls `loadSavedGame()` for Continue feature
- `EventHandlers.js`: 'S' key triggers `saveManager.saveGame()`
- `MainMenuScreen.js`: Shows Continue button if save exists
- `main.js`: Exposes `saveManager` globally for console access

## Main Menu System *(v1.3.0)*

### **MainMenuScreen.js**

Professional main menu with splash screen and navigation.

#### **Components**
1. **Splash Screen** (2-second duration)
   - SHAPESLAYER™ pixel-style logo
   - Pulsing glow animation
   - Auto-transitions to menu

2. **Menu Navigation**
   - Continue (if save exists)
   - Start Game / New Game
   - Options
   - Mod Tools
   - Character Designer
   - Credits

3. **UI Management**
   - Hides game UI during menu
   - Restores UI on menu close
   - Integrates with character selection

#### **Navigation Flow**
```
Game Start → Splash (2s) → Main Menu
                            ↓
                    ┌───────┴───────┐
                    │               │
              Continue          Start Game
                    │               │
            Load Saved Game   Character Selection
                    │               │
                    └───────┬───────┘
                            ↓
                       Game Loop
```

## Mod System Architecture *(v1.3.0.2)*

### **Weapon Loading Priority**

The weapon factory prioritizes mod weapons over core weapons:

```javascript
// WeaponFactory.js
async createWeaponAsync(type, player) {
  // 1. Try mod weapons first
  const modWeapon = await modManager.createModWeapon(type, player);
  if (modWeapon) return modWeapon;
  
  // 2. Fall back to core weapons
  return this.createWeapon(type, player);
}
```

### **Mod Initialization Sequence**

Fixed in v1.3.0.1 to ensure proper loading order:

```javascript
// GameInitializer.js
async loadGameConfig() {
  // 1. Load mod system FIRST
  await modManager.initialize();
  
  // 2. Then load characters (includes mod characters)
  await characterManager.loadModCharacters();
  
  // 3. Finally load other configs
  await configManager.loadConfigs();
}
```

### **Pierce Character Example**

Complete mod implementation showing:
- Custom weapon class (`PierceSniper.js`)
- Custom collectible system (`AmmoPack.js`)
- Character definition (`character.json`)
- Game loop integration (ammo drops, reload indicator)
- Visual feedback (donut animation, ammo display)
