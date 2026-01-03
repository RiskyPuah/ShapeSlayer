/**
 * AimingSystem.js
 * Manages aiming modes: auto-aim (nearest enemy) and manual mouse aiming
 */

import { canvas } from './Game.js';

export class AimingSystem {
    constructor() {
        this.mode = 'auto'; // 'auto' or 'manual'
        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height / 2;
        this.isMouseOverCanvas = true;
        
        this.setupMouseTracking();
    }
    
    /**
     * Setup mouse position tracking
     */
    setupMouseTracking() {
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
        });
        
        canvas.addEventListener('mouseenter', () => {
            this.isMouseOverCanvas = true;
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.isMouseOverCanvas = false;
        });
    }
    
    /**
     * Toggle between auto-aim and manual aim
     */
    toggle() {
        this.mode = this.mode === 'auto' ? 'manual' : 'auto';
        console.log(`🎯 Aiming Mode: ${this.mode.toUpperCase()}`);
        console.log(`   Mouse Position: (${this.mouseX.toFixed(0)}, ${this.mouseY.toFixed(0)})`);
        this.showModeNotification();
        this.updateUI();
    }
    
    /**
     * Get current aiming mode
     */
    getMode() {
        return this.mode;
    }
    
    /**
     * Check if currently in manual mode
     */
    isManualMode() {
        return this.mode === 'manual';
    }
    
    /**
     * Check if currently in auto mode
     */
    isAutoMode() {
        return this.mode === 'auto';
    }
    
    /**
     * Get current mouse position
     */
    getMousePosition() {
        return {
            x: this.mouseX,
            y: this.mouseY
        };
    }
    
    /**
     * Get aiming target based on current mode
     * @param {Object} owner - The player or entity doing the aiming
     * @param {Function} getNearestEnemyFn - Function to get nearest enemy for auto-aim
     * @param {Function} enemyFilterFn - Optional filter to exclude certain enemies from targeting
     */
    getAimTarget(owner, getNearestEnemyFn, enemyFilterFn = null) {
        if (this.mode === 'manual') {
            // Return mouse position
            return {
                x: this.mouseX,
                y: this.mouseY
            };
        } else {
            // Return nearest enemy position (with optional filter)
            const enemy = getNearestEnemyFn(enemyFilterFn);
            if (enemy) {
                return {
                    x: enemy.x,
                    y: enemy.y
                };
            }
            // Fallback to mouse position if no enemies
            return {
                x: this.mouseX,
                y: this.mouseY
            };
        }
    }
    
    /**
     * Show mode change notification
     */
    showModeNotification() {
        const notification = document.createElement('div');
        notification.id = 'aim-mode-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${this.mode === 'manual' ? '#ff6600' : '#00ff00'};
            padding: 20px 40px;
            border: 3px solid ${this.mode === 'manual' ? '#ff6600' : '#00ff00'};
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 0 20px ${this.mode === 'manual' ? '#ff6600' : '#00ff00'};
            animation: fadeInOut 1.5s ease-in-out;
        `;
        
        const icon = this.mode === 'manual' ? '🎯' : '🤖';
        const modeName = this.mode === 'manual' ? 'MANUAL AIM' : 'AUTO AIM';
        notification.textContent = `${icon} ${modeName}`;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 1500);
    }
    
    /**
     * Update UI indicator
     */
    updateUI() {
        let indicator = document.getElementById('aim-mode-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'aim-mode-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 14px;
                font-weight: bold;
                z-index: 1000;
                border: 2px solid;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        const icon = this.mode === 'manual' ? '🎯' : '🤖';
        const modeName = this.mode === 'manual' ? 'Manual' : 'Auto';
        const color = this.mode === 'manual' ? '#ff6600' : '#00ff00';
        
        indicator.textContent = `${icon} Aim: ${modeName}`;
        indicator.style.borderColor = color;
        indicator.style.color = color;
    }
    
    /**
     * Draw aiming indicator on canvas (only in manual mode)
     */
    drawAimIndicator(ctx) {
        if (this.mode !== 'manual' || !this.isMouseOverCanvas) return;
        
        ctx.save();
        
        // Draw crosshair at mouse position
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1.0;
        
        const size = 20;
        const gap = 8;
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(this.mouseX - size, this.mouseY);
        ctx.lineTo(this.mouseX - gap, this.mouseY);
        ctx.moveTo(this.mouseX + gap, this.mouseY);
        ctx.lineTo(this.mouseX + size, this.mouseY);
        ctx.stroke();
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(this.mouseX, this.mouseY - size);
        ctx.lineTo(this.mouseX, this.mouseY - gap);
        ctx.moveTo(this.mouseX, this.mouseY + gap);
        ctx.lineTo(this.mouseX, this.mouseY + size);
        ctx.stroke();
        
        // Circle
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Initialize UI on first load
     */
    initialize() {
        this.updateUI();
    }
}

// Create singleton instance
export const aimingSystem = new AimingSystem();
