// js/engine/scoring.js

const Scoring = {
    calculate(evalResult, jokers = [], currentState = null, playedCards = []) {
        try {
            if (!currentState && typeof state !== 'undefined') currentState = state;

            // 1. 从 state 中获取动态的功法等级数据 (如果 state 没初始化，给个默认 1 级)
            let typeName = evalResult?.type?.n || evalResult?.type?.name || '高牌';
            
            // 如果 state 里还没这门功法，立刻初始化为 1 级
            if (!currentState.handLevels) currentState.handLevels = {};
            if (!currentState.handLevels[typeName]) {
                currentState.handLevels[typeName] = { level: 1, chips: 10, mult: 2 };
                // 针对不同牌型给个初始底分
                const base = this.getAbsoluteBase(typeName);
                currentState.handLevels[typeName].chips = base.c;
                currentState.handLevels[typeName].mult = base.m;
            }

            let currentHandInfo = currentState.handLevels[typeName];
            let chips = currentHandInfo.chips;
            let mult = currentHandInfo.mult;

            // 2. 提取参与算分的卡牌
            let scoringCards = evalResult?.scoringCards || evalResult?.cards || playedCards || [];
            if (typeName === '高牌' && scoringCards.length > 1) {
                // 再次确保高牌只算最大的一张
                scoringCards = [this.getMaxCard(scoringCards)];
            }
            
            // 3. 基础面值加成 (注意：处理 Boss 劫数 - 黑白无常)
            scoringCards.forEach(card => {
                if (!card) return;
                
                // 🚫 劫数判定：黑白无常 (红桃和方块不计分)
                if (currentState.currentBoss === '黑白无常') {
                    if (card.suitName === 'hearts' || card.suitName === 'diamonds') {
                        return; // 跳过这张牌的面值计算
                    }
                }

                let r = String(card.rankName || card.rank || '');
                let cardVal = ['J','Q','K'].includes(r.toUpperCase()) ? 10 : (r.toUpperCase() === 'A' ? 11 : parseInt(r)||0);
                chips += cardVal;
            });

            // 4. 法宝加成
            jokers.forEach(joker => {
                scoringCards.forEach(card => {
                    let rank = card.rankName || card.rank;
                    let suit = card.suitName || card.suit;
                    let isSpades = suit === 'spades' || suit === '0';
                    let isHearts = suit === 'hearts' || suit === '1';

                    if (joker.t === 'suit_mult' && ((joker.su === 'spades' && isSpades) || (joker.su === 'hearts' && isHearts))) { mult += Number(joker.v) || 0; }
                    if (joker.t === 'rank_xmult' && rank === joker.rank) { mult *= Number(joker.v) || 1; }
                    if (joker.t === 'ace_both' && rank === 'A') { chips += Number(joker.vC) || 20; mult += Number(joker.vM) || 4; }
                });
                if (joker.t === 'add_mult') { mult += Number(joker.v) || 0; }
                if (joker.t === 'type_mult' && typeName.includes(joker.type)) { mult += Number(joker.v) || 0; }
                if (joker.t === 'money_mult') { mult += Math.floor((Number(currentState.money) || 0) / 5) * (Number(joker.v) || 0); }
            });

            // 5. 最终保障
            return { 
                chips: Math.floor(chips), 
                mult: Math.floor(mult), 
                total: Math.floor(chips) * Math.floor(mult),
                level: currentHandInfo.level 
            };
            
        } catch (err) {
            console.error("算分引擎故障：", err);
            return { chips: 5, mult: 1, total: 5, level: 1 };
        }
    },

    getAbsoluteBase(name) {
        const n = name.toUpperCase();
        if (n.includes('同花五')) return { c: 160, m: 16 };
        if (n.includes('同花顺')) return { c: 100, m: 8 };
        if (n.includes('四条')) return { c: 60, m: 7 };
        if (n.includes('三条')) return { c: 30, m: 3 };
        if (n.includes('对')) return { c: 10, m: 2 };
        return { c: 5, m: 1 };
    },

    getMaxCard(cards) {
        let maxCard = cards[0];
        let maxVal = -1;
        cards.forEach(c => {
            let r = String(c.rankName || '');
            let v = ['J','Q','K'].includes(r.toUpperCase()) ? 10 : (r.toUpperCase() === 'A' ? 11 : parseInt(r)||0);
            if (v > maxVal) { maxVal = v; maxCard = c; }
        });
        return maxCard;
    }
};