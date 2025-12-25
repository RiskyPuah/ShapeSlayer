/**
 * GameLoop.js
 * Handles the main game update and draw loop
 */

import { Game, ctx, canvas } from './Game.js';
import { Enemy } from '../entities/Enemy.js';
import { Gem } from '../entities/Gem.js';
import { Powerup } from '../powerups/Powerup.js';
import { PowerupFactory } from '../powerups/PowerupFactory2.js';
import { Explosion } from '../projectiles/Explosion.js';
import { PoisonPuddle } from '../projectiles/PoisonPuddle.js';
import { gameConfig } from '../characters/ConfigManager.js';
import { modManagerScreen } from '../mods-system/ModManagerScreen.js';
import { aimingSystem } from './AimingSystem.js';

export class GameLoop {
    constructor() {
        this.updateAmmoDisplay = this.updateAmmoDisplay.bind(this);
    }

    /**
     * Update ammo display for weapons with limited ammo
     */
    updateAmmoDisplay() {
        const ammoDisplay = document.getElementById('ammo-display');
        const ammoCount = document.getElementById('ammo-count');
        const ammoMax = document.getElementById('ammo-max');
        
        if (Game.player && Game.player.weapon && Game.player.weapon.maxAmmo !== undefined) {
            ammoDisplay.style.display = 'block';
            ammoCount.textContent = Game.player.weapon.ammo || 0;
            ammoMax.textContent = Game.player.weapon.maxAmmo || 0;
            
            if (Game.player.weapon.ammo <= 0) {
                ammoDisplay.style.color = '#ff4444';
            } else if (Game.player.weapon.ammo <= Game.player.weapon.maxAmmo * 0.3) {
                ammoDisplay.style.color = '#ffaa44';
            } else {
                ammoDisplay.style.color = 'white';
            }
        } else {
            ammoDisplay.style.display = 'none';
        }
    }

    /**
     * Main update function
     */
    update() {
        if (!Game.active || !Game.player) return;
        
        if (!Game.poisonPuddles) {
            Game.poisonPuddles = [];
        }

        Game.player.update();
        this.updateAmmoDisplay();

        // Spawn Enemies
        const spawnRate = gameConfig.getSpawnSettings()?.enemySpawnRate || 60;
        if (Game.frameCount % spawnRate === 0) {
            Game.enemies.push(new Enemy());
        }

        this.updateEnemies();
        this.updateBullets();
        this.updatePowerups();
        this.updateAmmoPacks();
        this.updateGems();
        this.updateExplosions();
        this.updatePoisonPuddles();

        Game.frameCount++;
    }

    /**
     * Update all enemies
     */
    updateEnemies() {
        for (let i = Game.enemies.length - 1; i >= 0; i--) {
            let e = Game.enemies[i];
            e.update();

            if (e.dead) {
                Game.enemies.splice(i, 1);
                // Always spawn gem (XP drop)
                Game.gems.push(new Gem(e.x, e.y, e.xpValue));

                // Spawn powerup using factory
                const powerup = PowerupFactory.spawnPowerup(e.x, e.y);
                if (powerup) {
                    Game.powerups.push(powerup);
                }
                
                Game.score += 10;
                document.getElementById('score').innerText = Game.score;
                continue;
            }

            // Check collision with player
            const dist = Math.hypot(e.x - Game.player.x, e.y - Game.player.y);
            if (dist < 20) {
                // Try to block with shield first
                if (Game.player.shield && Game.player.shield.tryBlock(1)) {
                    continue;
                }
                
                // Try to block with weapon (legacy paladin mechanic)
                if (Game.player.weapon && Game.player.weapon.tryBlockAttack) {
                    if (Game.player.weapon.tryBlockAttack()) {
                        continue;
                    }
                }
                
                // No shield/block - take damage
                Game.player.healthManager.takeDamage(1);
                
                // Check if player is dead
                if (Game.player.healthManager.isDead()) {
                    Game.active = false;
                    document.getElementById('gameover').style.display = 'block';
                }
            }
        }
    }

    /**
     * Update all bullets
     */
    updateBullets() {
        Game.bullets.forEach((b, i) => {
            b.update();
            
            if (b.isExpired) {
                this.handleExpiredBullet(b);
                Game.bullets.splice(i, 1);
                return;
            }
            
            const margin = 500;
            if (b.x < -margin || b.x > canvas.width + margin || 
                b.y < -margin || b.y > canvas.height + margin) {
                this.handleExpiredBullet(b);
                Game.bullets.splice(i, 1);
                return;
            }

            let bulletShouldBeRemoved = this.checkBulletCollisions(b);
            
            if (bulletShouldBeRemoved) {
                Game.bullets.splice(i, 1);
            }
        });
    }

    /**
     * Handle expired bullet effects
     */
    handleExpiredBullet(b) {
        if (b.type === 'rocket') {
            Game.explosions.push(new Explosion(b.x, b.y, b.explosionRadius, b.damage));
        } else if (b.type === 'potion' && b.isPlaguePotion && b.puddleData) {
            Game.poisonPuddles.push(new PoisonPuddle(b.x, b.y, b.puddleData));
        }
    }

    /**
     * Check bullet collisions with enemies
     */
    checkBulletCollisions(b) {
        let bulletShouldBeRemoved = false;
        
        for (let j = Game.enemies.length - 1; j >= 0; j--) {
            let e = Game.enemies[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            
            if (dist < e.size + b.radius) {
                if (b.type === 'piercing' && !b.canHitEnemy(e)) {
                    continue;
                }
                
                bulletShouldBeRemoved = this.handleBulletHit(b, e, j);
                
                if (bulletShouldBeRemoved) {
                    break;
                }
            }
        }
        
        return bulletShouldBeRemoved;
    }

    /**
     * Handle bullet hitting an enemy
     */
    handleBulletHit(b, e, enemyIndex) {
        if (b.type === 'rocket') {
            Game.explosions.push(new Explosion(b.x, b.y, b.explosionRadius, b.damage));
            return true;
        } else if (b.type === 'potion') {
            if (b.isPlaguePotion && b.puddleData) {
                Game.poisonPuddles.push(new PoisonPuddle(b.x, b.y, b.puddleData));
            }
            
            const isDead = e.takeDamage(b.damage);
            
            if (isDead) {
                this.removeEnemy(e, enemyIndex, 0.1);
            }
            return true;
        } else if (b.type === 'piercing') {
            return this.handlePiercingBullet(b, e, enemyIndex);
        } else {
            const isDead = e.takeDamage(b.damage);
            
            // Drop ammo pack behind player when Pierce Sniper hits enemy
            if (b.pierceSniper && b.pierceSniperWeapon && Game.player) {
                // Drop behind player (opposite of aim direction)
                const angle = Math.atan2(b.vy, b.vx);
                const dropX = Game.player.x - Math.cos(angle) * 40;
                const dropY = Game.player.y - Math.sin(angle) * 40;
                b.pierceSniperWeapon.dropAmmoPackAt(dropX, dropY);
            }
            
            if (isDead) {
                this.removeEnemy(e, enemyIndex, 0.1);
            }
            return true;
        }
    }

    /**
     * Handle piercing bullet logic
     */
    handlePiercingBullet(b, e, enemyIndex) {
        let damage = b.damage;
        if (e.type === 'medium') {
            damage = b.damage * 2;
        }
        
        let damageType = 'normal';
        if (b.hasPoison && b.hasFire) {
            damageType = 'mixed';
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
        b.markEnemyHit(e);
        
        if (isDead) {
            this.removeEnemy(e, enemyIndex, 0.1);
        }
        
        return b.isExpired;
    }

    /**
     * Remove enemy and drop rewards
     */
    removeEnemy(e, index, powerupChance) {
        Game.enemies.splice(index, 1);
        // Always spawn gem (XP drop)
        Game.gems.push(new Gem(e.x, e.y, e.xpValue));
        
        // Spawn powerup if chance succeeds - offset position to avoid overlap
        const powerup = PowerupFactory.spawnPowerup(e.x, e.y);
        if (powerup) {
            Game.powerups.push(powerup);
        }
        
        Game.score += 10;
        document.getElementById('score').innerText = Game.score;
    }

    /**
     * Update powerups
     */
    updatePowerups() {
        Game.powerups.forEach((p, i) => {
            p.update();
            
            if (p.collected) {
                Game.powerups.splice(i, 1);
            }
        });
    }

    /**
     * Update ammo packs
     */
    updateAmmoPacks() {
        if (Game.ammoPacks) {
            Game.ammoPacks.forEach((ammoPack, i) => {
                ammoPack.update();
                if (ammoPack.shouldRemove) {
                    Game.ammoPacks.splice(i, 1);
                }
            });
        }
    }

    /**
     * Update gems
     */
    updateGems() {
        Game.gems.forEach((g, i) => {
            g.update();
            if (g.collected) {
                Game.player.gainXp(g.xpValue);
                Game.gems.splice(i, 1);
            }
        });
    }

    /**
     * Update explosions
     */
    updateExplosions() {
        Game.explosions.forEach((explosion, i) => {
            const shouldRemove = explosion.update();
            if (shouldRemove) {
                Game.explosions.splice(i, 1);
            }
        });
    }

    /**
     * Update poison puddles
     */
    updatePoisonPuddles() {
        if (Game.poisonPuddles && Game.poisonPuddles.length > 0) {
            Game.poisonPuddles.forEach((puddle, i) => {
                try {
                    const shouldRemove = puddle.update();
                    if (shouldRemove) {
                        Game.poisonPuddles.splice(i, 1);
                    }
                } catch (error) {
                    console.error("Error updating poison puddle:", error);
                    Game.poisonPuddles.splice(i, 1);
                }
            });
        }
    }

    /**
     * Main draw function
     */
    draw() {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        Game.gems.forEach(g => g.draw());
        Game.poisonPuddles.forEach(puddle => puddle.draw());
        Game.bullets.forEach(b => b.draw());
        Game.enemies.forEach(e => e.draw());
        Game.explosions.forEach(explosion => explosion.draw());
        
        if (Game.player) {
            Game.player.draw();
            
            if (Game.player.weapon && Game.player.weapon.drawArcEffect) {
                Game.player.weapon.drawArcEffect();
            }
            
            // Draw Pierce Sniper reload indicator
            if (Game.player.weapon && Game.player.weapon.drawReloadIndicator) {
                Game.player.weapon.drawReloadIndicator(ctx);
            }
        }
        
        Game.powerups.forEach(p => p.draw());

        if (Game.ammoPacks) {
            Game.ammoPacks.forEach(ammoPack => ammoPack.draw());
        }

        // Draw aiming indicator (crosshair in manual mode)
        aimingSystem.drawAimIndicator(ctx);

        modManagerScreen.draw();
    }

    /**
     * Main loop
     */
    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    /**
     * Start the game loop
     */
    start() {
        this.loop();
    }
}

export const gameLoop = new GameLoop();
