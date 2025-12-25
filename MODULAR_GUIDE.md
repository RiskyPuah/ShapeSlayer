# 🎮 ShapeSlayer - Modular Configuration & Feature Guide

## Overview
ShapeSlayer uses a JSON-driven configuration system combined with a modular code architecture for maximum customization! 🚀

## 💾 Save System *(v1.3.0)*

### **Auto-Save**
Game automatically saves every **30 seconds** during gameplay:
- Saves to browser localStorage
- Visual notification when save completes
- Includes complete game state

### **Manual Save**
Press **'S' key** during gameplay to save instantly:
- Immediate save with notification
- Perfect for saving before risky situations
- No cooldown between saves

### **Continue Feature**
Main menu shows **"Continue"** button if save exists:
- Restores player position, health, stats
- Restores weapon type, level, upgrades
- Restores XP, score, kills
- Restores active enemies
- Shows save timestamp

### **Console Commands**
```javascript
// Save current game
saveManager.saveGame(Game)

// Load saved game (returns true if successful)
saveManager.loadGame(Game)

// Check save info
saveManager.getSaveInfo()

// Export save as JSON file
saveManager.exportSaveFile(Game)

// Import save from file
saveManager.importSaveFile(fileInput)

// Delete save
saveManager.deleteSave()
```

## 🖥️ Main Menu System *(v1.3.0)*

### **Splash Screen**
- **SHAPESLAYER™** logo in pixel-style font
- Pulsing glow animation
- 2-second auto-transition to menu

### **Menu Navigation**
- **Continue**: Resume from last save (if exists)
- **Start Game** / **New Game**: Begin fresh adventure
- **Options**: Settings (coming soon)
- **Mod Tools**: Open mod manager
- **Character Designer**: Custom character creation
- **Credits**: Game information

### **Keyboard Shortcuts**
- **'M' Key**: Open mod manager (anytime)
- **'S' Key**: Save game (during gameplay)
- **'R' Key**: Manual reload (Pierce Sniper only)
- **ESC Key**: Close mod manager / Return to menu

## 🔧 Mod System *(v1.3.0 - Stable)*

### **Mod Manager**
Press **'M'** to open the mod manager:
- View all available mods
- Enable/disable mods
- See mod status (loaded, validated, error)
- Return to menu to reload with new mods

### **Pierce Character Mod**
Complete tactical sniper character with ammo mechanics:

**Character Stats:**
- Health: 75 (4 hearts)
- Speed: 4.3 (slightly faster)
- Weapon: Pierce Sniper
- Traits: Marksman + Tactical

**Pierce Sniper Weapon:**
- **Ammo**: 4 shots per magazine
- **Reload**: 5 seconds with donut indicator
- **Fire Rate**: 80 frames (slow, powerful)
- **Damage**: 4 per shot (high damage)
- **Range**: Infinite (sniper range)

**Ammo Pack System:**
- Drop behind player when Pierce bullet **hits** enemy (not kill)
- Restore 1 ammo when collected
- Cancel reload if currently reloading
- Fire bonus piercing bullet (1 damage, 1 pierce)
- Fade after 10 seconds if not collected

**Visual Feedback:**
- Donut reload indicator (fills over 5 seconds)
- Ammo display color:
  - Green: 4-3 ammo (good)
  - Yellow: 2 ammo (caution)
  - Orange: 1 ammo (warning)
  - Red: 0 ammo (reloading)

## 📁 Configuration Files

All game configuration is stored in the `/data/` folder:

- **`weapons.json`** - Weapon stats, upgrades, and visual properties
- **`enemies.json`** - Enemy types, spawn rates, and scaling
- **`upgrades.json`** - Upgrade definitions and effects  
- **`gameSettings.json`** - Core game mechanics and UI settings
- **`characters.json`** - Character definitions and traits

## ⚔️ Adding a New Weapon

To add a new weapon, just edit `data/weapons.json`:

```json
"flameThrower": {
  "name": "Flame Thrower",
  "description": "Continuous fire damage over time",
  "stats": {
    "fireRate": 8,
    "damage": 0.3,
    "projectileCount": 3,
    "spread": 0.3,
    "speedModifier": 0.75,
    "projectileType": "fire",
    "burnDuration": 120,
    "holyShieldMaxCooldown": 0
  },
  "upgrades": {
    "damageIncrease": 0.2,
    "fireRateDecrease": 1,
    "fireRateMin": 3
  },
  "visuals": {
    "icon": "🔥",
    "color": "#ff6600",
    "description": "Burn everything in your path"
  }
}
```

## 👹 Creating New Enemy Types

Add new enemies in `data/enemies.json`:

```json
"boss": {
  "name": "Boss Enemy",
  "stats": {
    "size": 60,
    "maxHealth": 20,
    "baseSpeed": 0.5,
    "speedLevelMultiplier": 0.1,
    "xpValue": 10
  },
  "visuals": {
    "color": "#8800ff",
    "shape": "square"
  },
  "spawning": {
    "probability": 0.05,
    "weight": 5
  }
}
```

## ⚡ Custom Upgrades

Define new upgrades in `data/upgrades.json`:

```json
"explosiveShots": {
  "id": "explosiveShots",
  "name": "💣 Explosive Rounds",
  "description": "Bullets explode on impact",
  "details": "25% chance for mini explosions",
  "color": "#ff8800",
  "effect": {
    "type": "special",
    "value": "explosive"
  },
  "applicableWeapons": ["pistol", "minigun", "sniper"]
}
```

## 🎯 Easy Customization Examples

### Make the game easier:
```json
// In gameSettings.json
"player": {
  "baseSpeed": 6,        // Faster movement
  "baseXPRequired": 5    // Level up faster
}
```

### Create a boss rush mode:
```json
// In enemies.json - adjust spawn weights
"normal": { "spawning": { "weight": 10 } },
"boss": { "spawning": { "weight": 90 } }
```

### Super weapons mode:
```json
// In weapons.json - buff all damage values
"pistol": {
  "stats": { "damage": 5, "fireRate": 10 }
}
```

## 🔧 Technical Benefits

### For Developers:
- **Clean separation** of data and logic
- **Easy A/B testing** by swapping config files
- **Mod support** ready out of the box
- **No recompilation** needed for balance changes

### For Players/Modders:
- **Simple JSON editing** to customize gameplay
- **Visual feedback** with console logging
- **Instant changes** by refreshing the page
- **Backup/restore** configurations easily

## 📊 Configuration Structure

```
data/
├── weapons.json      # Weapon definitions & balance
├── enemies.json      # Enemy types & spawn rates  
├── upgrades.json     # Upgrade system & effects
└── gameSettings.json # Core game mechanics
```

## 🚀 Benefits Achieved

1. **Modularity**: Game logic separated from data
2. **Extensibility**: Add content without coding
3. **Maintainability**: Clear configuration structure
4. **Flexibility**: Easy balance adjustments
5. **Scalability**: Ready for complex content additions
6. **Save System**: Progress persistence and backup (v1.3.0)
7. **Professional UI**: Main menu with splash screen (v1.3.0)
8. **Mod Support**: Complete modding system with examples (v1.3.0)

## 🎮 Quick Tips

### **Saving Your Game**
- Game auto-saves every 30 seconds
- Press 'S' to save manually anytime
- Use Continue from main menu to resume

### **Using Mods**
- Press 'M' to open mod manager
- Enable Pierce Character for tactical sniper gameplay
- Return to menu after changing mods

### **Pierce Character Strategy**
- Conserve ammo - only 4 shots per magazine
- Collect ammo packs quickly (10s lifetime)
- Use manual reload ('R') when safe
- Position to hit multiple enemies for more ammo drops

## 🎮 Next Steps

The modular system makes it easy to:

- Add weapon variations (laser pistol, ice shotgun, etc.)
- Create enemy factions with different behaviors
- Design complex upgrade trees
- Implement seasonal events with config swaps
- Support community mods and customizations
- Create full character mods with unique mechanics

**ShapeSlayer is now a truly modular, data-driven game with professional features! 🎉**