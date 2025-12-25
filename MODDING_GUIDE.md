# 🔧 ShapeSlayer Mod System - Complete Guide

## ✅ **System Status: STABLE** *(v1.3.0)*

The mod system is fully functional and tested with complete examples!

**Production Ready:**
- ✅ Mod discovery and loading
- ✅ Custom character support  
- ✅ Custom weapon integration
- ✅ Mod manager UI
- ✅ Complete Pierce Character example with ammo system

### ✅ **Implemented Features**

1. **📁 Mod Folder Structure**
   - `/mods/enabled.json` - Mod configuration
   - `/mods/pierce-character/` - Complete Pierce character mod with ammo system
   - `/mods/mod-template/` - Template for creating new mods

2. **🛠️ Core Mod System**
   - `ModManager.js` - Discovery, validation, loading, compatibility checking
   - `ModManagerScreen.js` - Full UI for managing mods
   - Integration with game initialization and loops
   - Weapon priority system (mods override core weapons)

3. **🎯 Pierce Character Mod** *(Complete Example)*
   - **Pierce Sniper**: Tactical sniper with 4-shot magazine, 5-second reload
   - **Ammo System**: Limited ammo, consumption tracking, visual display
   - **Ammo Packs**: Drop on hit (not kill), restore 1 ammo, cancel reload
   - **Visual Feedback**: Donut reload indicator, color-coded ammo display
   - **Bonus Shot**: Ammo packs fire piercing bullet (1 damage, 1 pierce)
   - **Character**: Pierce character with Marksman + Tactical traits

4. **🔌 Game Integration**
   - WeaponFactory prioritizes mod weapons over core weapons
   - CharacterManager loads mod characters properly
   - Game loop handles ammo pack drops on bullet hit
   - Event handlers support mod manager UI
   - Main menu integration for mod loading

## 🎮 **How to Use**

### **1. Opening Mod Manager**
1. Start the game - mod system initializes automatically
2. Press **'M'** during main menu or gameplay to open Mod Manager
3. See Pierce Character mod listed as "ENABLED"
4. Toggle mods on/off as desired
5. Press **ESC** or click "Return to Menu" to close
6. Mods reload when returning to main menu

### **2. Playing Pierce Character**
1. Enable Pierce Character mod in Mod Manager
2. Return to main menu (mods reload)
3. Click "Start Game" or "New Game"
4. In character selection, look for **"🎯 Pierce"** character
5. Select Pierce to start with Pierce Sniper weapon

### **3. Pierce Sniper Mechanics**
**Ammo System:**
- Start with 4 ammo
- Each shot consumes 1 ammo
- When empty, auto-reload for 5 seconds
- Press **'R'** to manual reload early

**Ammo Packs:**
- Drop **behind player** when Pierce bullet **hits** enemy (not kill)
- Collect to restore 1 ammo
- Cancels reload if currently reloading
- Fires bonus piercing bullet (1 damage, 1 pierce)
- Fade after 10 seconds if not collected

**Visual Feedback:**
- Ammo display shows remaining shots (top-left)
- Color coding:
  - Green: 4-3 ammo (good)
  - Yellow: 2 ammo (caution)
  - Orange: 1 ammo (warning)
  - Red: 0 ammo (reloading)
- Donut reload indicator fills over 5 seconds

### **4. Mod Manager UI**
- **Status Colors:** Green=loaded, Yellow=validated, Red=error
- **Enable/Disable:** Click toggle buttons (requires menu return to apply)
- **Details Panel:** Click mod name to see description and error info
- **Scroll Support:** Mouse wheel or arrow keys
- **Navigation:** ESC to close, 'M' to reopen

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
- **Health:** 75 (4 hearts - fragile sniper)
- **Speed:** 4.3 (slightly faster than normal)
- **Weapon:** Pierce Sniper (4-shot tactical sniper)
- **Traits:** Marksman (accuracy) + Tactical (reload efficiency)

### **Pierce Sniper:**
- **Damage:** 4 (high damage per shot)
- **Fire Rate:** 80 frames (slow but powerful)
- **Range:** Infinite (sniper range)
- **Ammo:** 4 shots per magazine
- **Reload Time:** 5 seconds (300 frames)
- **Bullet Color:** Blue (#00aaff)
- **Pierce:** 0 (single target hit)

### **Ammo Packs:**
- **Trigger:** Drop when Pierce bullet **hits** enemy (not kill)
- **Location:** Spawns behind player position
- **Restore:** 1 ammo when collected
- **Bonus:** Fire piercing bullet (1 damage, 1 pierce)
- **Reload Cancel:** Stops reload if currently reloading
- **Lifetime:** 10 seconds before fade
- **Visual:** Blue pulsing box with crosshair symbol
- **Collection Radius:** 30 pixels

## 🚨 **Troubleshooting**

### **Mod Not Loading:**
1. Check browser console for error messages (F12)
2. Verify mod files exist in `/mods/pierce-character/`
3. Check `enabled.json` includes "pierce-character"
4. Ensure you returned to main menu after enabling mod
5. Try refreshing the page (hard refresh: Ctrl+F5)

### **Pierce Character Missing:**
1. Open Mod Manager ('M' key) and verify Pierce mod is ENABLED
2. Return to main menu to reload mods
3. Check character selection for "🎯 Pierce"
4. Check console for ModManager initialization errors

### **Ammo Packs Not Dropping:**
1. Verify you selected Pierce character (not just Pierce weapon on another character)
2. Fire bullets and ensure they **hit** enemies (not miss)
3. Check that bullets show blue color (#00aaff)
4. Watch behind player position after hit
5. Check console for JavaScript errors

### **Reload Not Working:**
1. Ammo must be 0 for auto-reload to trigger
2. Press 'R' to manually reload early
3. Check reload indicator (donut animation) appears
4. Verify reload completes after 5 seconds

### **General Debugging:**
```javascript
// Check mod status
console.log(modManager.getAllMods())

// Check character list
console.log(characterManager.getAllCharacters())

// Check current weapon
console.log(Game.player.weapon)

// Spawn test ammo pack (if Pierce equipped)
if (Game.player.weapon.type === 'pierceSniper') {
  Game.player.weapon.dropAmmoPackAt(Game.player.x, Game.player.y)
}
```

## 🔮 **Creating Your Own Mods**

The Pierce Character mod serves as a complete reference implementation!

### **Mod Structure**
```
mods/your-mod-name/
├── mod.json           # Mod manifest (required)
├── mod.js             # Mod initialization code
├── character.json     # Character definition (if adding character)
├── YourWeapon.js      # Custom weapon class
└── YourCollectible.js # Custom collectible/system
```

### **Key Implementation Examples from Pierce Mod**

#### **1. Custom Weapon with State Management**
See [mods/pierce-character/PierceSniper.js](mods/pierce-character/PierceSniper.js):
- Extends `BaseWeapon` class
- Implements `shoot()` for ammo consumption
- Implements `canFire()` for ammo/reload checks
- Custom `drawReloadIndicator()` for visual feedback
- State management: ammo, reloading, frameCount

#### **2. Custom Collectible Integration**
See [mods/pierce-character/AmmoPack.js](mods/pierce-character/AmmoPack.js):
- Extends base collectible pattern
- `collect()` method restores ammo and cancels reload
- `draw()` for visual representation
- `spawnProjectile()` for bonus shot on collection
- Integration with weapon state

#### **3. Game Loop Integration**
See how Pierce mod integrates:
- `GameLoop.js` detects Pierce bullets in `handleBulletHit()`
- Calls `weapon.dropAmmoPackAt()` on enemy hit
- Renders reload indicator in `draw()` loop
- No core game code modification needed!

#### **4. Import Path Fixes**
Important: Use correct import paths:
```javascript
// ✅ CORRECT (modular structure)
import Game from '../../src/engine/Game.js';
import BaseWeapon from '../../src/weapons/BaseWeapon.js';

// ❌ WRONG (old structure)
import Game from '../../src/Game.js';
```

### **Modding Best Practices**

1. **Follow Pierce Example**: Use it as template for structure
2. **Proper Imports**: Use `../../src/engine/` path for core files
3. **State Management**: Track weapon/character state properly
4. **Visual Feedback**: Add indicators for custom mechanics
5. **Game Loop Hooks**: Use existing integration points
6. **Error Handling**: Check for null/undefined states
7. **Testing**: Test via Mod Manager before distribution

## 🔧 **Advanced: Weapon Priority System**

The mod system uses weapon priority in `WeaponFactory.js`:

```javascript
async createWeaponAsync(type, player) {
  // 1. Check mod weapons FIRST
  const modWeapon = await modManager.createModWeapon(type, player);
  if (modWeapon) return modWeapon;
  
  // 2. Fall back to core weapons
  return this.createWeapon(type, player);
}
```

**This means:** Mods can override core weapons by using same weapon type name!

Example: A mod with `type: "sniper"` would replace the core Sniper weapon.

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
    ├── mods-system/                # ✅ Mod system (STABLE v1.3.0)
    │   ├── ModManager.js           # Core mod system
    │   └── ModManagerScreen.js     # Mod management UI
    └── weapons/                    # Weapon system
        ├── WeaponFactory.js        # Dynamic weapon loading
        └── types/                  # Weapon implementations
```

**Note:** The project uses a modular folder structure for maintainability.

## 🎉 **Summary**

The mod system is **fully functional and production-ready**! 🎮✅

**What Works:**
- ✅ Complete mod loading system
- ✅ Mod Manager UI with enable/disable
- ✅ Pierce Character with tactical ammo mechanics
- ✅ Custom weapon integration (prioritized over core)
- ✅ Custom collectible system (ammo packs)
- ✅ Visual feedback (reload indicator, ammo display)
- ✅ Game loop integration (drops, rendering)
- ✅ Main menu integration

**Use Pierce Character as your reference for creating mods!** It demonstrates all core modding features with a complete, working implementation.