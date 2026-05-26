// js/ui/dom.js
const gameContainer = document.getElementById('game-container');
gameContainer.innerHTML = '';

// ========== 左侧面板 (30%)：HUD + 法宝 ==========
const leftPanel = document.createElement('div');
leftPanel.id = 'left-panel';
leftPanel.innerHTML = `
    <div id="hud-box">
        <div id="info-ante" class="hud-row">第 1 重天</div>
        <div class="hud-row">目标 <span id="target-score">300</span></div>
        <div class="hud-row">得分 <span id="current-score">0</span></div>
        <div class="hud-row">盘缠 <span id="money">4</span> 两</div>
        <div class="hud-divider"></div>
        <div class="hud-row">出牌 <span id="hands-left">4</span> 次</div>
        <div class="hud-row">弃牌 <span id="discards-left">3</span> 次</div>
    </div>
    <div id="joker-container"></div>
`;
gameContainer.appendChild(leftPanel);

// ========== 右侧面板 (70%)：手牌 + 按钮 ==========
const rightPanel = document.createElement('div');
rightPanel.id = 'right-panel';
rightPanel.innerHTML = `
    <div id="hand-container"></div>
    <div id="action-bar">
        <button id="btn-play">出 牌</button>
        <button id="btn-discard">弃 牌</button>
    </div>
`;
gameContainer.appendChild(rightPanel);

// 全屏遮罩层（坊市和结算弹窗）
const overlayContainer = document.createElement('div');
overlayContainer.id = 'overlay-container';
overlayContainer.className = 'hidden';
gameContainer.appendChild(overlayContainer);

const DOM = {
    hand: document.getElementById('hand-container'),
    jokers: document.getElementById('joker-container'),
    btnPlay: document.getElementById('btn-play'),
    btnDiscard: document.getElementById('btn-discard'),
    ante: document.getElementById('info-ante'),
    targetScore: document.getElementById('target-score'),
    currentScore: document.getElementById('current-score'),
    money: document.getElementById('money'),
    handsLeft: document.getElementById('hands-left'),
    discardsLeft: document.getElementById('discards-left'),
    overlay: overlayContainer
};
