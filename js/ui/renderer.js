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

if (!document.getElementById('xianxia-theme')) {
    const style = document.createElement('style');
    style.id = 'xianxia-theme';
    style.innerHTML = `
        body { 
            background: linear-gradient(135deg, #EAE5D9 0%, #D8D3C5 100%); 
            color: #4A4A4A; 
            font-family: 'Noto Serif SC', serif; 
            transition: background 0.5s ease;
        }
        
        .playing-card { 
            background: #FAF9F6; 
            border: 1px solid #D8D3C5; 
            box-shadow: 2px 4px 10px rgba(0,0,0,0.05), inset 0 0 20px rgba(216,211,197,0.1); 
            border-radius: 6px; 
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); 
            cursor: pointer;
            position: relative;
            overflow: hidden;
            aspect-ratio: 2.5 / 3.5; 
            min-width: 95px;
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 8px; box-sizing: border-box;
        }
        
        .playing-card::after {
            content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px;
            border: 1px dashed rgba(212, 175, 55, 0.25); border-radius: 3px; pointer-events: none;
        }

        .playing-card:hover { transform: translateY(-10px); box-shadow: 2px 10px 25px rgba(0,0,0,0.12); }
        .playing-card.selected { 
            border-color: #B8860B; 
            box-shadow: 0 0 0 2px #D4AF37, 0 15px 35px rgba(212,175,55,0.25); 
            transform: translateY(-25px) scale(1.03); 
        }

        .playing-card.is-back {
            background: linear-gradient(135deg, #4E342E 0%, #261612 100%);
            border-color: #A1887F;
        }
        .playing-card.is-back::after { border-color: rgba(161, 136, 127, 0.3); }
        .playing-card.is-back * { display: none; }
        
        .ink-black { color: #1A1A1A; text-shadow: 0px 0px 2px rgba(0,0,0,0.3); z-index: 1; } 
        .ink-red { color: #A63C3C; text-shadow: 0px 0px 2px rgba(166,60,60,0.3); z-index: 1; } 
        
        .card-top { align-self: flex-start; text-align: left; line-height: 1.1; font-weight: bold; font-size: 16px;}
        .card-center { font-size: 38px; z-index: 1; text-align: center; } 
        .card-bottom { align-self: flex-end; text-align: right; line-height: 1.1; font-weight: bold; transform: rotate(180deg); font-size: 16px;}

        .shop-panel { 
            background: rgba(250,249,246,0.99); border: 1px solid #D8D3C5; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.2); border-radius: 8px; 
            width: 95%; max-width: 1000px; 
        }
        
        .shop-items { display: flex; justify-content: center; flex-wrap: wrap; gap: 25px; margin: 35px 0; align-items: stretch; }
        
        .shop-item-card { 
            background: #FDFCF7; border-radius: 8px; box-shadow: 0 6px 15px rgba(0,0,0,0.06); 
            padding: 20px; box-sizing: border-box;
            width: 175px; 
            display: flex; flex-direction: column; justify-content: flex-start;
            transition: all 0.2s ease; cursor: pointer; position: relative;
        }
        .shop-item-card:hover { transform: translateY(-8px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }

        .shop-item-tarot {
            background: linear-gradient(135deg, #281534 0%, #190A20 100%);
            border: 2px solid #D4AF37;
            color: #EEE;
            box-shadow: 0 0 15px rgba(212,175,55,0.2);
        }
        .shop-item-tarot .shop-item-title {
            background: linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #AA771C 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            font-family: 'Ma Shan Zheng', cursive; font-size: 18px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        }
        .shop-item-tarot .shop-item-desc { color: #CCC; }
        .shop-item-tarot .shop-item-price { color: #D4AF37 !important; border-top-color: rgba(212,175,55,0.2) !important; }

        .shop-item-upgrade {
            background: #FAF5E9; 
            border: 2px solid #A63C3C; 
            box-shadow: 0 0 10px rgba(166,60,60,0.1);
        }
        .shop-item-upgrade::after { 
            content: ''; position: absolute; top: 0; right: 8px; bottom: 0; width: 4px;
            background: repeating-linear-gradient(to bottom, #A63C3C 0, #A63C3C 2px, transparent 2px, transparent 4px);
            opacity: 0.2;
        }
        .shop-item-upgrade .shop-item-title { color: #A63C3C; font-family: 'Ma Shan Zheng', cursive; font-size: 18px; }
        .shop-item-upgrade .shop-item-price { color: #A63C3C !important; border-top-color: rgba(166,60,60,0.1) !important; }

        .joker-card { border: 1px solid #D1CCC0; padding: 15px; width: 130px; display: flex; flex-direction: column; text-align:center; box-sizing: border-box; border-radius:4px; }
        .sold-out { background:#EBEBEB; border-color:#EBEBEB; display:flex; justify-content:center; align-items:center; width: 175px; border-radius: 8px; }

        .shop-item-title { font-weight:bold; font-size:16px; margin-bottom:12px; text-align:center; line-height:1.3; }
        .shop-item-desc { color: #555; font-size: 13px; line-height: 1.6; text-align:left; flex-grow: 1; }
        .shop-item-tag { margin-top: auto; padding-top: 10px; font-size: 11px; font-weight: bold; text-align:center; }
        .shop-item-price { margin-top: 12px; color: #8C7A6B; font-weight: bold; font-size: 16px; text-align:center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 10px; }

        button { font-family: 'Noto Serif SC', serif; transition: all 0.2s ease; cursor: pointer; outline: none; }
        button:hover { filter: brightness(1.1); transform: scale(1.02); }
        button:active { transform: scale(0.98); }
        
        @keyframes floatUpAndFade {
            0% { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -60px) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -80px) scale(0.9); }
        }
        .floating-score {
            position: fixed; top: 40%; left: 50%; transform: translate(-50%, 0);
            z-index: 9999; pointer-events: none; text-align: center;
            animation: floatUpAndFade 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            text-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        /* 强制横屏逻辑 */
        @media (orientation: portrait) {
            #rotate-tip {
                display: flex !important;
            }
        }
        @media (orientation: landscape) {
            #rotate-tip {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// 动态植入强制横屏提示 DIV
if (!document.getElementById('rotate-tip')) {
    const rotateTip = document.createElement('div');
    rotateTip.id = 'rotate-tip';
    rotateTip.style.cssText = `
        display: none;
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: #EAE5D9;
        z-index: 99999;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-family: 'Noto Serif SC', serif;
        color: #5D4037;
        font-size: 22px;
        gap: 20px;
        text-align: center;
    `;
    rotateTip.innerHTML = `
        <div style="font-size: 60px;">📱↔️</div>
        <div>请横屏游玩</div>
        <div style="font-size: 14px; color: #8C7A6B;">牌阵为横向布局设计</div>
    `;
    document.body.appendChild(rotateTip);
}

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
            jEl.innerHTML = `<div style="color:#5D4037; font-weight:bold; margin-bottom:5px; font-size:14px;">${joker.n}</div><div style="color:#666; font-size:11px; line-height:1.4;">${joker.e}</div>`;
            DOM.jokers.appendChild(jEl);
        });
        const emptySlots = state.jokerSlots - state.jokers.length;
        for(let i = 0; i < emptySlots; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'joker-card';
            emptyEl.style.backgroundColor = 'transparent';
            emptyEl.style.border = '1px dashed #D8D3C5';
            emptyEl.innerHTML = `<div style="color:#A9A499; text-align:center; margin-top:15px; font-size:12px;">（法宝空位）</div>`;
            DOM.jokers.appendChild(emptyEl);
        }
    },

    renderHand() {
        DOM.hand.innerHTML = ''; 
        state.hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'playing-card';
            cardEl.dataset.index = index; 
            
            if (state.selectedCardIds.includes(card.id)) cardEl.classList.add('selected');
            if (state.currentBoss === '阎罗王' && index < 3) cardEl.classList.add('is-back');

            const isRed = (card.suit === 1 || card.suit === 3);
            const colorClass = isRed ? 'ink-red' : 'ink-black';
            
            cardEl.innerHTML = `
                <div class="card-top ${colorClass}">${card.rankName}<br>${SUITS[card.suit].symbol}</div>
                <div class="card-center ${colorClass}" style="font-family:'Ma Shan Zheng', cursive;">${card.rankCName}</div>
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
            <div style="font-size: 36px; font-weight: bold; color: #5D4037; letter-spacing: 2px; font-family:'Ma Shan Zheng', cursive;">【${typeName}】</div>
            <div style="font-size: 24px; color: #7A695C; margin-top: 8px; font-family: monospace; font-weight:bold;">${chips} <span style="color:#A63C3C;">×</span> ${mult}</div>
            <div style="font-size: 56px; font-weight: 900; color: #A63C3C; margin-top: 8px;">+ ${total}</div>
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
                itemsHtml += `<div class="sold-out"><div style="color:#999; font-weight:bold;">已售出</div></div>`;
            } else {
                let cardClass = "shop-item-card"; 
                let tag = "";
                let tagColor = "#8C7A6B";
                
                if (item.isTarot) {
                    cardClass = "shop-item-card shop-item-tarot";
                    tag = "(一次性·炼化符箓)";
                    tagColor = "#D4AF37";
                } else if (item.isUpgrade) {
                    cardClass = "shop-item-card shop-item-upgrade";
                    tag = "(永久·功法秘籍)";
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
                <h2 style="color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 40px; border-bottom: 2px solid #D8D3C5; padding-bottom: 15px; text-align:center; margin:0;">🏮 坊 市 🏮</h2>
                <p style="margin-top: 15px; color: #666; text-align:center; font-size: 16px;">渡劫成功。当前盘缠：<b style="color: #D4AF37; font-size: 22px;">💰 ${state.money} 两</b></p>
                <div class="shop-items">${itemsHtml}</div>
                <div style="text-align:center; margin-top: 10px;">
                    <button id="btn-next-round" style="background-color: #8C7A6B; padding: 15px 50px; font-size: 20px; color: white; border:none; border-radius:6px; box-shadow: 0 6px 15px rgba(140,122,107,0.3); font-weight:bold; letter-spacing: 2px;">踏入下一劫</button>
                </div>
            </div>
        `;
    },

    renderRules() {
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="max-height: 85vh; overflow-y: auto; text-align: left; padding: 40px; width: 90%; max-width: 750px; color: #4A4A4A; margin: 0 auto;">
                <h2 style="text-align: center; margin-bottom: 20px; color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 36px;">📜 天道法则卷宗</h2>
                <div style="line-height: 1.8; font-size: 15px;">
                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px;">一、 基础渡劫</h3>
                    <p>在有限次数内，使总得分达到【目标分数】。计分公式：<br>
                    <b>单手得分 = ( 功法基础筹码 + 有效牌面值 ) × ( 功法基础倍率 + 法宝倍率 )</b><br>
                    <span style="color:#A63C3C; font-size:13px;">* 秘诀：选5张毫无关联的牌，系统仅计算最大那张牌的分数（高牌）。可作为“变相弃牌”战术！</span></p>
                    
                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px; margin-top: 25px;">二、 坊市秘宝 (核心养成)</h3>
                    <ul style="padding-left: 20px;">
                        <li><b>🏮 法宝 (被动增强)：</b>放入上方槽位，提供永久的倍率或筹码光环。</li>
                        <li><b>🔯 星辰符箓 (牌库炼化)：</b>一次性消耗品。可永久提升手牌上限，甚至<b>撕毁/克隆你的母本卡牌</b>！极度危险但收益巨大。</li>
                        <li><b>📖 功法秘籍 (牌型突破)：</b>一次性消耗品。购买后可永久提升指定牌型的等级。</li>
                    </ul>

                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px; margin-top: 25px;">三、 💀 天道劫数 (Boss战)</h3>
                    <p>每突破 3 重天，将遭遇强力 Boss 镇守。它们会改变游戏规则：</p>
                    <ul style="padding-left: 20px;">
                        <li><b>黑白无常：</b>红桃♥与方块♦面值失效 (0分)。</li>
                        <li><b>铁面判官：</b>每次出牌后，判官随机撕毁牌库中的1张牌。</li>
                        <li><b>阎罗王：</b>起手部分卡牌将【背面朝上】，必须盲打。</li>
                    </ul>
                    
                    <h3 style="margin-top: 30px; text-align: center; color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 24px;">🏆 初始功法基础账本 (Lv.1)</h3>
                    <table style="width: 100%; text-align: center; border-collapse: collapse; margin-top: 15px; font-size: 14px; background-color: rgba(255,255,255,0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">
                        <tr style="background-color: #EAE5D9; color: #5D4037;">
                            <th style="padding: 10px; border: 1px solid #D8D3C5;">牌型</th>
                            <th style="padding: 10px; border: 1px solid #D8D3C5;">初始筹码</th>
                            <th style="padding: 10px; border: 1px solid #D8D3C5;">初始倍率</th>
                        </tr>
                        <tr><td style="padding: 8px; border: 1px solid #D8D3C5;">同花五条</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">160</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×16</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td style="padding: 8px; border: 1px solid #D8D3C5;">皇家同花顺 / 同花顺</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">100</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×8</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #D8D3C5;">四条</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">60</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×7</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td style="padding: 8px; border: 1px solid #D8D3C5;">葫芦</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">40</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×4</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #D8D3C5;">同花 / 顺子</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">35 / 30</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×4</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td style="padding: 8px; border: 1px solid #D8D3C5;">三条</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">30</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×3</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #D8D3C5;">两对 / 一对</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">20 / 10</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×2</td></tr>
                        <tr style="background-color: rgba(0,0,0,0.02);"><td style="padding: 8px; border: 1px solid #D8D3C5;">高牌</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #A63C3C; font-weight:bold;">5</td><td style="padding: 8px; border: 1px solid #D8D3C5; color: #8C7A6B; font-weight:bold;">×1</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <button id="btn-close-rules" style="background-color: #8C7A6B; padding: 12px 45px; font-size: 18px; color: white; border:none; border-radius:4px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); font-weight:bold;">我悟了 (关闭)</button>
                </div>
            </div>
        `;
    },

    renderGameOver() {
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="padding:50px; text-align:center;">
                <h2 style="color: #A63C3C; font-family: 'Ma Shan Zheng', cursive; font-size: 56px; margin:0;">💀 身死道消</h2>
                <p style="margin-top: 20px; color:#666; font-size: 18px;">出牌与弃牌次数已耗尽，未能突破天道壁垒...</p>
                <button id="btn-restart" style="margin-top: 35px; background-color: #5D4037; padding: 14px 40px; font-size: 20px; color: white; border:none; border-radius:6px; box-shadow: 0 6px 15px rgba(0,0,0,0.2); font-weight:bold;">重入轮回 (重新开始)</button>
            </div>
        `;
    },

    hideOverlay() {
        DOM.overlay.classList.add('hidden');
        DOM.overlay.innerHTML = '';
    }
};