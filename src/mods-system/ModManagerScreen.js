/**
 * ModManagerScreen - UI for managing mods
 * Provides interface for enabling/disabling mods and viewing their status
 */
import { modManager } from './ModManager.js';
import { ctx, canvas } from '../engine/Game.js';

export class ModManagerScreen {
    constructor() {
        this.isVisible = false;
        this.selectedMod = null;
        this.mods = [];
        this.scrollOffset = 0;
        this.maxScroll = 0;
        
        // UI layout
        this.padding = 20;
        this.modItemHeight = 80;
        this.modItemWidth = canvas.width - this.padding * 2;
        this.visibleMods = Math.floor((canvas.height - 120) / this.modItemHeight);
    }
    
    async show() {
        this.isVisible = true;
        await this.refreshModList();
        console.log("📋 Mod Manager opened");
    }
    
    hide() {
        this.isVisible = false;
        console.log("📋 Mod Manager closed");
    }
    
    async refreshModList() {
        this.mods = modManager.getAllMods();
        this.maxScroll = Math.max(0, this.mods.length - this.visibleMods);
    }
    
    update() {
        if (!this.isVisible) return;
        
        // Handle any update logic here
    }
    
    draw() {
        if (!this.isVisible) return;
        
        // Check if character selection is active and hide if it is
        const characterSelection = document.getElementById('characterSelection');
        const characterCreation = document.getElementById('characterCreation');
        
        if ((characterSelection && characterSelection.style.display !== 'none') ||
            (characterCreation && characterCreation.style.display !== 'none')) {
            // Don't draw mod manager if character selection is active
            return;
        }
        
        // Draw background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw header
        this.drawHeader();
        
        // Draw mod list
        this.drawModList();
        
        // Draw selected mod details
        if (this.selectedMod) {
            this.drawModDetails();
        }
        
        // Draw instructions
        this.drawInstructions();
    }
    
    drawHeader() {
        const headerY = this.padding;
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Mod Manager', canvas.width / 2, headerY + 30);
        
        // Status info
        const loadedCount = modManager.loadedMods.size;
        const totalCount = modManager.mods.size;
        const errorCount = modManager.getErrors().length;
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`${loadedCount}/${totalCount} mods loaded${errorCount > 0 ? ` • ${errorCount} errors` : ''}`, 
                     canvas.width / 2, headerY + 55);
    }
    
    drawModList() {
        const listY = 100;
        const startIndex = this.scrollOffset;
        const endIndex = Math.min(startIndex + this.visibleMods, this.mods.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const mod = this.mods[i];
            const itemY = listY + (i - startIndex) * this.modItemHeight;
            
            this.drawModItem(mod, this.padding, itemY, this.modItemWidth, this.modItemHeight - 5);
        }
        
        // Draw scrollbar if needed
        if (this.maxScroll > 0) {
            this.drawScrollbar();
        }
    }
    
    drawModItem(mod, x, y, width, height) {
        const isSelected = this.selectedMod && this.selectedMod.id === mod.id;
        
        // Background
        ctx.fillStyle = isSelected ? 'rgba(0, 170, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, width, height);
        
        // Border
        ctx.strokeStyle = isSelected ? '#00aaff' : '#666666';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(x, y, width, height);
        
        // Status indicator
        const statusColor = this.getStatusColor(mod.status);
        ctx.fillStyle = statusColor;
        ctx.fillRect(x + 5, y + 5, 10, 10);
        
        // Mod name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(mod.name, x + 25, y + 25);
        
        // Version and author
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.fillText(`v${mod.version} by ${mod.author || 'Unknown'}`, x + 25, y + 42);
        
        // Description
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px Arial';
        const maxDescWidth = width - 150;
        const shortDesc = this.truncateText(mod.description, maxDescWidth);
        ctx.fillText(shortDesc, x + 25, y + 57);
        
        // Enable/Disable toggle
        const toggleX = x + width - 80;
        const toggleY = y + 20;
        this.drawToggle(toggleX, toggleY, mod.enabled, mod.status === 'loaded');
        
        // Status text
        ctx.fillStyle = statusColor;
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(mod.status.toUpperCase(), x + width - 10, y + 65);
        
        if (mod.error) {
            ctx.fillStyle = '#ff4444';
            ctx.fillText('ERROR', x + width - 10, y + 75);
        }
    }
    
    drawToggle(x, y, enabled, canToggle) {
        const toggleWidth = 60;
        const toggleHeight = 20;
        
        // Background
        ctx.fillStyle = canToggle ? (enabled ? '#00aa00' : '#666666') : '#333333';
        ctx.fillRect(x, y, toggleWidth, toggleHeight);
        
        // Border
        ctx.strokeStyle = canToggle ? '#ffffff' : '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, toggleWidth, toggleHeight);
        
        // Text
        ctx.fillStyle = canToggle ? '#ffffff' : '#888888';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(enabled ? 'ENABLED' : 'DISABLED', x + toggleWidth/2, y + 13);
    }
    
    drawModDetails() {
        const detailsX = canvas.width - 300;
        const detailsY = 100;
        const detailsWidth = 280;
        const detailsHeight = canvas.height - 140;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(detailsX, detailsY, detailsWidth, detailsHeight);
        
        // Border
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 2;
        ctx.strokeRect(detailsX, detailsY, detailsWidth, detailsHeight);
        
        let currentY = detailsY + 20;
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.selectedMod.name, detailsX + 10, currentY);
        currentY += 30;
        
        // Details
        const details = [
            `Version: ${this.selectedMod.version}`,
            `Author: ${this.selectedMod.author || 'Unknown'}`,
            `Status: ${this.selectedMod.status}`,
            `Enabled: ${this.selectedMod.enabled ? 'Yes' : 'No'}`
        ];
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        
        for (const detail of details) {
            ctx.fillText(detail, detailsX + 10, currentY);
            currentY += 18;
        }
        
        currentY += 10;
        
        // Description
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Description:', detailsX + 10, currentY);
        currentY += 20;
        
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px Arial';
        const descLines = this.wrapText(this.selectedMod.description, detailsWidth - 20);
        for (const line of descLines) {
            ctx.fillText(line, detailsX + 10, currentY);
            currentY += 15;
        }
        
        // Error details if any
        if (this.selectedMod.error) {
            currentY += 15;
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('Error:', detailsX + 10, currentY);
            currentY += 20;
            
            ctx.fillStyle = '#ffaaaa';
            ctx.font = '10px Arial';
            const errorLines = this.wrapText(this.selectedMod.error, detailsWidth - 20);
            for (const line of errorLines) {
                ctx.fillText(line, detailsX + 10, currentY);
                currentY += 12;
            }
        }
    }
    
    drawScrollbar() {
        const scrollbarX = canvas.width - 15;
        const scrollbarY = 100;
        const scrollbarHeight = this.visibleMods * this.modItemHeight;
        
        // Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(scrollbarX, scrollbarY, 10, scrollbarHeight);
        
        // Thumb
        const thumbHeight = Math.max(20, scrollbarHeight * (this.visibleMods / this.mods.length));
        const thumbY = scrollbarY + (scrollbarHeight - thumbHeight) * (this.scrollOffset / this.maxScroll);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(scrollbarX, thumbY, 10, thumbHeight);
    }
    
    drawInstructions() {
        const instructY = canvas.height - 40;
        
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click mod to select • ESC to close • Scroll to navigate', canvas.width / 2, instructY);
    }
    
    // Helper methods
    getStatusColor(status) {
        switch (status) {
            case 'loaded': return '#00aa00';
            case 'validated': return '#aaaa00';
            case 'discovered': return '#0088aa';
            case 'invalid': return '#aa0000';
            default: return '#666666';
        }
    }
    
    truncateText(text, maxWidth) {
        const words = text.split(' ');
        let result = '';
        let width = 0;
        
        for (const word of words) {
            const testWidth = ctx.measureText(result + ' ' + word).width;
            if (testWidth > maxWidth && result.length > 0) {
                return result + '...';
            }
            result += (result ? ' ' : '') + word;
        }
        
        return result;
    }
    
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = ctx.measureText(testLine).width;
            
            if (testWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    // Event handlers
    handleClick(x, y) {
        if (!this.isVisible) return false;
        
        const listY = 100;
        
        // Check if click is on mod list
        if (x >= this.padding && x <= this.padding + this.modItemWidth && 
            y >= listY && y <= listY + this.visibleMods * this.modItemHeight) {
            
            const clickedIndex = Math.floor((y - listY) / this.modItemHeight) + this.scrollOffset;
            
            if (clickedIndex >= 0 && clickedIndex < this.mods.length) {
                const mod = this.mods[clickedIndex];
                
                // Check if click is on toggle button
                const toggleX = this.padding + this.modItemWidth - 80;
                const toggleY = listY + (clickedIndex - this.scrollOffset) * this.modItemHeight + 20;
                
                if (x >= toggleX && x <= toggleX + 60 && 
                    y >= toggleY && y <= toggleY + 20 && 
                    mod.status !== 'invalid') {
                    
                    // Toggle mod
                    this.toggleMod(mod);
                } else {
                    // Select mod
                    this.selectedMod = mod;
                }
                
                return true;
            }
        }
        
        return false;
    }
    
    async toggleMod(mod) {
        try {
            if (mod.enabled) {
                await modManager.disableMod(mod.id);
            } else {
                await modManager.enableMod(mod.id);
            }
            
            await this.refreshModList();
            console.log(`🔧 Toggled mod '${mod.id}' ${mod.enabled ? 'off' : 'on'}`);
            
        } catch (error) {
            console.error(`❌ Failed to toggle mod '${mod.id}':`, error);
        }
    }
    
    handleScroll(deltaY) {
        if (!this.isVisible) return false;
        
        const oldOffset = this.scrollOffset;
        this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + deltaY));
        
        return this.scrollOffset !== oldOffset;
    }
    
    handleKeyPress(key) {
        if (!this.isVisible) return false;
        
        switch (key) {
            case 'Escape':
                this.hide();
                return true;
                
            case 'ArrowUp':
                return this.handleScroll(-1);
                
            case 'ArrowDown':
                return this.handleScroll(1);
                
            default:
                return false;
        }
    }
}

// Global instance
export const modManagerScreen = new ModManagerScreen();