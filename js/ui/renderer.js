// js/ui/renderer.js

// --- 强制初始化布局容器 ---
function initLayout() {
    if (document.getElementById('app-layout')) return;
    
    // 创建左侧和右侧容器
    const leftCol = document.createElement('div'); leftCol.id = 'left-col';
    const rightCol = document.createElement('div'); rightCol.id = 'right-col';
    leftCol.id = 'left-col'; rightCol.id = 'right-col';
    
    document.body.appendChild(leftCol);
    document.body.appendChild(rightCol);
    
    // 将现有元素移动到容器中
    const hud = document.getElementById('hud-top') || document.querySelector('.hud'); 
    const jokers = document.getElementById('jokers');
    const hand = document.getElementById('hand');
    const controls = document.getElementById('controls-bottom') || document.querySelector('.controls');
    
    if (hud) leftCol.appendChild(hud);
    if (jokers) leftCol.appendChild(jokers);
    if (hand) rightCol.appendChild(hand);
    if (controls) rightCol.appendChild(controls);
}

const AudioEngine = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
    play(type) { this.init(); /* 简易逻辑 */ }
};

if (!document.getElementById('xianxia-theme')) {
    const style = document.createElement('style');
    style.id = 'xianxia-theme';
    style.innerHTML = `
        /* 强制左右格局 */
        body { 
            display: flex !important; margin: 0; height: 100vh; overflow: hidden;
            background: linear-gradient(135deg, #EAE5D9 0%, #D8D3C5 100%);
            font-family: 'Noto Serif SC', serif;
        }
        #left-col { width: 30%; height: 100%; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px; }
        #right-col { width: 70%; height: 100%; display: flex; flex-direction: column; position: relative; }
        
        /* 右侧布局：手牌中心偏下，按钮吸底 */
        #hand { flex-grow: 1; display: flex; justify-content: center; align-items: center; padding-bottom: 100px; gap: 10px; }
        #controls-bottom { position: absolute; bottom: 30px; width: 100%; display: flex; justify-content: center; gap: 20px; }

        /* 统一卡牌大小 */
        .playing-card { width: 110px; aspect-ratio: 2.2/3.5; background: #FAF9F6; border: 1px solid #D8D3C5; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; box-sizing: border-box; }
        .playing-card.selected { transform: translateY(-30px); border-color: #D4AF37; }
        
        /* 强制横屏提示 */
        @media (orientation: portrait) { #rotate-tip { display: flex !important; } }
        #rotate-tip { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #EAE5D9; z-index: 99999; flex-direction: column; justify-content: center; align-items: center; font-size: 22px; color: #5D4037; }
    `;
    document.head.appendChild(style);
}

// 初始化结构
window.onload = initLayout;

const Renderer = {
    renderHUD() { /* 保持原逻辑 */ },
    renderJokers() { /* 保持原逻辑 */ },
    renderHand() { /* 保持原逻辑 */ },
    updateAll() {
        this.renderHUD();
        this.renderJokers();
        this.renderHand();
    },
    // ... 其他 render 方法保持不变
};