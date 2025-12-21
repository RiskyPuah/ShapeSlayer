# 🔧 ShapeSlayer Mod System - Guide

## ⚠️ **System Status: IN DEVELOPMENT**

The mod system is currently under active development. While core features are implemented, there may be bugs, incomplete features, or breaking changes in future updates.

**Please report any issues you encounter!**

### ✅ **Implemented Features**

1. **📁 Mod Folder Structure**
   - `/mods/enabled.json` - Mod configuration
   - `/mods/pierce-character/` - Complete Pierce character mod
   - `/mods/mod-template/` - Template for creating new mods

2. **🛠️ Core Mod System**
   - `ModManager.js` - Discovery, validation, loading, compatibility checking
   - `ModManagerScreen.js` - Full UI for managing mods
   - Integration with game initialization and loops

3. **🎯 Pierce Character Mod**
   - **Pierce Sniper**: 4-ammo tactical sniper weapon
   - **Ammo Packs**: Drop on reload, restore ammo + spawn projectile
   - **Character**: New "Pierce" character with unique stats and traits

4. **🔌 Game Integration**
   - WeaponFactory supports dynamic mod weapon loading
   - CharacterManager loads mod characters
   - Main game loop handles ammo packs
   - Event handlers for mod manager UI

## 🎮 **How to Test**

### **1. Basic Mod System**
1. Start the game - mod system initializes automatically
2. Press **'M'** to open Mod Manager
3. See Pierce Character mod listed as "ENABLED"
4. Check status indicators and mod information

### **2. Pierce Character**
1. In character selection, look for "🎯 Pierce" character
2. Select Pierce character to start with Pierce Sniper
3. **Test ammo system:**
   - Fire 4 shots to empty magazine
   - Watch auto-reload (2 seconds)
   - Ammo pack drops behind player
   - Walk into ammo pack to collect (+2 ammo + projectile)
4. **Manual reload:** Press 'R' to reload early

### **3. Ammo Pack Mechanics**
- Ammo packs restore 2 ammo when collected
- Spawn homing projectile toward nearest enemy (1 damage)
- Fade out after 10 seconds if not collected
- Visual pulse effect and collection radius

### **4. Mod Manager UI**
- **Status Colors:** Green=loaded, Yellow=validated, Red=error
- **Enable/Disable:** Toggle mods (requires restart to take effect)
- **Details Panel:** Click mod to see description and error details
- **Scroll Support:** Mouse wheel or arrow keys
- **ESC to close**

## 🔧 **Console Commands**

Test the system via browser console:

```javascript
// Check mod manager status
modManager.getAllMods()

// Check loaded mods
modManager.loadedMods

// Check for errors
modManager.getErrors()

// Test ammo pack spawning (if Pierce character selected)
if (Game.player.weapon.type === 'pierceSniper') {
    Game.player.weapon.dropAmmoPack()
}
```

## 🎯 **Expected Behavior**

### **Pierce Character Stats:**
- **Health:** 75 (fragile sniper)
- **Speed:** 4.3 (slightly faster than normal)
- **Weapon:** Pierce Sniper with 4-shot magazine
- **Traits:** Marksman + Tactical

### **Pierce Sniper:**
- **Damage:** 4 (high damage per shot)
- **Fire Rate:** 80 (slow but powerful)
- **Range:** Infinite (sniper range)
- **Ammo:** 4 shots, 2-second reload
- **Bullet Color:** Blue (#00aaff)

### **Ammo Packs:**
- **Appear:** After each reload
- **Restore:** 2 ammo when collected
- **Projectile:** Orange homing shot (1 damage)
- **Lifetime:** 10 seconds
- **Visual:** Blue pulsing box with cross symbol

## 🚨 **Troubleshooting**

### **Mod Not Loading:**
1. Check console for error messages
2. Verify mod files exist in `/mods/pierce-character/`
3. Check `enabled.json` includes "pierce-character"

### **Pierce Character Missing:**
1. Ensure mod system initialized (check console)
2. Refresh character selection screen
3. Check ModManager errors

### **Ammo Packs Not Working:**
1. Verify you're using Pierce character
2. Fire all 4 shots to trigger reload
3. Check for JavaScript errors in console

## 🔮 **Future Extensions**

The mod system is designed for easy expansion:

- **New Characters:** Copy mod template, modify manifest and character.json
- **New Weapons:** Create weapon class, update manifest
- **New Enemies:** Add enemy types via mods
- **Custom Traits:** Define new character abilities
- **Assets:** Add custom sprites and sounds

## 📋 **File Structure**

```
ShapeSlayer/
├── mods/
│   ├── enabled.json                 # Mod configuration
│   ├── pierce-character/            # Pierce character mod
│   │   ├── mod.json                # Mod manifest
│   │   ├── character.json          # Character definition
│   │   ├── PierceSniper.js         # Weapon class
│   │   ├── AmmoPack.js             # Ammo pack system
│   │   └── mod.js                  # Mod initialization
│   └── mod-template/               # Template for new mods
│       └── mod.json                # Template manifest
└── src/
    ├── engine/                     # Core game engine
    │   ├── main.js                 # Game coordination
    │   ├── Game.js                 # Game state
    │   ├── GameInitializer.js      # Config loading
    │   ├── GameLoop.js             # Update/render loops
    │   ├── GameStarter.js          # Game start logic
    │   └── EventHandlers.js        # Input handling
    ├── entities/                   # Game entities (Player, Enemy, Gem)
    ├── projectiles/                # Projectile effects
    ├── powerups/                   # Power-up system
    ├── characters/                 # Character management
    │   ├── CharacterManager.js     # Character data
    │   ├── ConfigManager.js        # Config loader
    │   └── SelectionScreen.js      # UI screens
    ├── mods-system/                # ⚠️ Mod system (IN DEVELOPMENT)
    │   ├── ModManager.js           # Core mod system
    │   └── ModManagerScreen.js     # Mod management UI
    └── weapons/                    # Weapon system
        ├── WeaponFactory.js        # Dynamic weapon loading
        └── types/                  # Weapon implementations
```

**Note:** The project has been reorganized into a modular folder structure for better maintainability.

The mod system is **functional but still in development**! 🎮⚠️