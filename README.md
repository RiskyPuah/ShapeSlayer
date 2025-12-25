# 🎯 ShapeSlayer

A fast-paced, top-down survival game featuring diverse weapon systems, dynamic enemies, and strategic character progression. Fight waves of geometric enemies using unique weapons with special abilities and build your perfect character loadout.

📜 License This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Game Overview

ShapeSlayer is a bullet-hell style survival game where you:
- Battle endless waves of geometric enemies
- Unlock and master diverse weapon types  
- Build unique character combinations
- Survive as long as possible while growing stronger

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ShapeSlayer
   ```

2. **Start local server**
   ```bash
   python -m http.server 8080
   ```

3. **Open in browser**
   Navigate to `http://localhost:8080` and start playing!

## ⚔️ Weapon Arsenal

### 🔫 **Pistol** - *Balanced Fighter*
- **Role**: All-around reliable weapon
- **Features**: Moderate damage, steady fire rate
- **Best For**: Beginners, consistent damage output

### 💥 **Shotgun** - *Close Combat Devastator*
- **Role**: High damage at short range
- **Features**: 5-pellet spread, devastating up close
- **Best For**: Aggressive playstyle, crowd control

### 🔥 **Minigun** - *Bullet Storm*
- **Role**: High DPS suppression weapon
- **Features**: Rapid-fire bullets, sustained damage
- **Best For**: Raw damage output, bullet walls

### 🚀 **Rocket Launcher** - *Area Devastation*
- **Role**: Explosive area damage
- **Features**: Massive blast radius, high single-target damage
- **Best For**: Crowd clearing, high-health enemies

### 🛡️ **Paladin** - *Holy Warrior*
- **Role**: Defensive melee fighter
- **Features**: Arc sword attacks, holy shield protection
- **Special**: 
  - **Arc Slash**: Melee attack in front of player
  - **Holy Shield**: Temporary invincibility cooldown
- **Best For**: Tank playstyle, close-range combat

### 🎯 **Sniper** - *Precision Eliminator*
- **Role**: Long-range elimination
- **Features**: Infinite range, high damage, slower fire rate
- **Best For**: Precision targeting, staying at distance

### 🧪 **Plague Doctor** - *Area Denial Specialist*
- **Role**: DOT and area control
- **Features**: Poison potions create puddles
- **Special**:
  - **Poison Puddles**: Create damaging areas that slow enemies
  - **DOT Effects**: Continuous poison damage over time
- **Best For**: Area control, defensive positioning

### 🔥 **Pyromancer** - *Fire Mage*
- **Role**: Continuous flame damage
- **Features**: Arc flamethrower with burn effects
- **Special**:
  - **Flame Arc**: Continuous fire in front of player
  - **Burn DOT**: Enemies catch fire and take damage over time
- **Best For**: Sustained damage, visual spectacle

### 🃏 **Card Thrower** - *Piercing Specialist*
- **Role**: Multi-target precision
- **Features**: 3-card spread, piercing mechanics
- **Special**:
  - **Piercing Cards**: Each card hits up to 3 enemies
  - **Elemental Cards**: Upgradeable with poison/fire effects
  - **Spread Pattern**: 12-degree arc for coverage
- **Best For**: Crowd penetration, elemental combinations

## 🛡️ Enemy Types

### 🟥 **Normal Enemy** - *Basic Threat*
- Standard health and speed
- Forms the backbone of enemy waves

### 🟧 **Medium Enemy** - *Enhanced Threat*  
- Higher health and damage resistance
- Takes double damage from piercing attacks

### 🛡️ **Shielded Enemy** - *Defensive Unit*
- **Shield System**: Blocks first hit completely
- **Speed Boost**: 30% faster when shield breaks
- **Weakness**: Poison damage bypasses shields

## 🎭 Character Classes

### ⚔️ **Warrior** - *Balanced Tank*
- **Weapon**: Paladin (Arc + Holy Shield)
- **Stats**: 100 HP, 4 Speed
- **Trait**: Tank (increased survivability)

### 🏹 **Ranger** - *Precision Marksman*
- **Weapon**: Sniper (long-range elimination)
- **Stats**: 80 HP, 5 Speed  
- **Traits**: Marksman + Speed Demon

### 🔫 **Gunslinger** - *Fast Shooter*
- **Weapon**: Pistol (reliable damage)
- **Stats**: 90 HP, 4.5 Speed
- **Trait**: Berserker (damage boost)

### 💣 **Demolitionist** - *Explosive Expert*
- **Weapon**: Rocket Launcher (area damage)
- **Stats**: 120 HP, 3.5 Speed
- **Trait**: Explosive (blast radius bonus)

### 📚 **Scholar** - *Knowledge Seeker*
- **Weapon**: Pistol (starter weapon)
- **Stats**: 70 HP, 4 Speed
- **Traits**: Scholar (XP bonus) + Magnet (auto-collect)

### 🎒 **Nomad** - *Adaptive Survivor*
- **Weapon**: Shotgun (close combat)
- **Stats**: 85 HP, 4.8 Speed
- **Traits**: Dodge + Lucky

### 🎭 **Card Master** - *Mystical Performer*
- **Weapon**: Card Thrower (piercing specialist)
- **Stats**: 85 HP, 4.2 Speed
- **Traits**: Marksman + Lucky

## 🔧 Game Mechanics

### 💨 **Bullet Decay System**
- Projectiles expire based on weapon-specific ranges
- Prevents infinite bullets for performance
- Each weapon has optimized maximum distance

### 🎯 **Weapon-Specific Aiming**
- **Arc Indicators**: Paladin, Shotgun, Pyromancer show attack areas
- **Line Indicators**: Pistol, Sniper, others show precise aim
- **No Indicator**: Card Thrower uses visual spread feedback

### 💀 **Damage Over Time (DOT)**
- **Poison**: Bypasses shields, 2 ticks per second
- **Burn**: Standard damage, 3 ticks per second
- **Stacking**: Multiple effects can coexist

### 🛡️ **Shield Mechanics**
- Blocks one hit completely
- Speed boost when broken
- Poison damage bypasses shields
- Visual indicators for shield status

## 🎮 Controls

- **Mouse**: Aim weapon
- **Left Click**: Attack/Shoot
- **WASD/Arrow Keys**: Move character
- **Character Selection**: Click desired character at start

## 📁 Project Structure

```
ShapeSlayer/
├── index.html              # Game entry point
├── styles.css              # Game styling
├── README.md               # This documentation
├── MODDING_GUIDE.md        # Mod system guide
├── MODULAR_GUIDE.md        # Development guide
├── data/                   # Game configuration
│   ├── characters.json     # Character definitions  
│   ├── enemies.json        # Enemy configurations
│   ├── weapons.json        # Weapon specifications
│   ├── traits.json         # Character trait effects
│   ├── upgrades.json       # Upgrade system data
│   └── gameSettings.json   # Global game settings
├── mods/                   # Mod system
│   ├── enabled.json        # Enabled mods list
│   ├── mod-template/       # Template for new mods
│   └── pierce-character/   # Example mod
└── src/                    # Source code (modular architecture)
    ├── engine/             # Core game engine
    │   ├── main.js         # Game entry point & coordination
    │   ├── Game.js         # Game state management
    │   ├── GameInitializer.js  # Configuration loading
    │   ├── GameLoop.js     # Update & render loops
    │   ├── GameStarter.js  # Game start logic
    │   └── EventHandlers.js # Input & event handling
    ├── entities/           # Game entities
    │   ├── Player.js       # Player logic & rendering
    │   ├── Enemy.js        # Enemy AI & rendering
    │   └── Gem.js          # XP gem system
    ├── projectiles/        # Projectile effects
    │   ├── Explosion.js    # Explosion effects
    │   ├── Orbital.js      # Orbital mechanics
    │   └── PoisonPuddle.js # Poison area effects
    ├── powerups/           # Power-up system
    │   └── Powerup.js      # Power-up items
    ├── characters/         # Character system
    │   ├── CharacterManager.js      # Character data management
    │   ├── CharacterSelectionScreen.js  # Character UI
    │   ├── ConfigManager.js # Configuration loader
    │   └── SelectionScreen.js # Upgrade selection UI
    ├── mods-system/        # Mod system (⚠️ IN DEVELOPMENT)
    │   ├── ModManager.js   # Mod discovery & loading
    │   └── ModManagerScreen.js  # Mod management UI
    └── weapons/            # Weapon system
        ├── BaseWeapon.js   # Base weapon class
        ├── Bullet.js       # Projectile management
        ├── WeaponFactory.js # Weapon creation
        └── types/          # Individual weapons
            ├── Pistol.js
            ├── Shotgun.js  
            ├── Minigun.js
            ├── Rocket.js
            ├── Paladin.js
            ├── Sniper.js
            ├── PlagueDoctor.js
            ├── Pyromancer.js
            └── CardThrower.js
```

## 🔮 Advanced Features

### 🃏 **Card Thrower Mechanics**
- **3-Card Spread**: Each attack throws 3 piercing cards
- **Piercing System**: Cards can hit multiple enemies in sequence
- **Elemental Enhancement**: 
  - Poison cards apply DOT and show green color
  - Fire cards apply burn DOT and show red color
  - Mixed effects combine both (orange color)

### 🧪 **Poison Puddle System**
- Plague Doctor potions create area denial zones
- Puddles grow over time and apply continuous damage
- Enemies are slowed while in poison areas

### 🔥 **Arc Flame Mechanics**
- Pyromancer creates flame arcs in front of player
- Continuous damage while holding attack
- Visual fire effects with particle systems

### 🛡️ **Holy Shield System**
- Paladin-exclusive defensive ability
- Temporary invincibility with cooldown
- Visual shield effect during activation

## 🎯 Combat Tips

### 🎪 **Card Thrower Strategy**
- Position to maximize piercing through enemy lines
- Use elemental upgrades for additional DOT damage
- Spread pattern covers wide areas effectively

### 🔥 **Pyromancer Strategy** 
- Stay close for maximum flame arc effectiveness
- Use burn DOT to finish off retreating enemies
- Control space with continuous fire walls

### 🧪 **Plague Doctor Strategy**
- Create defensive poison puddle barriers  
- Use area denial to control enemy movement
- Combine with other weapons for zone control

### 🛡️ **Paladin Strategy**
- Use Holy Shield timing for critical moments
- Arc attacks handle multiple enemies efficiently  
- Tank damage while dealing close-range devastation

## 🚀 Performance Features

- **Bullet Decay**: Automatic cleanup prevents lag
- **Efficient Rendering**: Optimized drawing loops
- **Smart Collision**: Piercing system with hit tracking
- **Memory Management**: Automatic garbage collection

## 🛠️ Development

### 🔧 Mod System (⚠️ IN DEVELOPMENT)

ShapeSlayer includes a modding system that allows custom characters, weapons, and gameplay mechanics. **The mod system is currently under active development and may have issues or incomplete features.**

For modding documentation, see [MODDING_GUIDE.md](MODDING_GUIDE.md).

**Status:**
- ✅ Mod discovery and loading
- ✅ Custom character support
- ✅ Custom weapon integration
- ⚠️ Mod manager UI (testing)
- 🚧 Documentation (in progress)
- 🚧 Stability improvements (ongoing)

### Adding New Weapons
1. Create weapon class in `src/weapons/types/`
2. Add import to `WeaponFactory.js`
3. Add configuration to `data/weapons.json`
4. Add character in `data/characters.json` (optional)

### Adding New Enemies  
1. Define enemy in `data/enemies.json`
2. Update spawn weights and configurations
3. Add special mechanics in `Enemy.js` if needed

### Configuration System
All game balance is controlled via JSON files in `/data/`:
- Weapon stats, upgrades, and visuals
- Enemy health, speed, and spawn rates
- Character starting stats and traits
- Global game settings and difficulty

## 🎉 Recent Updates

### ❤️ **Version 1.2.5 - "The Heartful Update"** *(Latest - December 25, 2025)*
- **Health System Overhaul**: Binding of Isaac style hearts (2 HP per heart)
- **Shield System Rework**: Modular shield classes with visual icons
- **Smart Paladin Targeting**: AI targets enemy clusters intelligently
- **Holy Shield Powerup**: Collectible shields for all characters
- **Character Rebalance**: Health adjusted for new heart system (2-5 hearts)

### 🏗️ **Version 1.2.0 - "The Great Refactor"** *(December 25, 2025)*
- **Modular Architecture**: Complete codebase reorganization
- **Engine Separation**: Split into focused modules (GameLoop, GameStarter, etc.)
- **Improved Mod System**: Better integration and loading
- **Bug Fixes**: Fixed mod paths and imports

### 🃏 **Version 1.1.0 - Card Thrower & Elemental Effects**
- Card Thrower weapon with piercing mechanics
- Pyromancer flamethrower weapon
- Plague Doctor poison puddles
- Shielded enemy types

*For detailed changelog, see [CHANGELOG.md](CHANGELOG.md)*

---

**Have fun surviving the geometric apocalypse! 🎮💀**

*Created with ❤️ for fast-paced action and strategic depth*
