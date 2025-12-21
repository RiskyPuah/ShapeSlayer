# 🎮 ShapeSlayer - Modular Configuration System

## Overview
ShapeSlayer now uses a JSON-driven configuration system that makes the game highly customizable without requiring code changes! 🚀

## 📁 Configuration Files

All game configuration is stored in the `/data/` folder:

- **`weapons.json`** - Weapon stats, upgrades, and visual properties
- **`enemies.json`** - Enemy types, spawn rates, and scaling
- **`upgrades.json`** - Upgrade definitions and effects  
- **`gameSettings.json`** - Core game mechanics and UI settings

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

## 🎮 Next Steps

The configuration system makes it easy to:

- Add weapon variations (laser pistol, ice shotgun, etc.)
- Create enemy factions with different behaviors
- Design complex upgrade trees
- Implement seasonal events with config swaps
- Support community mods and customizations

**ShapeSlayer is now a truly modular, data-driven game! 🎉**