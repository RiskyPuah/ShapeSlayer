import { Game } from '../engine/Game.js';
import { gameConfig } from './ConfigManager.js';

export class SelectionScreen {
    constructor() {
        this.currentUpgrades = [];
        this.upgradePool = [];
        this.rerollCount = 0;
        this.maxRerolls = 2; // Limit rerolls per selection
    }
    
    // Define all possible weapon upgrades based on weapon type
    getWeaponUpgradePool() {
        const weaponType = Game.player.weapon.type;
        const baseUpgrades = [
            {
                id: 'damage',
                name: '💥 More Damage',
                description: 'Increase attack damage',
                details: this.getDamageUpgradeText(),
                color: '#ff6666'
            },
            {
                id: 'fireRate',
                name: '⚡ Faster Attack Rate',
                description: 'Attack more frequently',
                details: 'Reduced time between attacks',
                color: '#66ff66'
            }
        ];
        
        // Universal upgrades available to all weapons
        const universalUpgrades = [
            {
                id: 'xpGain',
                name: '📈 XP Boost',
                description: 'Gain more experience',
                details: '+25% XP from all sources',
                color: '#9966ff'
            },
            {
                id: 'gemRange',
                name: '🧲 Gem Magnet',
                description: 'Increased gem collection range',
                details: '+30 range for automatic gem pickup',
                color: '#66ffff'
            }
        ];
        
        // Add Holy Shield cooldown upgrade if weapon has Holy Shield
        if (Game.player.weapon.holyShieldMaxCooldown > 0) {
            universalUpgrades.push({
                id: 'holyShieldCooldown',
                name: '🛡️ Shield Mastery',
                description: 'Faster Holy Shield cooldown',
                details: '20% faster recharge time',
                color: '#ffaa00'
            });
        }
        
        // Weapon-specific upgrades
        let specificUpgrades = [];
        
        if (weaponType === 'paladin') {
            specificUpgrades = [
                {
                    id: 'arcRange',
                    name: '⚔️ Extended Reach',
                    description: 'Increase sword arc range',
                    details: '+20 range for arc attacks',
                    color: '#ffaa00'
                },
                {
                    id: 'arcAngle',
                    name: '�️ Wider Arc',
                    description: 'Increase sword arc angle',
                    details: '+30° arc angle (max 180°)',
                    color: '#ffaa00'
                },
                {
                    id: 'smite',
                    name: '⚡ Divine Smite',
                    description: 'Bonus damage with Holy Shield',
                    details: '+50% damage when shield is active',
                    color: '#ffff00'
                }
            ];
        } else if (weaponType === 'sniper') {
            specificUpgrades = [
                {
                    id: 'pierceCount',
                    name: '🎯 Deep Pierce',
                    description: 'Pierce through more enemies',
                    details: '+1 enemy pierced per shot',
                    color: '#00ffff'
                },
                {
                    id: 'projectileSize',
                    name: '� Precision Scope',
                    description: 'Better accuracy and bullet size',
                    details: 'Larger bullets, easier hits',
                    color: '#6666ff'
                }
            ];
        } else {
            // Standard projectile weapon upgrades
            specificUpgrades = [
                {
                    id: 'projectileSize',
                    name: '🎯 Bigger Projectiles',
                    description: 'Larger bullet/projectile size',
                    details: 'Easier to hit enemies',
                    color: '#6666ff'
                },
                {
                    id: 'accuracy',
                    name: '🎱 Better Accuracy',
                    description: 'Reduce bullet spread',
                    details: 'More precise shots',
                    color: '#ffff66'
                }
            ];
        }
        
        // Combine all available upgrades
        return [...baseUpgrades, ...universalUpgrades, ...specificUpgrades];
    }
    
    getDamageUpgradeText() {
        if (!Game.player || !Game.player.weapon) return '+0.5 damage';
        return Game.player.weapon.type === 'rocket' ? '+1 damage per shot' : '+0.5 damage per shot';
    }
    
    // Generate 3 random upgrades from pool
    generateRandomUpgrades(resetRerollCount = true) {
        this.upgradePool = this.getWeaponUpgradePool();
        this.currentUpgrades = [];
        
        // Randomly select 3 upgrades
        const shuffled = [...this.upgradePool].sort(() => Math.random() - 0.5);
        this.currentUpgrades = shuffled.slice(0, 3);
        
        if (resetRerollCount) {
            this.rerollCount = 0; // Only reset reroll count for new selections
        }
    }
    
    // Reroll the current selection
    rerollUpgrades() {
        if (this.rerollCount < this.maxRerolls) {
            this.rerollCount++;
            this.generateRandomUpgrades(false); // Don't reset reroll count
            this.renderUpgradeMenu();
            return true;
        }
        return false;
    }
    
    // Render the upgrade menu with current selection
    renderUpgradeMenu() {
        const weaponName = Game.player.weapon.type.charAt(0).toUpperCase() + Game.player.weapon.type.slice(1);
        
        // Update menu title
        document.getElementById('weaponUpgradeSubtitle').innerText = 
            `Choose an enhancement for your ${weaponName}:`;
        
        // Generate cards HTML
        let cardsHTML = '';
        
        // Add upgrade cards
        this.currentUpgrades.forEach(upgrade => {
            cardsHTML += `
                <div class="weapon-upgrade-card" onclick="window.chooseWeaponUpgrade('${upgrade.id}')" 
                     style="border: 2px solid ${upgrade.color}; padding: 25px; cursor: pointer; width: 200px; border-radius: 10px; background: #222;">
                    <h3 style="color: ${upgrade.color};">${upgrade.name}</h3>
                    <p style="font-size: 14px; color: #ccc;">${upgrade.description}</p>
                    <p style="font-size: 12px; color: #999;">${upgrade.details}</p>
                </div>
            `;
        });
        
        // Add reroll card
        const rerollsLeft = this.maxRerolls - this.rerollCount;
        const rerollColor = rerollsLeft > 0 ? '#888888' : '#444444';
        const rerollText = rerollsLeft > 0 ? `Reroll Options (${rerollsLeft} left)` : 'No Rerolls Left';
        const rerollClick = rerollsLeft > 0 ? "onclick='window.rerollWeaponUpgrades()'" : '';
        
        cardsHTML += `
            <div class="weapon-upgrade-card ${rerollsLeft > 0 ? '' : 'disabled'}" ${rerollClick}
                 style="border: 2px solid ${rerollColor}; padding: 25px; cursor: ${rerollsLeft > 0 ? 'pointer' : 'not-allowed'}; width: 200px; border-radius: 10px; background: #222; opacity: ${rerollsLeft > 0 ? '1' : '0.5'};">
                <h3 style="color: ${rerollColor};">🎲 Reroll</h3>
                <p style="font-size: 14px; color: #ccc;">${rerollText}</p>
                <p style="font-size: 12px; color: #999;">Get 3 new random options</p>
            </div>
        `;
        
        // Insert cards into the menu
        const container = document.getElementById('upgradeCardsContainer');
        if (container) {
            container.innerHTML = cardsHTML;
        }
    }
    
    // Show the weapon upgrade menu
    showWeaponUpgradeMenu() {
        this.generateRandomUpgrades();
        this.renderUpgradeMenu();
        document.getElementById('weaponUpgradeMenu').style.display = 'block';
    }
    
    // Hide the weapon upgrade menu
    hideWeaponUpgradeMenu() {
        document.getElementById('weaponUpgradeMenu').style.display = 'none';
    }
}

// Export instance for global use
export const selectionScreen = new SelectionScreen();