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
        /* ==============================================
           左三右七 横向布局
           ============================================== */
        body {
            margin: 0; padding: 0;
            height: 100vh;
            overflow: hidden;
            font-family: 'Noto Serif SC', serif;
            background: linear-gradient(135deg, #EAE5D9 0%, #D8D3C5 100%);
        }

        #game-container {
            display: grid !important;
            grid-template-columns: 30% 70%;
            grid-template-rows: 1fr;
            width: 100vw;
            max-width: 100%;
            height: 100vh;
            background: transparent;
            box-shadow: none;
            overflow: hidden;
            gap: 15px;
            padding: 15px;
            box-sizing: border-box;
        }

        /* ========== 左侧面板 ========== */
        #left-panel {
            display: flex;
            flex-direction: column;
            gap: 15px;
            overflow: hidden;
        }

        #hud-box {
            background: rgba(253, 252, 247, 0.7);
            border: 2px solid #D8D3C5;
            border-radius: 14px;
            padding: 18px 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-size: 15px;
            flex-shrink: 0;
        }

        .hud-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 6px;
            border-bottom: 1px dashed rgba(216,211,197, 0.8);
            color: #5D4037;
        }
        .hud-row:last-child { border-bottom: none; padding-bottom: 0; }

        .hud-divider {
            border-top: 1px solid #D8D3C5;
            margin: 2px 0;
        }

        #info-ante {
            font-size: 20px;
            font-weight: bold;
            color: #5D4037;
            text-align: center;
            border-bottom: 2px solid #D8D3C5 !important;
            padding-bottom: 8px !important;
        }

        #current-score { color: #A63C3C; font-size: 22px; font-weight: bold; }
        #money { color: #D4AF37; font-weight: bold; }

        #joker-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            overflow-y: auto;
            align-content: start;
            flex: 1;
        }
        #joker-container::-webkit-scrollbar { width: 4px; }
        #joker-container::-webkit-scrollbar-thumb { background: rgba(140,122,107,0.25); border-radius: 2px; }

        /* ========== 右侧面板 ========== */
        #right-panel {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 20px;
            padding-bottom: 10px;
            overflow: hidden;
        }

        #hand-container {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 12px;
            flex-wrap: wrap;
            padding: 10px;
        }

        #action-bar {
            display: flex;
            gap: 20px;
        }

        /* ========== 卡牌 ========== */
        .playing-card {
            background: radial-gradient(circle at center, #FFFCF2 0%, #F5EFE1 100%);
            border: 2px solid #D8D3C5;
            box-shadow: 2px 6px 15px rgba(0,0,0,0.08), inset 0 0 15px rgba(212,175,55,0.05);
            border-radius: 10px;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;
            position: relative;
            width: 110px;
            height: 160px;
            display: flex; flex-direction: column; justify-content: space-between;
            padding: 10px; box-sizing: border-box;
            flex-shrink: 0;
        }
        .playing-card::after {
            content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px;
            border: 1px dashed rgba(212, 175, 55, 0.4); border-radius: 4px; pointer-events: none;
        }
        .playing-card:hover { transform: translateY(-12px); box-shadow: 2px 15px 35px rgba(0,0,0,0.15); }
        .playing-card.selected {
            border-color: #D4AF37;
            box-shadow: 0 0 0 2px #D4AF37, 0 20px 45px rgba(212,175,55,0.4);
            transform: translateY(-25px) scale(1.05);
            z-index: 50;
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
        .card-center { font-size: 38px; z-index: 1; text-align: center; font-family:'Ma Shan Zheng', cursive;}
        .card-bottom { align-self: flex-end; text-align: right; line-height: 1.1; font-weight: bold; transform: rotate(180deg); font-size: 16px;}

        /* ========== 按钮 ========== */
        #btn-play {
            background: #D4AF37;
            color: #5D4037;
        }
        #btn-discard {
            background: #8C7A6B;
            color: white;
        }
        #btn-play, #btn-discard {
            width: 160px;
            height: 54px;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 3px;
            border-radius: 27px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.12);
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        #btn-play:hover, #btn-discard:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.18); }
        #btn-play:active, #btn-discard:active { transform: scale(0.96); }

        /* ========== 法宝卡片 ========== */
        .joker-card {
            background: rgba(250, 249, 246, 0.9);
            border: 2px solid #D8D3C5;
            border-radius: 10px;
            padding: 12px 8px;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
            transition: transform 0.2s;
            box-sizing: border-box;
            text-align: center;
        }
        .joker-card:hover { transform: translateY(-3px); }

        /* ========== 坊市弹窗 ========== */
        #overlay-container {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.65);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #overlay-container.hidden { display: none; }

        .shop-panel { 
            background: rgba(250,249,246,0.99) !important; border: 1px solid #D8D3C5 !important; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important; border-radius: 12px !important; 
            width: 95% !important; max-width: 1000px !important; 
            box-sizing: border-box !important;
            margin: auto !important;
        }
        
        .shop-items { display: flex !important; justify-content: center !important; flex-wrap: wrap !important; gap: 20px !important; margin: 30px 0 !important; align-items: stretch !important; }
        
        .shop-item-card { 
            background: #FDFCF7 !important; border-radius: 8px !important; box-shadow: 0 6px 15px rgba(0,0,0,0.06) !important; 
            padding: 18px !important; box-sizing: border-box !important;
            width: 170px !important; 
            display: flex !important; flex-direction: column !important; justify-content: flex-start !important;
            transition: all 0.2s ease !important; cursor: pointer !important; position: relative !important;
        }
        .shop-item-card:hover { transform: translateY(-5px) !important; box-shadow: 0 12px 25px rgba(0,0,0,0.1) !important; }

        .shop-item-tarot {
            background: linear-gradient(135deg, #281534 0%, #190A20 100%) !important;
            border: 2px solid #D4AF37 !important; color: #EEE !important;
            box-shadow: 0 0 15px rgba(212,175,55,0.2) !important;
        }
        .shop-item-tarot .shop-item-title {
            background: linear-gradient(135deg, #BF953F 0%, #FCF6BA 50%, #AA771C 100%) !important;
            -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
            font-family: 'Ma Shan Zheng', cursive !important; font-size: 18px !important; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3)) !important;
        }
        .shop-item-tarot .shop-item-desc { color: #CCC !important; }
        .shop-item-tarot .shop-item-price { color: #D4AF37 !important; border-top-color: rgba(212,175,55,0.2) !important; }

        .shop-item-upgrade {
            background: #FAF5E9 !important; border: 2px solid #A63C3C !important; 
            box-shadow: 0 0 10px rgba(166,60,60,0.1) !important;
        }
        .shop-item-upgrade::after { 
            content: '' !important; position: absolute !important; top: 0 !important; right: 8px !important; bottom: 0 !important; width: 4px !important;
            background: repeating-linear-gradient(to bottom, #A63C3C 0, #A63C3C 2px, transparent 2px, transparent 4px) !important;
            opacity: 0.2 !important;
        }
        .shop-item-upgrade .shop-item-title { color: #A63C3C !important; font-family: 'Ma Shan Zheng', cursive !important; font-size: 18px !important; }
        .shop-item-upgrade .shop-item-price { color: #A63C3C !important; border-top-color: rgba(166,60,60,0.1) !important; }

        .sold-out { background:#EBEBEB !important; border-color:#EBEBEB !important; display:flex !important; justify-content:center !important; align-items:center !important; width: 170px !important; border-radius: 8px !important; min-height: 180px !important;}

        .shop-item-title { font-weight:bold !important; font-size:16px !important; margin-bottom:10px !important; text-align:center !important; line-height:1.3 !important; }
        .shop-item-desc { color: #555 !important; font-size: 13px !important; line-height: 1.5 !important; text-align:left !important; flex-grow: 1 !important; }
        .shop-item-tag { margin-top: auto !important; padding-top: 8px !important; font-size: 11px !important; font-weight: bold !important; text-align:center !important; }
        .shop-item-price { margin-top: 10px !important; color: #8C7A6B !important; font-weight: bold !important; font-size: 16px !important; text-align:center !important; border-top: 1px solid rgba(0,0,0,0.05) !important; padding-top: 10px !important; }

        /* ----------------------------------------------
           💥 特效动画
           ---------------------------------------------- */
        @keyframes floatUpAndFade {
            0% { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -60px) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -80px) scale(0.9); }
        }
        .floating-score {
            position: fixed !important; top: 35% !important; left: calc(64vw) !important; /* 特效在右侧爆开 */ transform: translate(-50%, 0);
            z-index: 9999 !important; pointer-events: none !important; text-align: center !important;
            animation: floatUpAndFade 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
            text-shadow: 0 4px 15px rgba(0,0,0,0.15) !important;
        }
        
        /* 规则面板表格 */
        table { width: 100% !important; text-align: center !important; border-collapse: collapse !important; margin-top: 15px !important; font-size: 14px !important; background-color: rgba(255,255,255,0.8) !important; }
        th { padding: 8px !important; border: 1px solid #D8D3C5 !important; background-color: #EAE5D9 !important; color: #5D4037 !important; }
        td { padding: 8px !important; border: 1px solid #D8D3C5 !important; }
    `;
    document.head.appendChild(style);
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