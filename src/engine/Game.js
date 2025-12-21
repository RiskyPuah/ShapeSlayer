// This file holds the "State" of the game so everyone can access it
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export const Game = {
    active: true,
    width: canvas.width,
    height: canvas.height,
    score: 0,
    frameCount: 0,
    player: null,
    enemies: [],
    bullets: [],
    gems: [],
    powerups: [], // <--- NEW: Add this line
    explosions: [], // For rocket explosions
    poisonPuddles: [], // For plague doctor poison puddles
    ammoPacks: [] // For Pierce character ammo packs
};