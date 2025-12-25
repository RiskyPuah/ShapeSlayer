# 📋 Changelog

All notable changes to ShapeSlayer will be documented in this file.

---

## Version 1.2.5.1 - "Bug Fixes" *(December 25, 2025)*

### 🐛 **Bug Fixes**
- **Custom Character Health Migration**: Fixed custom characters using old health values
  - Automatic migration from old system (70-100 HP) to new hearts system (4-10 HP)
  - Glass cannon characters (≤75 HP) → 4 HP (2 hearts)
  - Balanced characters (76-85 HP) → 6 HP (3 hearts)
  - Tank characters (86-100 HP) → 8 HP (4 hearts)
  - Super tank characters (>100 HP) → 10 HP (5 hearts)
  - Migration runs automatically on game load and saves converted values
  - Console logs show which characters were migrated

---

## Version 1.2.5 - "The Heartful Update" *(December 25, 2025)*

### ❤️ **Health System Overhaul**
- **Binding of Isaac Style Health**: Complete health system rewrite
  - Heart containers (2 HP per heart)
  - Visual heart UI in top-left corner (full/half/empty states)
  - Invulnerability frames after taking damage (1 second)
  - Red flash effect when hit
  - Death only occurs when health reaches 0

- **Character Health Rebalance**: Adjusted all characters for new system
  - Ranger & Scholar: 4 HP (2 hearts) - Glass cannons
  - Gunslinger, Nomad & Card Master: 6 HP (3 hearts) - Balanced
  - Warrior: 8 HP (4 hearts) - Tank
  - Demolitionist: 10 HP (5 hearts) - Ultimate tank

### 🛡️ **Shield System Rework**
- **Modular Shield Classes**: Extracted shields into separate system
  - `HolyShield.js` - Base shield class with customizable mechanics
  - `PaladinShield.js` - Auto-recharging shield (120s cooldown)
  - Visual shield icon floats above player
  - Pulsing glow effect when active
  - Charge counter display for multi-charge shields

- **Shield Integration**: 
  - Removed old charge bar UI
  - Shield blocks damage before health system
  - Instant visual feedback on block
  - Modular design allows custom shield types

### ✨ **Powerup System Expansion**
- **PowerupFactory Pattern**: Centralized powerup spawning
  - Factory pattern for clean powerup creation
  - Configurable drop rates per powerup type
  - Proper spawn distribution system

- **New Powerups**:
  - **Holy Shield Powerup** (🛡️): Grants/recharges player shield
    - Large glowing gold icon with pulse animation
    - Adds shield charge or creates new shield
    - Works with all characters (not just Paladin)
  
  - **Magnetic Powerup** (🧲): Auto-collects all XP gems
  - **Instant Death Powerup** (💀): Kills all enemies, drops XP

- **Drop Rates**:
  - Instant Death: 1%
  - Magnetic: 4%
  - Holy Shield: Currently testing (adjustable)

### 🎯 **Paladin Combat Improvements**
- **Smart Arc Targeting**: Intelligent enemy cluster detection
  - Analyzes all enemies in range
  - Scores targets based on: enemy count, total health, distance
  - Automatically aims at densest clusters
  - Prioritizes 5-enemy groups over single nearby enemies
  - Console feedback shows targeting decisions

- **Fixed Powerup Spawning**: Paladin now uses PowerupFactory (was using old system)

### 🐛 **Bug Fixes**
- Fixed Paladin bypassing PowerupFactory (custom drop code removed)
- Fixed player reference in powerup collection
- Fixed shield charge calculation
- Fixed module caching issues with PowerupFactory
- Fixed powerup-player collision detection

### 🔧 **Technical Improvements**
- Created `HealthManager.js` - Handles all health/damage logic
- Created `src/shields/` folder for shield system
- Refactored Player.js to use HealthManager
- Updated GameLoop enemy collision to use new health system
- Better debug logging for powerups and shields
- Improved module import structure

---

## Version 1.2.0 - "The Great Refactor" *(December 25, 2025)*

### 🏗️ **Major Refactoring**
- **Modular Architecture**: Complete codebase reorganization into logical folder structure
  - `src/engine/` - Core game engine (main, Game, GameInitializer, GameLoop, GameStarter, EventHandlers)
  - `src/entities/` - Game entities (Player, Enemy, Gem)
  - `src/projectiles/` - Projectile effects (Explosion, Orbital, PoisonPuddle)
  - `src/powerups/` - Power-up system
  - `src/characters/` - Character management system
  - `src/weapons/` - Weapon system with types
  - `src/mods-system/` - Mod framework (⚠️ in development)

### ✨ **Features & Improvements**
- **Separated HTML/CSS**: External `styles.css` for better maintainability
- **Modular main.js**: Split 600-line file into 5 focused modules
  - GameInitializer - Configuration loading
  - GameLoop - Update/render cycles
  - GameStarter - Game initialization
  - EventHandlers - Input handling
  - main.js - Coordination (40 lines)

### 🔧 **Gameplay Changes**
- **Removed Legacy Evolution System**: Replaced hardcoded level 5 "evolution" menu with normal upgrade system
- **Unified Upgrade Flow**: All level-ups now use consistent weapon upgrade menu
- **Better Mod System Integration**: Dynamic imports for mod characters and weapons

### 🐛 **Bug Fixes**
- Fixed mod loading paths after folder reorganization
- Fixed dynamic import paths for ModManager
- Fixed weapon factory mod weapon loading
- Fixed all relative import paths throughout codebase

### 📚 **Documentation**
- Updated README with new project structure
- Updated MODDING_GUIDE with development status
- Added development warnings for mod system
- Documented all folder organization changes

---

## Version 1.1.0 - "Card Thrower & Elemental Effects"

### 🃏 **Card Thrower Weapon**
- New piercing projectile system
- 3-card spread attacks
- Poison/Fire elemental upgrades
- Custom card rendering with rotation
- Card Master character class

### 🔥 **Pyromancer Weapon**
- Arc flamethrower mechanics
- Burn damage over time
- Continuous flame rendering
- Fire particle effects

### 🧪 **Plague Doctor Weapon**
- Poison puddle area denial
- DOT mechanics integration
- Growing puddle effects
- Area control gameplay

### 🛡️ **Shielded Enemies**
- Shield blocking mechanics
- Speed boost on shield break
- Poison bypass system
- Visual shield indicators

---

## Version 1.0.0 - Initial Release

### ⚔️ **Core Weapons**
- Pistol - Balanced fighter
- Shotgun - Close combat devastator
- Minigun - Bullet storm
- Rocket Launcher - Area devastation
- Paladin - Holy warrior
- Sniper - Precision eliminator

### 🎭 **Character Classes**
- Warrior, Ranger, Gunslinger, Demolitionist, Scholar, Nomad

### 🛡️ **Enemy Types**
- Normal, Medium, Shielded enemies
- Dynamic spawn system
- Scaling difficulty

### 🎮 **Core Mechanics**
- Top-down survival gameplay
- XP and leveling system
- Weapon upgrade system
- Character traits
- Auto-aim combat

---

**Latest Version**: 1.2.5 - "The Heartful Update"
