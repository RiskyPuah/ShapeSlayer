import { Game, ctx } from '../engine/Game.js';
import { Gem } from '../entities/Gem.js';
import { Powerup } from '../powerups/Powerup.js';

export class PoisonPuddle {
    constructor(x, y, puddleData) {
        this.x = x;
        this.y = y;
        this.radius = puddleData.initialRadius;
        this.maxRadius = puddleData.maxRadius;
        this.growthRate = puddleData.growthRate;
        this.damage = puddleData.baseDamage;
        this.slowEffect = puddleData.slowEffect;
        this.duration = puddleData.duration;
        this.age = 0;
        this.tickCounter = 0; // For DOT timing
        this.affectedEnemies = new Set(); // Track enemies in puddle
    }
    
    update() {
        this.age++;
        this.tickCounter++;
        
        // Grow the puddle gradually
        if (this.radius < this.maxRadius) {
            this.radius += this.growthRate;
            this.radius = Math.min(this.radius, this.maxRadius);
        }
        
        // Clear affected enemies list each frame (will be repopulated)
        this.affectedEnemies.clear();
        
        // Check for enemies in puddle and apply effects
        Game.enemies.forEach((enemy, enemyIndex) => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            
            if (dist <= this.radius) {
                this.affectedEnemies.add(enemy);
                
                // Apply slow effect
                if (!enemy.originalSpeed) {
                    enemy.originalSpeed = enemy.speed;
                }
                enemy.speed = enemy.originalSpeed * (1 - this.slowEffect);
                enemy.isPoisoned = true;
                enemy.poisonTimer = 30; // Visual effect timer
                
                // Apply DOT every 20 frames (about 3 times per second)
                if (this.tickCounter % 20 === 0) {
                    const isDead = enemy.takeDamage(this.damage, 'poison');
                    
                    if (isDead) {
                        // Remove enemy and drop rewards
                        Game.enemies.splice(enemyIndex, 1);
                        Game.gems.push(new Gem(enemy.x, enemy.y, enemy.xpValue));
                        
                        // 15% chance to drop powerup from poison kills
                        if (Math.random() < 0.15) {
                            Game.powerups.push(new Powerup(enemy.x, enemy.y));
                            console.log("Powerup dropped from poison kill!");
                        }
                        
                        Game.score += 10;
                        document.getElementById('score').innerText = Game.score;
                    }
                }
            }
        });
        
        // Restore speed for enemies no longer in any poison puddle
        Game.enemies.forEach(enemy => {
            if (!this.affectedEnemies.has(enemy)) {
                // Check if enemy is in any other poison puddle
                let inOtherPuddle = false;
                if (Game.poisonPuddles) {
                    for (let puddle of Game.poisonPuddles) {
                        if (puddle === this) continue;
                        const dist = Math.hypot(enemy.x - puddle.x, enemy.y - puddle.y);
                        if (dist <= puddle.radius) {
                            inOtherPuddle = true;
                            break;
                        }
                    }
                }
                
                if (!inOtherPuddle && enemy.originalSpeed) {
                    enemy.speed = enemy.originalSpeed;
                    enemy.isPoisoned = false;
                    enemy.poisonTimer = 0;
                }
            }
        });
        
        // Return true when puddle should be removed
        return this.age >= this.duration;
    }
    
    draw() {
        ctx.save();
        
        // Calculate fade effect as puddle ages
        const fadeStart = this.duration * 0.8; // Start fading at 80% of duration
        let alpha = 1.0;
        if (this.age > fadeStart) {
            alpha = 1.0 - ((this.age - fadeStart) / (this.duration - fadeStart));
        }
        
        // Draw puddle with gradient effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(136, 255, 68, ${0.4 * alpha})`); // Bright center
        gradient.addColorStop(0.7, `rgba(100, 200, 50, ${0.3 * alpha})`); // Medium edge
        gradient.addColorStop(1, `rgba(60, 150, 30, ${0.1 * alpha})`); // Faint outer edge
        
        // Draw the puddle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bubbling effect with small circles
        if (Math.floor(Game.frameCount / 10) % 3 === 0) { // Animate every 10 frames
            ctx.fillStyle = `rgba(150, 255, 100, ${0.6 * alpha})`;
            for (let i = 0; i < 3; i++) {
                const bubbleX = this.x + (Math.random() - 0.5) * this.radius * 1.5;
                const bubbleY = this.y + (Math.random() - 0.5) * this.radius * 1.5;
                const bubbleRadius = Math.random() * 3 + 1;
                
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
}