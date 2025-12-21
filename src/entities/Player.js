import { Game, ctx, canvas } from '../engine/Game.js';
import { WeaponFactory } from '../weapons/WeaponFactory.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.baseSpeed = 4; // Base movement speed
        this.color = '#00ccff';
        
        // Stats
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        
        // Systems
        this.weapon = null; // Will be set from main.js after weapon selection
        this.orbitals = []; // Stores the swords/shields
        this.sprite = null; // Stores the custom image

        // Input Setup
        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
    }
    
    getEffectiveSpeed() {
        if (!this.weapon) return this.baseSpeed;
        return this.baseSpeed * this.weapon.speedModifier;
    }

    update() {
        const speed = this.getEffectiveSpeed();
        
        // 1. Movement
        if (this.keys['w'] || this.keys['ArrowUp']) this.y -= speed;
        if (this.keys['s'] || this.keys['ArrowDown']) this.y += speed;
        if (this.keys['a'] || this.keys['ArrowLeft']) this.x -= speed;
        if (this.keys['d'] || this.keys['ArrowRight']) this.x += speed;

        // 2. Keep in bounds
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        // 3. Update Weapons
        if (this.weapon) {
            this.weapon.update();
        }
        
        // 4. Update Orbitals (Spinning swords/shields)
        this.orbitals.forEach(orb => orb.update());
    }

gainXp(amount) {
        // Apply weapon XP multiplier if available
        const finalAmount = this.weapon ? amount * this.weapon.xpMultiplier : amount;
        this.xp += finalAmount;
        
        if (this.xp >= this.xpToNext) {
            this.level++;
            this.xp = 0;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            
            let weaponUpgradeAvailable = false;
            if (this.weapon) {
                weaponUpgradeAvailable = this.weapon.upgrade();
            }
            document.getElementById('lvl').innerText = this.level;

            // Check for weapon upgrades first (every 2-3 levels)
            if (weaponUpgradeAvailable) {
                Game.active = false;
                // Show weapon upgrade menu (we'll create this)
                this.showWeaponUpgradeMenu();
            }
            
            // Visual Flash
            this.color = '#fff';
            setTimeout(() => this.color = '#00ccff', 150);
        }
        
        // Update XP Bar UI
        const pct = (this.xp / this.xpToNext) * 100;
        const bar = document.getElementById('xp-bar-fill');
        if (bar) bar.style.width = pct + '%';
    }
    
    showWeaponUpgradeMenu() {
        // Use the global selection screen from main.js
        if (window.selectionScreen) {
            window.selectionScreen.showWeaponUpgradeMenu();
        } else {
            // Fallback to simple selection
            console.log("Weapon upgrade available!");
            Game.active = true;
        }
    }

    draw() {
        // Skip drawing every few frames if invincible (blinking effect)
        if (this.isInvincible && Math.floor(Game.frameCount / 5) % 2 === 0) {
            // Draw orbitals even when player is blinking
            this.orbitals.forEach(orb => orb.draw());
            return;
        }
        
        // 1. Draw Weapon Aiming Indicator (before player so it's behind)
        this.drawAimingIndicator();
        
        // 2. Draw Player (Image or Circle)
        if (this.sprite) {
            ctx.drawImage(this.sprite, this.x - this.radius*1.5, this.y - this.radius*1.5, this.radius*3, this.radius*3);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            
            // Holy Shield glow effect
            if (this.holyShieldGlow) {
                ctx.fillStyle = '#ffaa00'; // Golden color
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#ffaa00';
            } else {
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw shield indicator if active
            if (this.holyShieldGlow) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        // 3. Draw Orbitals
        this.orbitals.forEach(orb => orb.draw());
    }
    
    drawAimingIndicator() {
        if (!this.weapon || !Game.enemies || Game.enemies.length === 0) return;
        
        // Get the target the weapon is aiming at
        const target = this.weapon.getNearestEnemy();
        if (!target) return;
        
        // Calculate direction to target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance === 0) return;
        
        // Draw different indicators based on weapon type
        if (this.weapon.type === 'paladin') {
            this.drawArcIndicator(target, dx, dy, distance);
        } else if (this.weapon.type === 'shotgun') {
            this.drawSpreadIndicator(target, dx, dy, distance);
        } else {
            this.drawLineIndicator(target, dx, dy, distance);
        }
    }
    
    drawArcIndicator(target, dx, dy, distance) {
        const angle = Math.atan2(dy, dx);
        const arcRange = this.weapon.arcRange || 100;
        const arcAngle = this.weapon.arcAngle || Math.PI / 3;
        
        ctx.save();
        ctx.strokeStyle = this.weapon.getBulletColor();
        ctx.fillStyle = this.weapon.getBulletColor();
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        
        // Draw arc area
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, Math.min(arcRange, distance + 20), 
               angle - arcAngle/2, angle + arcAngle/2);
        ctx.closePath();
        ctx.fill();
        
        // Draw arc outline
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawSpreadIndicator(target, dx, dy, distance) {
        const angle = Math.atan2(dy, dx);
        const spread = this.weapon.spread || 0.6; // Use actual weapon spread
        const shotgunRange = 60; // Short range for close combat
        
        ctx.save();
        ctx.strokeStyle = this.weapon.getBulletColor();
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2;
        
        // Draw shotgun arc (similar to paladin but smaller and cleaner)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, Math.min(shotgunRange, distance + 10), 
               angle - spread/2, angle + spread/2);
        ctx.closePath();
        ctx.stroke();
        
        // Optional: Fill the arc area very lightly
        ctx.globalAlpha = 0.15;
        ctx.fill();
        
        ctx.restore();
    }
    
    drawLineIndicator(target, dx, dy, distance) {
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Calculate aiming line endpoints
        const aimLength = Math.min(distance, 150);
        const startX = this.x + dirX * (this.radius + 5);
        const startY = this.y + dirY * (this.radius + 5);
        const endX = this.x + dirX * aimLength;
        const endY = this.y + dirY * aimLength;
        
        ctx.save();
        ctx.strokeStyle = this.weapon.getBulletColor();
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw aiming rectangle at the end
        const rectSize = 8;
        ctx.fillStyle = this.weapon.getBulletColor();
        ctx.globalAlpha = 0.8;
        ctx.setLineDash([]);
        
        ctx.fillRect(endX - rectSize/2, endY - rectSize/2, rectSize, rectSize);
        
        ctx.restore();
    }
}