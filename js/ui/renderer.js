// js/ui/renderer.js

const AudioEngine = {
    ctx: null,
    init() { 
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext(); 
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    play(type) {
        this.init(); 
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        
        const now = this.ctx.currentTime;
        if (type === 'hover') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
            gain.gain.setValueAtTime(0.02, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'click') { 
            osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'playCard') { 
            osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
            gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'shop') { 
            osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'nextRound') { 
            osc.type = 'sine'; osc.frequency.setValueAtTime(220, now); osc.frequency.exponentialRampToValueAtTime(50, now + 1.5);
            gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
        }
    }
};

// 动态注入的样式已全部迁移到 css/main.css，此处清空

const Renderer = {
    renderHUD() {
        DOM.ante.textContent = `第 ${state.ante} 重天`;
        DOM.targetScore.textContent = state.targetScore;
        DOM.currentScore.textContent = state.currentScore;
        DOM.money.textContent = state.money;
        DOM.handsLeft.textContent = state.handsLeft;
        DOM.discardsLeft.textContent = state.discardsLeft;
        
        if (state.currentBoss) {
            document.body.style.background = 'linear-gradient(135deg, #d3c4c4 0%, #b3a4a4 100%)';
        } else {
            document.body.style.background = 'linear-gradient(135deg, #EAE5D9 0%, #D8D3C5 100%)'; 
        }
    },

    renderJokers() {
        DOM.jokers.innerHTML = ''; 
        state.jokers.forEach(joker => {
            const jEl = document.createElement('div');
            jEl.className = 'joker-card';
            jEl.innerHTML = `<div style="color:#5D4037; font-weight:bold; margin-bottom:6px; font-size:14px; text-align:center;">${joker.n}</div><div style="color:#666; font-size:12px; line-height:1.4; text-align:center;">${joker.e}</div>`;
            DOM.jokers.appendChild(jEl);
        });
        const emptySlots = state.jokerSlots - state.jokers.length;
        for(let i = 0; i < emptySlots; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'joker-card';
            emptyEl.style.backgroundColor = 'transparent';
            emptyEl.style.border = '2px dashed #D8D3C5';
            emptyEl.style.boxShadow = 'none';
            emptyEl.innerHTML = `<div style="color:#A9A499; text-align:center; font-size:13px;">（法宝空位）</div>`;
            DOM.jokers.appendChild(emptyEl);
        }
    },

    renderHand() {
        DOM.hand.innerHTML = '';
        const count = state.hand.length;
        if (count === 0) return;

        // 扇形展开：计算每张牌的位移和旋转
        const totalSpread = Math.min(count * 55, 360); // 总展开宽度
        const startX = -totalSpread / 2; // 从左侧开始偏移

        state.hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'playing-card';
            cardEl.dataset.index = index;

            if (state.selectedCardIds.includes(card.id)) cardEl.classList.add('selected');
            if (state.currentBoss === '阎罗王' && index < 3) cardEl.classList.add('is-back');

            // 扇形算法：均匀分布 + 轻微弧度旋转
            const xOffset = startX + (index / Math.max(count - 1, 1)) * totalSpread;
            // 旋转：中间牌平直，两边逐渐倾斜
            const t = (index / Math.max(count - 1, 1)) - 0.5; // -0.5 ... +0.5
            const rotation = t * Math.min(count * 2.5, 12); // 最多 ±12 度

            cardEl.style.transform = `translateX(${xOffset}px) rotate(${rotation}deg)`;
            cardEl.style.zIndex = index; // 越后面越上层

            const isRed = (card.suit === 1 || card.suit === 3);
            const colorClass = isRed ? 'ink-red' : 'ink-black';

            cardEl.innerHTML = `
                <div class="card-top ${colorClass}">${card.rankName}<br>${SUITS[card.suit].symbol}</div>
                <div class="card-center ${colorClass}">${card.rankCName}</div>
                <div class="card-bottom ${colorClass}">${card.rankName}<br>${SUITS[card.suit].symbol}</div>
            `;

            cardEl.onmouseenter = () => AudioEngine.play('hover');
            DOM.hand.appendChild(cardEl);
        });
    },

    updateAll() {
        this.renderHUD();
        this.renderJokers();
        this.renderHand();
    },

    showPlayEffect(typeName, chips, mult, total) {
        AudioEngine.play('playCard');
        const el = document.createElement('div');
        el.className = 'floating-score';
        el.innerHTML = `
            <div style="font-size: 34px; font-weight: bold; color: #5D4037; letter-spacing: 2px; font-family:'Ma Shan Zheng', cursive;">【${typeName}】</div>
            <div style="font-size: 24px; color: #7A695C; margin-top: 8px; font-family: monospace; font-weight:bold;">${chips} <span style="color:#A63C3C;">×</span> ${mult}</div>
            <div style="font-size: 52px; font-weight: 900; color: #A63C3C; margin-top: 8px;">+ ${total}</div>
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1600);
    },

    renderShop() {
        AudioEngine.play('shop');
        DOM.overlay.classList.remove('hidden');
        let itemsHtml = '';
        state.shopItems.forEach((item, index) => {
            if (item.sold) {
                itemsHtml += `<div class="sold-out"><div style="color:#999; font-weight:bold; font-size:18px;">已售出</div></div>`;
            } else {
                let cardClass = "shop-item-card"; 
                let tag = "";
                let tagColor = "#8C7A6B";
                
                if (item.isTarot) {
                    cardClass = "shop-item-card shop-item-tarot";
                    tag = "(一次性·符箓)";
                    tagColor = "#D4AF37";
                } else if (item.isUpgrade) {
                    cardClass = "shop-item-card shop-item-upgrade";
                    tag = "(永久·秘籍)";
                    tagColor = "#A63C3C";
                }

                itemsHtml += `
                    <div class="${cardClass} shop-item" data-index="${index}" onmouseenter="AudioEngine.play('hover')">
                        <div class="shop-item-title">${item.isTarot ? '🔯 ' : (item.isUpgrade ? '📖 ' : '🏮 ')}${item.n}</div>
                        <div class="shop-item-desc">${item.e}</div>
                        ${tag ? `<div class="shop-item-tag" style="color: ${tagColor};">${tag}</div>` : ''}
                        <div class="shop-item-price">💰 ${item.p} 两</div>
                    </div>
                `;
            }
        });

        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="padding: 40px; box-sizing: border-box;">
                <h2 style="color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 42px; border-bottom: 2px solid #D8D3C5; padding-bottom: 15px; text-align:center; margin:0;">🏮 坊 市 🏮</h2>
                <p style="margin-top: 15px; color: #666; text-align:center; font-size: 18px;">渡劫成功。当前盘缠：<b style="color: #D4AF37; font-size: 24px;">💰 ${state.money} 两</b></p>
                <div class="shop-items">${itemsHtml}</div>
                <div style="text-align:center; margin-top: 20px;">
                    <button id="btn-next-round" style="background-color: #8C7A6B; padding: 16px 60px; font-size: 22px; color: white; border:none; border-radius:30px; box-shadow: 0 8px 25px rgba(140,122,107,0.3); font-weight:bold; letter-spacing: 2px; cursor: pointer;">踏入下一劫</button>
                </div>
            </div>
        `;
    },

    renderRules() {
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="max-height: 85vh; overflow-y: auto; text-align: left; padding: 40px; width: 90%; max-width: 800px; color: #4A4A4A; margin: auto;">
                <h2 style="text-align: center; margin-bottom: 20px; color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 42px;">📜 天道法则卷宗</h2>
                <div style="line-height: 1.8; font-size: 16px;">
                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px;">一、 基础渡劫</h3>
                    <p>在有限次数内使总分达标。公式：<br><b>单手得分 = (功法筹码 + 牌面值) × (功法倍率 + 法宝倍率)</b><br>
                    <span style="color:#A63C3C; font-size:14px;">* 秘诀：选5张毫无关联的牌只算最大那张（高牌），可作为变相弃牌战术！</span></p>
                    
                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px; margin-top: 25px;">二、 坊市秘宝</h3>
                    <ul style="padding-left: 20px; margin: 10px 0;">
                        <li><b>🏮 法宝：</b>放入左侧槽位，提供永久光环。</li>
                        <li><b>🔯 符箓：</b>一次性消耗。可炼化母本牌库、永久扩充手牌。</li>
                        <li><b>📖 秘籍：</b>一次性消耗。永久提升指定牌型的基础功法阶级。</li>
                    </ul>

                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px; margin-top: 25px;">三、 💀 天道劫数 (Boss战)</h3>
                    <p>每 3 重天遭遇强力 Boss 镇守，它们会改变游戏规则：</p>
                    <ul style="padding-left: 20px; margin: 10px 0;">
                        <li><b>黑白无常：</b>红桃♥与方块♦面值不计分 (0分)。</li>
                        <li><b>铁面判官：</b>每次出牌随机永久撕毁牌库中的1张牌。</li>
                        <li><b>阎罗王：</b>起手 3 张牌将【背面朝上】盲打。</li>
                    </ul>
                    
                    <h3 style="margin-top: 35px; text-align: center; color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 26px;">🏆 初始功法基础账本 (Lv.1)</h3>
                    <table>
                        <tr><th>牌型</th><th>初始筹码</th><th>初始倍率</th></tr>
                        <tr><td>同花五条</td><td style="color:#A63C3C;font-weight:bold;">160</td><td style="color:#8C7A6B;font-weight:bold;">×16</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td>同花顺</td><td style="color:#A63C3C;font-weight:bold;">100</td><td style="color:#8C7A6B;font-weight:bold;">×8</td></tr>
                        <tr><td>四条</td><td style="color:#A63C3C;font-weight:bold;">60</td><td style="color:#8C7A6B;font-weight:bold;">×7</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td>葫芦</td><td style="color:#A63C3C;font-weight:bold;">40</td><td style="color:#8C7A6B;font-weight:bold;">×4</td></tr>
                        <tr><td>同花 / 顺子</td><td style="color:#A63C3C;font-weight:bold;">35 / 30</td><td style="color:#8C7A6B;font-weight:bold;">×4</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td>三条</td><td style="color:#A63C3C;font-weight:bold;">30</td><td style="color:#8C7A6B;font-weight:bold;">×3</td></tr>
                        <tr><td>两对 / 一对</td><td style="color:#A63C3C;font-weight:bold;">20 / 10</td><td style="color:#8C7A6B;font-weight:bold;">×2</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td>高牌</td><td style="color:#A63C3C;font-weight:bold;">5</td><td style="color:#8C7A6B;font-weight:bold;">×1</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 35px;">
                    <button id="btn-close-rules" style="background-color: #8C7A6B; padding: 14px 50px; font-size: 20px; color: white; border:none; border-radius:8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); font-weight:bold; cursor: pointer;">我悟了 (关闭)</button>
                </div>
            </div>
        `;
    },

    renderGameOver() {
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="padding:60px; text-align:center; max-width: 600px;">
                <h2 style="color: #A63C3C; font-family: 'Ma Shan Zheng', cursive; font-size: 60px; margin:0;">💀 身死道消</h2>
                <p style="margin-top: 25px; color:#666; font-size: 20px;">未能突破天道壁垒，您的修行止步于此...</p>
                <button id="btn-restart" style="margin-top: 40px; background-color: #5D4037; padding: 16px 50px; font-size: 22px; color: white; border:none; border-radius:30px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); font-weight:bold; cursor: pointer;">重入轮回 (再战一局)</button>
            </div>
        `;
    },

    hideOverlay() {
        DOM.overlay.classList.add('hidden');
        DOM.overlay.innerHTML = '';
    }
};