# 📋 Changelog

All notable changes to ShapeSlayer will be documented in this file.

---

## Version 1.3.0.2 - "Pierce Character Fixes" *(December 25, 2025)*

### 🐛 **Bug Fixes**
- **Pierce Character Weapon Loading**: Fixed Pierce Sniper weapon not loading
  - Updated import paths from `src/Game.js` to `src/engine/Game.js`
  - Fixed WeaponFactory to prioritize mod weapons over core weapons
  - GameStarter now uses async weapon creation first
  
- **Pierce Sniper Ammo System**: Implemented proper ammo mechanics
  - Fixed method name from `fire()` to `shoot()` to match BaseWeapon
  - Fixed `canFire()` crash - removed invalid `super.canFire()` call
  - Ammo now properly decreases when shooting (4 max ammo)
  - Ammo display updates correctly in real-time with color coding
  
- **Ammo Pack Mechanics**: Complete redesign of drop and collection system
  - **Ammo packs now drop behind player when hitting enemies** (not on kill)
  - Collecting ammo pack restores 1 ammo
  - **Cancels reload if currently reloading** - no more sitting duck!
  - Fires quick piercing bullet (1 damage, 1 pierce) toward nearest enemy
  - 5 second reload time when all ammo exhausted
  
- **Visual Feedback**: Added reload indicator
  - Donut-style circular progress bar appears above player during reload
  - Blue progress arc with "R" text in center
  - Shows exact reload progress (0-100%)

### 🎯 **Pierce Character Final Features**
- ✅ Limited ammo system (4 rounds)
- ✅ Tactical ammo management gameplay
- ✅ Ammo packs drop behind player on enemy hits
- ✅ Reload cancellation on ammo pickup
- ✅ Auto-reload when out of ammo (5 seconds)
- ✅ Visual reload indicator
- ✅ Color-coded ammo display (white → yellow → red)
- ✅ High damage sniper gameplay (4 damage per shot)

---

## Version 1.3.0.1 - "Bug Fixes" *(December 25, 2025)*

### 🐛 **Bug Fixes**
- **Main Menu Navigation**: Fixed character selection auto-showing on startup
  - GameInitializer no longer automatically displays character selection
  - Main menu now properly controls all navigation flows
  
- **Mod Manager**: Fixed mod-template loading error
  - Removed 'mod-template' from known mods list (it's just a template)
  - Eliminates MIME type and 404 errors on startup
  
- **Mod Tools Screen**: Fixed blank screen when closing mod manager
  - Mod manager now returns to main menu when closed with ESC key
  - Proper navigation flow between menu and mod tools
  
- **Game UI Display**: Fixed missing XP bar, level, and score display
  - Main menu now properly restores UI elements when starting game
  - All HUD elements (XP bar, level counter, score) now visible during gameplay

---

## Version 1.3.0 - "The Main Menu Update" *(December 25, 2025)*

### 🎮 **Main Menu System**
- **Splash Screen**: SHAPESLAYER™ logo with pixel-style font
  - Pulsing glow effect animation
  - Auto-transitions to main menu after 2 seconds
  - Professional title screen presentation

- **Main Menu**: Full menu system with navigation
  - **Continue**: Resume from saved game (if save exists)
  - **Start Game** / **New Game**: Begin new adventure
  - **Options**: Settings menu (placeholder for future features)
  - **Mod Tools**: Access mod manager directly from menu
  - **Character Designer**: Jump straight to character creation
  - **Credits**: Game information and licensing
  - Animated button hover effects with glow

### 💾 **Save System**
- **Auto-Save**: Game automatically saves every 30 seconds
  - Visual notification when save occurs
  - Saves to localStorage with full game state
  
- **Manual Save**: Press 'S' key during gameplay to save instantly
  - Immediate feedback with save notification
  - Can be used anytime during active gameplay

- **Save State Includes**:
  - Player position, health, and character stats
  - Current weapon, level, and upgrades
  - Shield charges and type
  - Game progress (XP, level, score, kills)
  - Nearby enemies and their states
  - Timestamp for save age tracking

- **Continue Feature**: Main menu shows "Continue" button if save exists
  - Displays save info (character, level, time since save)
  - Restores complete game state
  - Graceful fallback if save is corrupted

- **Save Management**:
  - Export save as JSON file (via SaveManager API)
  - Import save from file (via SaveManager API)
  - Delete save option available
  - Version compatibility checking

### 🎯 **Quality of Life**
- Game now starts with professional main menu instead of character selection
- Seamless navigation between menu, character selection, and gameplay
- Save persistence across browser sessions via localStorage
- Auto-save ensures minimal progress loss
- Keyboard shortcuts: 'S' to save, 'M' for mods, 'R' to reload (Pierce Sniper)

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
