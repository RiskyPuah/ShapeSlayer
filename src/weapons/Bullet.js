import { ctx } from '../Game.js';

export class Bullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 5;
        this.color = '#ffff00';
        this.damage = 1;
        this.type = 'bullet'; // Can be 'bullet' or 'rocket'
        this.explosionRadius = 0;
        
        // Bullet decay system
        this.startX = x;
        this.startY = y;
        // Don't calculate maxDistance yet - wait for weaponType to be set
        this._maxDistance = null;
        this.isExpired = false;
    }
    
    // Getter for maxDistance - calculates on first access
    get maxDistance() {
        if (this._maxDistance === null) {
            this._maxDistance = this.getMaxDistance();
        }
        return this._maxDistance;
    }
    
    getMaxDistance() {
        // Use weapon type if available, otherwise fall back to projectile type
        const weaponType = this.weaponType || this.type;
        
        switch(weaponType) {
            case 'rocket': return 400;    // Long range for rockets
            case 'sniper': return 99999;    // Longest range for sniper
            case 'shotgun': return 180;   // Short range for shotgun
            case 'pistol': return 300;    // Medium range for pistol  
            case 'minigun': return 350;   // Medium-long range for minigun
            case 'paladin': return 0;     // Paladin uses arc attacks, not bullets
            case 'plagueDoctor': return 250; // Medium range for poison potions
            case 'cardThrower': return 350; // Medium-long range for cards
            default: return 320;          // Default range
        }
    }

    // Check if this bullet can hit the given enemy (for piercing bullets)
    canHitEnemy(enemy) {
        if (this.type !== 'piercing') {
            return true; // Non-piercing bullets can hit any enemy
        }
        
        // Piercing bullets track which enemies they've already hit
        if (!this.enemiesHit) {
            this.enemiesHit = [];
        }
        
        // Check if we've already hit this enemy
        return !this.enemiesHit.includes(enemy);
    }

    // Mark enemy as hit by this piercing bullet
    markEnemyHit(enemy) {
        if (this.type === 'piercing') {
            if (!this.enemiesHit) {
                this.enemiesHit = [];
            }
            this.enemiesHit.push(enemy);
            
            // Check if we've hit the maximum number of enemies
            if (this.pierceCount && this.enemiesHit.length >= this.pierceCount) {
                this.isExpired = true; // Bullet expires after hitting max enemies
            }
        } else {
            // Non-piercing bullets expire after any hit
            this.isExpired = true;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Check if bullet has traveled beyond max distance
        const traveledDistance = Math.hypot(this.x - this.startX, this.y - this.startY);
        if (traveledDistance >= this.maxDistance) {
            this.isExpired = true;
        }
    }

    draw() {
        if (this.weaponType === 'cardThrower') {
            this.drawCard();
        } else {
            this.drawBullet();
        }
    }

    drawBullet() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add glow effect for rockets
        if (this.type === 'rocket') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    drawCard() {
        ctx.save();
        
        // Calculate rotation based on velocity direction
        const angle = Math.atan2(this.vy, this.vx);
        
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        // Draw card as a rectangle with rounded corners
        const cardWidth = this.radius * 1.5;
        const cardHeight = this.radius * 2;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // Add card border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight);
        
        // Add simple card design (small circle in center)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}