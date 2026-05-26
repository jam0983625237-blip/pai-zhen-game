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
    if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = "viewport";
        meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
        document.head.appendChild(meta);
    }

    const style = document.createElement('style');
    style.id = 'xianxia-theme';
    style.innerHTML = `
        body { 
            background: linear-gradient(135deg, #EAE5D9 0%, #D8D3C5 100%); 
            color: #4A4A4A; 
            font-family: 'Noto Serif SC', serif; 
            transition: background 0.5s ease;
            margin: 0; padding: 15px;
            box-sizing: border-box;
            min-height: 100vh;
        }
        
        /* 基础手牌：宣纸底色 + 高级修长比例 */
        .playing-card { 
            background: #FAF9F6; 
            border: 1px solid #D8D3C5; 
            box-shadow: 2px 4px 10px rgba(0,0,0,0.05), inset 0 0 20px rgba(216,211,197,0.1); 
            border-radius: 6px; 
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); 
            cursor: pointer;
            position: relative;
            overflow: hidden;
            aspect-ratio: 2.2 / 3.5; 
            min-width: 90px;
            max-width: 110px;
            flex: 1;
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
            transform: translateY(-20px) scale(1.03); 
        }

        .playing-card.is-back {
            background: linear-gradient(135deg, #4E342E 0%, #261612 100%);
            border-color: #A1887F;
        }
        .playing-card.is-back::after { border-color: rgba(161, 136, 127, 0.3); }
        .playing-card.is-back * { display: none; }
        
        .ink-black { color: #1A1A1A; text-shadow: 0px 0px 2px rgba(0,0,0,0.3); z-index: 1; } 
        .ink-red { color: #A63C3C; text-shadow: 0px 0px 2px rgba(166,60,60,0.3); z-index: 1; } 
        
        .card-top { align-self: flex-start; text-align: left; line-height: 1.1; font-weight: bold; font-size: 15px;}
        .card-center { font-size: 34px; z-index: 1; text-align: center; } 
        .card-bottom { align-self: flex-end; text-align: right; line-height: 1.1; font-weight: bold; transform: rotate(180deg); font-size: 15px;}

        /* 坊市整体面板布局 */
        .shop-panel { 
            background: rgba(250,249,246,0.99); border: 1px solid #D8D3C5; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.2); border-radius: 12px; 
            width: 95%; max-width: 1000px; 
            box-sizing: border-box;
        }
        
        .shop-items { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin: 25px 0; align-items: stretch; }
        
        /* 统一坊市商品卡片 */
        .shop-item-card { 
            background: #FDFCF7; border-radius: 8px; box-shadow: 0 6px 15px rgba(0,0,0,0.06); 
            padding: 18px; box-sizing: border-box;
            width: 170px; 
            display: flex; flex-direction: column; justify-content: flex-start;
            transition: all 0.2s ease; cursor: pointer; position: relative;
        }
        .shop-item-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.1); }

        .shop-item-tarot {
            background: linear-gradient(135deg, #281534 0%, #190A20 100%);
            border: 2px solid #D4AF37; color: #EEE;
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
            background: #FAF5E9; border: 2px solid #A63C3C; 
            box-shadow: 0 0 10px rgba(166,60,60,0.1);
        }
        .shop-item-upgrade::after { 
            content: ''; position: absolute; top: 0; right: 8px; bottom: 0; width: 4px;
            background: repeating-linear-gradient(to bottom, #A63C3C 0, #A63C3C 2px, transparent 2px, transparent 4px);
            opacity: 0.2;
        }
        .shop-item-upgrade .shop-item-title { color: #A63C3C; font-family: 'Ma Shan Zheng', cursive; font-size: 18px; }
        .shop-item-upgrade .shop-item-price { color: #A63C3C !important; border-top-color: rgba(166,60,60,0.1) !important; }

        .joker-card { border: 1px solid #D1CCC0; padding: 12px; width: 125px; display: flex; flex-direction: column; text-align:center; box-sizing: border-box; border-radius:6px; }
        .sold-out { background:#EBEBEB; border-color:#EBEBEB; display:flex; justify-content:center; align-items:center; width: 170px; border-radius: 8px; min-height: 180px;}

        .shop-item-title { font-weight:bold; font-size:16px; margin-bottom:10px; text-align:center; line-height:1.3; }
        .shop-item-desc { color: #555; font-size: 13px; line-height: 1.5; text-align:left; flex-grow: 1; }
        .shop-item-tag { margin-top: auto; padding-top: 8px; font-size: 11px; font-weight: bold; text-align:center; }
        .shop-item-price { margin-top: 10px; color: #8C7A6B; font-weight: bold; font-size: 16px; text-align:center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 10px; }

        button { font-family: 'Noto Serif SC', serif; transition: all 0.2s ease; cursor: pointer; outline: none; }
        button:hover { filter: brightness(1.1); transform: scale(1.02); }
        button:active { transform: scale(0.98); }

        /* ------------------------------------------ */
        /* ✨✨✨ 终极优雅：智能手机端重构布局 ✨✨✨ */
        /* ------------------------------------------ */
        @media screen and (max-width: 768px) {
            body { 
                display: flex !important; 
                flex-direction: column !important; 
                padding: 15px !important; 
                padding-bottom: 100px !important; /* 给底部悬浮台留足空间 */
                box-sizing: border-box !important;
                height: 100vh !important;
                overflow-y: auto !important;
            }

            /* ✨ 1. 规则按钮优雅归位：利用 order 放到网页最顶部，变为精致横幅 */
            #btn-rules-floating {
                order: -1 !important; 
                position: relative !important; 
                top: auto !important; left: auto !important;
                width: 100% !important;
                margin: 0 0 15px 0 !important;
                background: rgba(255, 255, 255, 0.4) !important;
                color: #5D4037 !important;
                border: 1px solid rgba(216,211,197,0.8) !important;
                border-radius: 8px !important;
                padding: 10px !important;
                box-shadow: none !important;
                font-size: 15px !important;
                font-weight: bold !important;
                letter-spacing: 2px !important;
            }

            /* ✨ 2. HUD 顶栏重构为流式卡片，再也不挤压 */
            #hud-top { 
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                background: rgba(255, 255, 255, 0.5) !important;
                border: 1px solid rgba(255,255,255,0.6) !important;
                border-radius: 8px !important;
                padding: 12px 15px !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.03) !important;
                height: auto !important;
                margin-bottom: 15px !important;
            }
            #hud-top div { 
                display: flex !important; 
                justify-content: space-between !important; 
                width: 100% !important; 
                font-size: 14px !important;
                margin: 0 !important;
            }
            #money-display { font-size: 16px !important; color: #D4AF37 !important; }

            /* ✨ 3. 法宝栏：横向丝滑卷轴 */
            #jokers { 
                display: flex !important; 
                flex-wrap: nowrap !important; 
                overflow-x: auto !important; 
                justify-content: flex-start !important;
                gap: 10px !important;
                padding: 5px 0 15px 0 !important;
                margin: 0 !important;
                -webkit-overflow-scrolling: touch;
            }
            #jokers::-webkit-scrollbar { display: none; } /* 隐藏丑陋滚动条 */
            .joker-card { 
                flex: 0 0 auto !important; 
                width: 95px !important; 
                min-height: 100px !important;
            }

            /* ✨ 4. 手牌区：完美矩阵，超过5张自动优雅换行 */
            #hand { 
                display: flex !important; 
                flex-wrap: wrap !important; 
                justify-content: center !important; 
                gap: 8px !important;
                padding: 10px 0 !important;
                margin-bottom: 0 !important; 
            }
            .playing-card {
                width: calc(20% - 8px) !important; /* 一行完美放下5张 */
                min-width: 60px !important;
                max-width: 75px !important;
                aspect-ratio: 2.2 / 3.5 !important; 
                padding: 4px !important;
            }
            .playing-card.selected { transform: translateY(-15px) scale(1.05) !important; }
            .card-center { font-size: 22px !important; }
            .card-top, .card-bottom { font-size: 12px !important; }

            /* ✨ 5. 底部控制台：原生 APP 级悬浮毛玻璃 */
            #controls-bottom {
                position: fixed !important;
                bottom: 0 !important; 
                left: 0 !important;
                width: 100% !important;
                background: rgba(234, 229, 217, 0.85) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                padding: 15px 20px 25px 20px !important; 
                box-sizing: border-box !important;
                display: flex !important;
                justify-content: center !important;
                gap: 15px !important;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.06) !important;
                z-index: 100 !important;
                border-top: 1px solid rgba(255,255,255,0.4) !important;
                margin-top: 0 !important;
            }
            #btn-play, #btn-discard {
                flex: 1 !important; 
                padding: 12px 0 !important;
                font-size: 18px !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            }

            /* ✨ 6. 坊市与规则面板双列适配 */
            .shop-panel { 
                padding: 20px 15px !important; 
                width: 92% !important; 
                max-height: 88vh !important; 
                overflow-y: auto !important; 
                border-radius: 12px !important;
            }
            .shop-panel h2 { font-size: 30px !important; }
            .shop-items { gap: 10px !important; }
            .shop-item-card, .sold-out { 
                width: calc(50% - 5px) !important; /* 双列排布 */
                min-width: 0 !important;
                padding: 12px 8px !important;
            }
            .shop-item-title { font-size: 14px !important; margin-bottom: 6px !important; }
            .shop-item-desc { font-size: 11px !important; line-height: 1.4 !important; }
            
            table { font-size: 11px !important; }
            th, td { padding: 5px 3px !important; }
            #btn-next-round { width: 100% !important; padding: 12px 0 !important; font-size: 18px !important; }
        }
        
        @keyframes floatUpAndFade {
            0% { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -60px) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -80px) scale(0.9); }
        }
        .floating-score {
            position: fixed; top: 35%; left: 50%; transform: translate(-50%, 0);
            z-index: 9999; pointer-events: none; text-align: center;
            animation: floatUpAndFade 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            text-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
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
            jEl.innerHTML = `<div style="color:#5D4037; font-weight:bold; margin-bottom:6px; font-size:13px;">${joker.n}</div><div style="color:#666; font-size:11px; line-height:1.4;">${joker.e}</div>`;
            DOM.jokers.appendChild(jEl);
        });
        const emptySlots = state.jokerSlots - state.jokers.length;
        for(let i = 0; i < emptySlots; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'joker-card';
            emptyEl.style.backgroundColor = 'transparent';
            emptyEl.style.border = '1px dashed #D8D3C5';
            emptyEl.innerHTML = `<div style="color:#A9A499; text-align:center; margin-top:auto; margin-bottom:auto; font-size:12px;">（法宝空位）</div>`;
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
            <div style="font-size: 30px; font-weight: bold; color: #5D4037; letter-spacing: 2px; font-family:'Ma Shan Zheng', cursive;">【${typeName}】</div>
            <div style="font-size: 22px; color: #7A695C; margin-top: 6px; font-family: monospace; font-weight:bold;">${chips} <span style="color:#A63C3C;">×</span> ${mult}</div>
            <div style="font-size: 48px; font-weight: 900; color: #A63C3C; margin-top: 6px;">+ ${total}</div>
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
            <div class="shop-panel" style="padding: 30px;">
                <h2 style="color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 38px; border-bottom: 2px solid #D8D3C5; padding-bottom: 15px; text-align:center; margin:0;">🏮 坊 市 🏮</h2>
                <p style="margin-top: 15px; color: #666; text-align:center; font-size: 16px;">渡劫成功。当前盘缠：<b style="color: #D4AF37; font-size: 20px;">💰 ${state.money} 两</b></p>
                <div class="shop-items">${itemsHtml}</div>
                <div style="text-align:center;">
                    <button id="btn-next-round" style="background-color: #8C7A6B; padding: 14px 45px; font-size: 18px; color: white; border:none; border-radius:6px; box-shadow: 0 6px 15px rgba(140,122,107,0.3); font-weight:bold; letter-spacing: 2px;">踏入下一劫</button>
                </div>
            </div>
        `;
    },

    renderRules() {
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="max-height: 88vh; overflow-y: auto; text-align: left; padding: 30px; width: 95%; max-width: 750px; color: #4A4A4A; margin: 0 auto;">
                <h2 style="text-align: center; margin-bottom: 20px; color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 34px;">📜 天道法则卷宗</h2>
                <div style="line-height: 1.7; font-size: 15px;">
                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px;">一、 基础渡劫</h3>
                    <p>在有限次数内使总分达标。公式：<br><b>单手得分 = (功法筹码 + 牌面值) × (功法倍率 + 法宝倍率)</b><br>
                    <span style="color:#A63C3C; font-size:13px;">* 秘诀：选5张毫无关联的牌只算最大那张（高牌），可作为变相弃牌战术！</span></p>
                    
                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px; margin-top: 25px;">二、 坊市秘宝</h3>
                    <ul style="padding-left: 18px; margin: 8px 0;">
                        <li><b>🏮 法宝：</b>放入上方槽位，提供永久加成。</li>
                        <li><b>🔯 符箓：</b>一次性消耗。可炼化牌库、永久扩充手牌。</li>
                        <li><b>📖 秘籍：</b>一次性消耗。永久提升指定牌型的基础功法阶级。</li>
                    </ul>

                    <h3 style="color: #8C7A6B; border-bottom: 1px solid #D8D3C5; padding-bottom: 5px; margin-top: 25px;">三、 💀 天道劫数 (Boss战)</h3>
                    <p>每 3 重天遭遇强力 Boss 改变规则：</p>
                    <ul style="padding-left: 18px; margin: 8px 0;">
                        <li><b>黑白无常：</b>红桃♥与方块♦面值不计分 (0分)。</li>
                        <li><b>铁面判官：</b>每次出牌随机永久撕毁牌库中的1张牌。</li>
                        <li><b>阎罗王：</b>起手 3 张牌将【背面朝上】盲打。</li>
                    </ul>
                    
                    <h3 style="margin-top: 30px; text-align: center; color: #5D4037; font-family: 'Ma Shan Zheng', cursive; font-size: 22px;">🏆 初始功法基础账本 (Lv.1)</h3>
                    <table style="width: 100%; text-align: center; border-collapse: collapse; margin-top: 15px; font-size: 13px; background-color: rgba(255,255,255,0.8);">
                        <tr style="background-color: #EAE5D9; color: #5D4037;">
                            <th style="padding: 8px; border: 1px solid #D8D3C5;">牌型</th><th style="padding: 8px; border: 1px solid #D8D3C5;">初始筹码</th><th style="padding: 8px; border: 1px solid #D8D3C5;">初始倍率</th>
                        </tr>
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
                <div style="text-align: center; margin-top: 30px;">
                    <button id="btn-close-rules" style="background-color: #8C7A6B; padding: 12px 45px; font-size: 18px; color: white; border:none; border-radius:6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight:bold;">我悟了 (关闭)</button>
                </div>
            </div>
        `;
    },

    renderGameOver() {
        DOM.overlay.classList.remove('hidden');
        DOM.overlay.innerHTML = `
            <div class="shop-panel" style="padding:50px; text-align:center;">
                <h2 style="color: #A63C3C; font-family: 'Ma Shan Zheng', cursive; font-size: 52px; margin:0;">💀 身死道消</h2>
                <p style="margin-top: 20px; color:#666; font-size: 18px;">未能突破天道壁垒...</p>
                <button id="btn-restart" style="margin-top: 35px; background-color: #5D4037; padding: 14px 45px; font-size: 20px; color: white; border:none; border-radius:8px; box-shadow: 0 6px 15px rgba(0,0,0,0.2); font-weight:bold;">重入轮回</button>
            </div>
        `;
    },

    hideOverlay() {
        DOM.overlay.classList.add('hidden');
        DOM.overlay.innerHTML = '';
    }
};