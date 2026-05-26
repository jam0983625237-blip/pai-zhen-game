// js/ui/events.js

const TAROT_DB = [
    { n: '愚者之符', e: '大智若愚：立刻获得 10 两银子', p: 3, isTarot: true, effect: 'money', v: 10 },
    { n: '魔术师之符', e: '掌控元素：永久 +1 出牌次数', p: 6, isTarot: true, effect: 'baseHands', v: 1 },
    { n: '女祭司之符', e: '神秘直觉：永久 +1 弃牌次数', p: 6, isTarot: true, effect: 'baseDiscards', v: 1 },
    { n: '命运之轮符', e: '福祸相依：50%概率得 20 两，50%无事发生', p: 4, isTarot: true, effect: 'wheel' },
    { n: '死神之符', e: '灵魂收割：永久销毁牌库中 2 张面值最小的牌！', p: 5, isTarot: true, effect: 'destroy_low' },
    { n: '审判之符', e: '神圣克隆：在牌库中随机复制 1 张人头牌', p: 7, isTarot: true, effect: 'clone_face' },
    { n: '星星之符', e: '星辰同化：将牌库中随机 2 张牌的花色永久变为黑桃♠', p: 6, isTarot: true, effect: 'change_suit_spades' }
];

const UPGRADE_DB = [
    { n: '《三才阵法》', e: '【三条】永久等级+1 (筹码+25, 倍率+2)', p: 6, isUpgrade: true, target: '三条' },
    { n: '《五行秘籍》', e: '【顺子】永久等级+1 (筹码+25, 倍率+2)', p: 7, isUpgrade: true, target: '顺子' },
    { n: '《同花真经》', e: '【同花】永久等级+1 (筹码+25, 倍率+2)', p: 7, isUpgrade: true, target: '同花' },
    { n: '《双子心法》', e: '【两对】永久等级+1 (筹码+20, 倍率+1)', p: 5, isUpgrade: true, target: '两对' }
];

const BOSS_DB = [
    { n: '黑白无常', e: '劫数：所有的【红桃】和【方块】面值不计分' },
    { n: '铁面判官', e: '劫数：每次点击【出牌】，都会永久撕毁牌库中的1张牌' },
    { n: '阎罗王', e: '劫数：起手 3 张牌将【背面朝上】(盲打模式)' }
];

function checkGameState() {
    if (state.currentScore >= state.targetScore) {
        state.phase = 'shop';
        state.money += 3 + state.handsLeft;
        state.currentBoss = null; 
        
        state.shopItems = [];
        let j = [...JOKERS_DB].sort(() => 0.5-Math.random());
        if(j[0]) state.shopItems.push({...j[0], sold:false});
        if(j[1]) state.shopItems.push({...j[1], sold:false});
        
        let t = [...TAROT_DB].sort(() => 0.5-Math.random());
        if(t[0]) state.shopItems.push({...t[0], sold:false});

        let u = [...UPGRADE_DB].sort(() => 0.5-Math.random());
        if(u[0]) state.shopItems.push({...u[0], sold:false});

        Renderer.renderShop();
    } else if (state.handsLeft <= 0) {
        state.phase = 'lose';
        Renderer.renderGameOver();
    }
}

function bindEvents() {
    // 激活原生音效引擎 (浏览器需要用户交互才能播放声音)
    document.body.addEventListener('click', () => AudioEngine.init(), { once: true });

    if (!document.getElementById('btn-rules-floating')) {
        const rulesBtn = document.createElement('button');
        rulesBtn.id = 'btn-rules-floating';
        rulesBtn.innerText = '📜 规则说明';
        rulesBtn.style.cssText = "position:fixed; top:20px; left:20px; z-index:50; background:#8C7A6B; color:white; padding:8px 15px; font-size:16px; border:none; border-radius:4px; cursor:pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1);";
        document.body.appendChild(rulesBtn);
        rulesBtn.addEventListener('click', () => { AudioEngine.play('click'); Renderer.renderRules(); });
    }

    if (!document.getElementById('btn-fullscreen')) {
        const fsBtn = document.createElement('button');
        fsBtn.id = 'btn-fullscreen';
        fsBtn.innerText = '⛶ 全屏';
        fsBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:99999; background:#D4AF37; color:#5D4037; padding:10px 18px; font-size:18px; font-weight:bold; border:none; border-radius:6px; cursor:pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);";
        document.body.appendChild(fsBtn);
        fsBtn.addEventListener('click', () => {
            AudioEngine.play('click');
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
                fsBtn.innerText = '✕ 退出全屏';
            } else {
                document.exitFullscreen();
                fsBtn.innerText = '⛶ 全屏';
            }
        });
        document.addEventListener('fullscreenchange', () => {
            fsBtn.innerText = document.fullscreenElement ? '✕ 退出全屏' : '⛶ 全屏';
        });
    }

    DOM.hand.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.playing-card');
        if (!cardEl || state.phase !== 'playing') return; 
        
        AudioEngine.play('click'); // 点牌音效

        const cardIndex = cardEl.dataset.index;
        const card = state.hand[cardIndex];
        const selectedPos = state.selectedCardIds.indexOf(card.id);

        if (selectedPos > -1) {
            state.selectedCardIds.splice(selectedPos, 1);
        } else {
            if (state.selectedCardIds.length < 5) state.selectedCardIds.push(card.id);
        }
        Renderer.updateAll();
    });

    DOM.btnPlay.addEventListener('click', () => {
        if (state.selectedCardIds.length === 0 || state.handsLeft <= 0 || state.phase !== 'playing') return;

        const selectedCards = state.hand.filter(c => state.selectedCardIds.includes(c.id));

        // ✨ 核心连接：在这里把 state.jokers 喂给裁判，让他带着法宝效果去判牌！
        const evalResult = Evaluator.evaluate(selectedCards, state.jokers);

        const score = Scoring.calculate(evalResult, state.jokers, state, selectedCards);

        state.currentScore += score.total;
        state.handsLeft--;

        if (state.currentBoss === '铁面判官' && state.masterDeck && state.masterDeck.length > 0) {
            state.masterDeck.splice(Math.floor(Math.random()*state.masterDeck.length), 1);
        }

        if (Renderer.showPlayEffect) {
            Renderer.showPlayEffect(`Lv.${score.level || 1} ${evalResult.type.n}`, score.chips, score.mult, score.total);
        }

        state.hand = state.hand.filter(c => !state.selectedCardIds.includes(c.id));
        state.discardPile.push(...selectedCards);
        state.selectedCardIds = [];

        while (state.hand.length < state.handSize && state.deck.length > 0) {
            state.hand.push(state.deck.pop());
        }

        Renderer.updateAll();
        setTimeout(checkGameState, 1200);
    });

    DOM.btnDiscard.addEventListener('click', () => {
        if (state.selectedCardIds.length === 0 || state.discardsLeft <= 0 || state.phase !== 'playing') return;
        
        AudioEngine.play('hover'); // 弃牌音效

        const selectedCards = state.hand.filter(c => state.selectedCardIds.includes(c.id));
        state.hand = state.hand.filter(c => !state.selectedCardIds.includes(c.id));
        state.discardPile.push(...selectedCards);
        state.selectedCardIds = [];
        state.discardsLeft--;

        while (state.hand.length < state.handSize && state.deck.length > 0) {
            state.hand.push(state.deck.pop());
        }

        Renderer.updateAll();
    });

    DOM.overlay.addEventListener('click', (e) => {
        // 处理基础的点击声音
        if (e.target.tagName === 'BUTTON' || e.target.closest('.shop-item')) {
            AudioEngine.play('click');
        }

        if (e.target.id === 'btn-close-rules') {
            if (state.phase === 'shop') Renderer.renderShop();
            else if (state.phase === 'lose') Renderer.renderGameOver();
            else Renderer.hideOverlay();
            return;
        }

        const shopItemEl = e.target.closest('.shop-item');
        if (shopItemEl) {
            const index = shopItemEl.dataset.index;
            const item = state.shopItems[index];

            if (state.money >= item.p) {
                if (item.isUpgrade) {
                    state.money -= item.p;
                    item.sold = true;
                    if (!state.handLevels) state.handLevels = {};
                    if (!state.handLevels[item.target]) {
                         const base = Scoring.getAbsoluteBase ? Scoring.getAbsoluteBase(item.target) : {c:5, m:1};
                         state.handLevels[item.target] = { level: 1, chips: base.c, mult: base.m };
                    }
                    state.handLevels[item.target].level++;
                    state.handLevels[item.target].chips += 25;
                    state.handLevels[item.target].mult += 2;
                    alert(`📖 功法突破！你的【${item.target}】已升至 Lv.${state.handLevels[item.target].level}`);
                    Renderer.renderShop(); Renderer.renderHUD();
                }
                else if (item.isTarot) {
                    state.money -= item.p;
                    item.sold = true;
                    if (item.effect === 'money') { state.money += item.v; alert(`💰 获得 ${item.v} 两！`); }
                    if (item.effect === 'baseHands') { state.baseHands += item.v; alert('✨ 永久出牌次数增加了！'); }
                    if (item.effect === 'baseDiscards') { state.baseDiscards += item.v; alert('✨ 永久弃牌次数增加了！'); }
                    if (item.effect === 'handSize') { state.handSize += item.v; alert('✨ 你的手牌上限增加了！'); }
                    if (item.effect === 'wheel') {
                        if (Math.random() < 0.5) { state.money += 20; alert('🌟 命运眷顾！天降 20 两银子！'); }
                        else { alert('🍂 命运之轮转动，但什么事也没发生...'); }
                    }

                    if (['destroy_low', 'clone_face', 'change_suit_spades'].includes(item.effect)) {
                        if (!state.masterDeck) state.masterDeck = [...state.deck, ...state.hand, ...state.discardPile];
                        if (item.effect === 'destroy_low') {
                            state.masterDeck.sort((a, b) => {
                                let vA = ['J','Q','K'].includes(a.rankName) ? 10 : (a.rankName==='A'?11:parseInt(a.rankName)||0);
                                let vB = ['J','Q','K'].includes(b.rankName) ? 10 : (b.rankName==='A'?11:parseInt(b.rankName)||0);
                                return vA - vB;
                            });
                            let removed = state.masterDeck.splice(0, 2);
                            let names = removed.map(c => c.rankName).join(' 和 ');
                            alert(`💀 死神收割！你永久失去了：${names}`);
                        }
                        if (item.effect === 'clone_face') {
                            let faces = state.masterDeck.filter(c => ['J','Q','K','A'].includes(c.rankName));
                            if (faces.length > 0) {
                                let clone = JSON.parse(JSON.stringify(faces[Math.floor(Math.random() * faces.length)]));
                                clone.id = 'card_clone_' + Date.now();
                                state.masterDeck.push(clone);
                                alert(`✨ 神圣克隆！牌库多了一张全新的：${clone.rankName}`);
                            }
                        }
                        if (item.effect === 'change_suit_spades') {
                            for(let i=0; i<2; i++) {
                                let target = state.masterDeck[Math.floor(Math.random() * state.masterDeck.length)];
                                target.suit = target.suitName !== undefined ? 'spades' : 0;
                                target.suitName = 'spades';
                            }
                            alert(`🌟 星辰同化！牌库中随机 2 张牌的花色变为了【黑桃♠】！`);
                        }
                    }
                    Renderer.renderShop(); Renderer.renderHUD();
                }
                else if (state.jokers.length < state.jokerSlots) {
                    state.money -= item.p;
                    item.sold = true;
                    state.jokers.push({ ...item });
                    Renderer.renderShop(); Renderer.renderHUD();
                } else { alert("法宝槽位已满！"); }
            } else { alert("银两不足！"); }
        }

        // ✨ 处理下一关逻辑
        if (e.target.id === 'btn-next-round') {
            try {
                AudioEngine.play('nextRound'); // ✨ 触发空灵钟声

                state.ante++;
                state.targetScore = Math.floor(state.targetScore * 1.5);
                state.currentScore = 0;

                if (!state.baseHands) state.baseHands = 4;
                if (!state.baseDiscards) state.baseDiscards = 3;
                state.handsLeft = state.baseHands;
                state.discardsLeft = state.baseDiscards;
                state.phase = 'playing';

                if (state.ante % 3 === 0) {
                    const boss = BOSS_DB[Math.floor(Math.random()*BOSS_DB.length)];
                    state.currentBoss = boss.n;
                    alert(`⚠️ 警告：进入劫数关卡！\n当前 Boss：【${boss.n}】\n${boss.e}`);
                }

                if (!state.masterDeck) state.masterDeck = generateStandardDeck();
                state.deck = JSON.parse(JSON.stringify(state.masterDeck));
                state.hand = []; state.discardPile = [];
                state.shuffleDeck();

                for(let i = 0; i < state.handSize; i++) {
                    if (state.deck.length > 0) state.hand.push(state.deck.pop());
                }

                Renderer.hideOverlay();
                Renderer.updateAll();
            } catch (error) { console.error("切换重天报错：", error); }
        }

        if (e.target.id === 'btn-restart') location.reload();
    });
}