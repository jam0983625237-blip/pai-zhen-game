// js/ui/dom.js
const gameContainer = document.getElementById('game-container');
gameContainer.innerHTML = ''; 

const hudContainer = document.createElement('div');
hudContainer.id = 'hud-container';
hudContainer.innerHTML = `
    <div class="hud-top">
        <div id="info-ante">第 1 重天</div>
        <div id="info-score">目标: <span id="target-score">300</span> | 当前得分: <span id="current-score">0</span></div>
        <div id="info-money">💰 <span id="money">4</span> 两</div>
    </div>
    <div class="hud-middle">
        <div id="info-chances">出牌剩余: <span id="hands-left">4</span> | 弃牌剩余: <span id="discards-left">3</span></div>
    </div>
`;
gameContainer.appendChild(hudContainer);

const jokerContainer = document.createElement('div');
jokerContainer.id = 'joker-container';
gameContainer.appendChild(jokerContainer);

const handContainer = document.createElement('div');
handContainer.id = 'hand-container';
gameContainer.appendChild(handContainer);

const actionBar = document.createElement('div');
actionBar.id = 'action-bar';
actionBar.innerHTML = `
    <button id="btn-play">出 牌</button>
    <button id="btn-discard">弃 牌</button>
`;
gameContainer.appendChild(actionBar);

// 【新增】全屏遮罩层（用于坊市和结算弹窗）
const overlayContainer = document.createElement('div');
overlayContainer.id = 'overlay-container';
overlayContainer.className = 'hidden';
gameContainer.appendChild(overlayContainer);

const DOM = {
    hand: handContainer,
    jokers: jokerContainer,
    btnPlay: document.getElementById('btn-play'),
    btnDiscard: document.getElementById('btn-discard'),
    ante: document.getElementById('info-ante'),
    targetScore: document.getElementById('target-score'),
    currentScore: document.getElementById('current-score'),
    money: document.getElementById('money'),
    handsLeft: document.getElementById('hands-left'),
    discardsLeft: document.getElementById('discards-left'),
    overlay: overlayContainer // 绑定给 JS 调用
};