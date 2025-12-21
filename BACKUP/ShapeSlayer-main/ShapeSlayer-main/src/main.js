// 1. IMPORTS MUST BE AT THE TOP
import { Game, ctx, canvas } from './Game.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Gem } from './Gem.js';
import { Powerup } from './Powerup.js';
import { WeaponFactory } from './weapons/WeaponFactory.js'; // Updated import!
import { Orbital } from './Orbital.js'; // Moved this up here!
import { Explosion } from './Explosion.js'; // New explosion class!
import { PoisonPuddle } from './PoisonPuddle.js'; // Poison puddle class!
import { SelectionScreen } from './SelectionScreen.js'; // Selection screen class!
import { gameConfig } from './ConfigManager.js'; // Configuration manager!
import { characterManager } from './CharacterManager.js'; // Character system!
import { CharacterSelectionScreen } from './CharacterSelectionScreen.js'; // Character UI!

console.log("Main.js loaded successfully!");
console.log("Game object:", Game);

// Setup
let selectedWeapon = null;
let selectedCharacter = null;
let selectionScreen = new SelectionScreen();
let characterSelectionScreen = new CharacterSelectionScreen();
Game.player = null; // Don't create player until weapon is selected
let configLoaded = false;

// Load game configurations
async function loadGameConfig() {
    try {
        await Promise.all([
            gameConfig.loadConfigurations(),
            characterManager.loadConfigurations()
        ]);
        configLoaded = true;
        console.log('🎮 Game ready to start!');
        
        // Show character selection instead of weapon selection
        characterSelectionScreen.showCharacterSelection();
    } catch (error) {
        console.error('❌ Failed to load game configuration:', error);
        alert('Failed to load game configuration. Please refresh the page.');
    }
}

// Initialize the game
loadGameConfig();

// --- WEAPON SELECTION ---
window.selectWeapon = function(weaponType, character = null) {
    if (!configLoaded) {
        console.warn('Configuration not loaded yet!');
        return;
    }
    
    console.log("selectWeapon called with:", weaponType, character);
    selectedWeapon = weaponType;
    selectedCharacter = character;
    
    try {
        // Create player with selected weapon
        console.log("Creating player...");
        Game.player = new Player(canvas.width / 2, canvas.height / 2);
        console.log("Player created:", Game.player);
        
        console.log("Creating weapon...");
        Game.player.weapon = WeaponFactory.createWeapon(Game.player, weaponType);
        console.log("Weapon created:", Game.player.weapon);
        
        // Apply character traits if character was selected
        if (selectedCharacter) {
            characterManager.applyCharacterTraits(Game.player, selectedCharacter);
            console.log("Applied character traits for:", selectedCharacter.name);
            
            // Apply character-specific stats
            if (selectedCharacter.startingStats) {
                if (selectedCharacter.startingStats.speed) {
                    Game.player.baseSpeed = selectedCharacter.startingStats.speed;
                }
            }
            
            // Apply character colors
            if (selectedCharacter.colors?.primary) {
                Game.player.color = selectedCharacter.colors.primary;
            }
        }
        
        // Hide weapon selection menu
        document.getElementById('weaponSelection').style.display = 'none';
        console.log("Weapon selection hidden");
        
        console.log(`Selected weapon: ${weaponType} for character: ${selectedCharacter?.name || 'None'}`);
        
        // Start the game
        Game.active = true;
        console.log("Game activated!");
    } catch (error) {
        console.error("Error in selectWeapon:", error);
    }
};

function update() {
    if (!Game.active || !Game.player) return;
    
    // Ensure poison puddles array exists
    if (!Game.poisonPuddles) {
        Game.poisonPuddles = [];
    }

    Game.player.update();

    // Spawn Enemies
    const spawnRate = gameConfig.getSpawnSettings()?.enemySpawnRate || 60;
    if (Game.frameCount % spawnRate === 0) {
        Game.enemies.push(new Enemy());
    }

    // --- CONSOLIDATED ENEMY LOOP ---
    // We use a reverse loop so we can remove items safely
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        let e = Game.enemies[i];
        e.update();

        // 1. Check if killed by Orbital (Swords/Shield)
// ... inside enemy loop ...
        if (e.dead) {
            Game.enemies.splice(i, 1);
            Game.gems.push(new Gem(e.x, e.y, e.xpValue)); // Use enemy's XP value

            // --- NEW: 90% Chance to drop Magnet Powerup ---
            if (Math.random() < 0.9) { 
                Game.powerups.push(new Powerup(e.x, e.y));
                console.log("Magnet Dropped!");
            }
            // ---------------------------------------------
            
            Game.score += 10;
            document.getElementById('score').innerText = Game.score;
            continue;
        }

        // 2. Check Collision with Player
        const dist = Math.hypot(e.x - Game.player.x, e.y - Game.player.y);
        if (dist < 20) {
            // Check if Holy Shield blocks the attack
            if (Game.player.weapon && Game.player.weapon.tryBlockAttack()) {
                // Attack was blocked, continue to next enemy
                continue;
            } else {
                // Player takes damage - game over
                Game.active = false;
                document.getElementById('gameover').style.display = 'block';
            }
        }
    }

    // --- BULLET LOOP ---
    Game.bullets.forEach((b, i) => {
        b.update();
        
        // Check if bullet is expired (distance-based)
        if (b.isExpired) {
             // Create explosion if it's a rocket that expired
             if (b.type === 'rocket') {
                 Game.explosions.push(new Explosion(b.x, b.y, b.explosionRadius, b.damage));
             }
             // Create poison puddle if it's a potion that expired
             else if (b.type === 'potion' && b.isPlaguePotion && b.puddleData) {
                 Game.poisonPuddles.push(new PoisonPuddle(b.x, b.y, b.puddleData));
             }
             Game.bullets.splice(i, 1);
             return;
        }
        
        // Remove bullet if way off screen (give extra margin for long-range weapons)
        const margin = 500; // Extra margin beyond screen edges
        if (b.x < -margin || b.x > canvas.width + margin || 
            b.y < -margin || b.y > canvas.height + margin) {
             // Create explosion if it's a rocket that went off screen
             if (b.type === 'rocket') {
                 Game.explosions.push(new Explosion(b.x, b.y, b.explosionRadius, b.damage));
             }
             // Create poison puddle if it's a potion that went off screen
             else if (b.type === 'potion' && b.isPlaguePotion && b.puddleData) {
                 Game.poisonPuddles.push(new PoisonPuddle(b.x, b.y, b.puddleData));
             }
             Game.bullets.splice(i, 1);
             return;
        }

        // Check collisions with Enemies
        // Note: We use a reverse loop for enemies here too to safely splice
        let bulletShouldBeRemoved = false;
        
        for (let j = Game.enemies.length - 1; j >= 0; j--) {
            let e = Game.enemies[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            
            if (dist < e.size + b.radius) {
                // Check if piercing bullet can hit this enemy
                if (b.type === 'piercing' && !b.canHitEnemy(e)) {
                    continue; // Skip this enemy if already hit by piercing bullet
                }
                
                // Handle collision based on bullet type
                if (b.type === 'rocket') {
                    // Create explosion at rocket position
                    Game.explosions.push(new Explosion(b.x, b.y, b.explosionRadius, b.damage));
                    bulletShouldBeRemoved = true;
                } else if (b.type === 'potion') {
                    // Create poison puddle at potion impact
                    if (b.isPlaguePotion && b.puddleData) {
                        Game.poisonPuddles.push(new PoisonPuddle(b.x, b.y, b.puddleData));
                    }
                    
                    // Deal minimal direct damage
                    const isDead = e.takeDamage(b.damage);
                    bulletShouldBeRemoved = true;
                    
                    if (isDead) {
                        // Remove enemy and drop rewards
                        Game.enemies.splice(j, 1);
                        Game.gems.push(new Gem(e.x, e.y, e.xpValue));
                        
                        // 10% chance to drop powerup from potion kills
                        if (Math.random() < 0.1) {
                            Game.powerups.push(new Powerup(e.x, e.y));
                            console.log("Powerup dropped from potion kill!");
                        }
                        
                        Game.score += 10;
                        document.getElementById('score').innerText = Game.score;
                    }
                } else if (b.type === 'piercing') {
                    // Piercing bullet (cards) - handle damage and DOT effects
                    
                    // Calculate damage based on enemy type (like paladin)
                    let damage = b.damage;
                    if (e.type === 'medium') {
                        damage = b.damage * 2; // Double damage to medium enemies
                    }
                    
                    // Apply damage and DOT effects
                    let damageType = 'normal';
                    if (b.hasPoison && b.hasFire) {
                        damageType = 'mixed';
                        // Apply both poison and fire DOT
                        e.applyPoison(b.poisonDamage, b.dotDuration);
                        e.applyBurn(b.fireDamage, b.dotDuration);
                    } else if (b.hasPoison) {
                        damageType = 'poison';
                        e.applyPoison(b.poisonDamage, b.dotDuration);
                    } else if (b.hasFire) {
                        damageType = 'fire';
                        e.applyBurn(b.fireDamage, b.dotDuration);
                    }
                    
                    const isDead = e.takeDamage(damage, damageType);
                    
                    // Mark this enemy as hit by this piercing bullet
                    b.markEnemyHit(e);
                    
                    if (isDead) {
                        // Kill Enemy
                        Game.enemies.splice(j, 1); // Remove Enemy
                        Game.gems.push(new Gem(e.x, e.y, e.xpValue)); // Drop Gem with enemy's XP value
                        
                        // 10% Chance to drop Powerup from bullet kills
                        if (Math.random() < 0.1) { 
                            Game.powerups.push(new Powerup(e.x, e.y));
                            console.log("Powerup Dropped from piercing card kill!");
                        }
                        
                        Game.score += 10;
                        document.getElementById('score').innerText = Game.score;
                    }
                    
                    // Check if bullet should be removed (handled by markEnemyHit)
                    if (b.isExpired) {
                        bulletShouldBeRemoved = true;
                    }
                } else {
                    // Regular bullet - damage single enemy
                    const isDead = e.takeDamage(b.damage);
                    bulletShouldBeRemoved = true;
                    
                    if (isDead) {
                        // Kill Enemy
                        Game.enemies.splice(j, 1); // Remove Enemy
                        Game.gems.push(new Gem(e.x, e.y, e.xpValue)); // Drop Gem with enemy's XP value
                        
                        // --- NEW: 10% Chance to drop Powerup from bullet kills too ---
                        if (Math.random() < 0.1) { 
                            Game.powerups.push(new Powerup(e.x, e.y));
                            console.log("Powerup Dropped from bullet kill!");
                        }
                        
                        Game.score += 10;
                        document.getElementById('score').innerText = Game.score;
                    }
                }
                
                if (bulletShouldBeRemoved) {
                    break; // Stop checking enemies for this bullet
                }
            }
        }
        
        // Remove bullet if it should be removed
        if (bulletShouldBeRemoved) {
            Game.bullets.splice(i, 1);
        }
    });

    // --- POWERUP LOOP ---
    Game.powerups.forEach((p, i) => {
        p.update();
        
        if (p.collected) {
            // MAGNET EFFECT: 
            // Loop through ALL gems and force them to fly to player
            Game.gems.forEach(gem => {
                gem.magnetized = true; 
                gem.speed = 12; // Make them fly faster than normal!
            });
            
            console.log("MAGNET ACTIVATED!");
            Game.powerups.splice(i, 1); // Remove powerup
        }
    });

    // --- GEM LOOP ---
    Game.gems.forEach((g, i) => {
        g.update();
        if (g.collected) {
            Game.player.gainXp(g.xpValue);
            Game.gems.splice(i, 1);
        }
    });

    // --- EXPLOSION LOOP ---
    Game.explosions.forEach((explosion, i) => {
        const shouldRemove = explosion.update();
        if (shouldRemove) {
            Game.explosions.splice(i, 1);
        }
    });

    // --- POISON PUDDLE LOOP ---
    if (Game.poisonPuddles && Game.poisonPuddles.length > 0) {
        Game.poisonPuddles.forEach((puddle, i) => {
            try {
                const shouldRemove = puddle.update();
                if (shouldRemove) {
                    Game.poisonPuddles.splice(i, 1);
                }
            } catch (error) {
                console.error("Error updating poison puddle:", error);
                Game.poisonPuddles.splice(i, 1); // Remove problematic puddle
            }
        });
    }

    Game.frameCount++;
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Game.gems.forEach(g => g.draw());
    Game.poisonPuddles.forEach(puddle => puddle.draw()); // Draw poison puddles behind other elements
    Game.bullets.forEach(b => b.draw());
    Game.enemies.forEach(e => e.draw());
    Game.explosions.forEach(explosion => explosion.draw()); // Draw explosions
    if (Game.player) {
        Game.player.draw();
        
        // Draw weapon effects (like Paladin arc)
        if (Game.player.weapon && Game.player.weapon.drawArcEffect) {
            Game.player.weapon.drawArcEffect();
        }
    }
    Game.powerups.forEach(p => p.draw());
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop); // Always continue the loop
}

// --- INPUT HANDLERS ---

const uploadInput = document.getElementById('spriteUpload');
if (uploadInput) {
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                Game.player.sprite = img;
            };
        }
    });
}

// --- UPGRADE SYSTEM ---

window.chooseUpgrade = function(type) {
    // 1. Check if we already have this upgrade
    const existingOrbital = Game.player.orbitals.find(orb => orb.type === type);

    if (existingOrbital) {
        existingOrbital.upgrade();
        console.log("Upgraded " + type);
    } else {
        Game.player.orbitals.push(new Orbital(Game.player, type));
        console.log("Added new " + type);
    }
    
    // 2. Hide the menu
    document.getElementById('upgradeMenu').style.display = 'none';
    
    // 3. Resume the game
    Game.active = true;
    loop(); 
};

// --- WEAPON UPGRADE SYSTEM ---
window.chooseWeaponUpgrade = function(upgradeType) {
    if (Game.player && Game.player.weapon) {
        Game.player.weapon.applyUpgrade(upgradeType);
    }
    
    // Hide the weapon upgrade menu
    selectionScreen.hideWeaponUpgradeMenu();
    
    // Resume the game
    Game.active = true;
};

window.rerollWeaponUpgrades = function() {
    if (selectionScreen.rerollUpgrades()) {
        console.log("Upgrades rerolled!");
    } else {
        console.log("No rerolls remaining!");
    }
};

// --- INITIALIZATION ---

// 1. Expose Game to Console (Fixes your ReferenceError!)
window.Game = Game;
window.selectionScreen = selectionScreen;
window.characterSelectionScreen = characterSelectionScreen;

// 2. Debug function to manually spawn powerup for testing
window.spawnPowerup = function() {
    if (!Game.player) return;
    const x = Game.player.x + (Math.random() - 0.5) * 200;
    const y = Game.player.y + (Math.random() - 0.5) * 200;
    Game.powerups.push(new Powerup(x, y));
    console.log("Debug powerup spawned at", x, y);
};

// 3. Start the game (paused, waiting for weapon selection)
Game.active = false;
loop();
loop();