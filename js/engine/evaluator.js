// js/engine/evaluator.js

const Evaluator = {
    // ✨ 核心修复：现在的裁判在判牌前，会先戴上“法宝透视镜”(jokers)
    evaluate(cards, jokers = []) {
        if (!cards || cards.length === 0) return { type: { n: '高牌' }, scoringCards: [] };

        // 1. 探查法宝：是否有【玄武】(方块♦和梅花♣视为同色)
        const hasMergeSuits = jokers.some(j => j.t === 'merge_suits');

        // 2. 数据标准化与排序
        let parsedCards = cards.map(c => {
            let rankVal = 0;
            let r = String(c.rankName || c.rank || '').toUpperCase();
            if (r === 'J') rankVal = 11;
            else if (r === 'Q') rankVal = 12;
            else if (r === 'K') rankVal = 13;
            else if (r === 'A') rankVal = 14;
            else rankVal = parseInt(r) || 0;

            // 统一花色标识: 0:♠, 1:♥, 2:♣, 3:♦
            let s = c.suitName || c.suit;
            let suitId = (s === 'spades' || s === 0 || s === '0') ? 0 :
                         (s === 'hearts' || s === 1 || s === '1') ? 1 :
                         (s === 'clubs'  || s === 2 || s === '2') ? 2 : 3;

            // ✨ 机制生效：如果带着玄武，把方块(3)全部判定为梅花(2)
            let evalSuitId = (hasMergeSuits && suitId === 3) ? 2 : suitId;

            return { original: c, val: rankVal, suit: evalSuitId };
        });

        // 按面值从大到小排序
        parsedCards.sort((a, b) => b.val - a.val);

        // 3. 统计花色与面值的频率
        let rankCounts = {};
        let suitCounts = {};
        parsedCards.forEach(c => {
            rankCounts[c.val] = (rankCounts[c.val] || 0) + 1;
            suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
        });

        let maxSameSuit = Math.max(...Object.values(suitCounts), 0);
        let uniqueRanks = Object.keys(rankCounts).length;

        // 提取各种对子、三条、四条的数量
        let pairs = [], trips = [], quads = [], quints = [];
        for (let val in rankCounts) {
            if (rankCounts[val] === 2) pairs.push(parseInt(val));
            if (rankCounts[val] === 3) trips.push(parseInt(val));
            if (rankCounts[val] === 4) quads.push(parseInt(val));
            if (rankCounts[val] === 5) quints.push(parseInt(val));
        }
        // 确保拿到的是最大的对子/三条
        pairs.sort((a,b)=>b-a); 
        trips.sort((a,b)=>b-a);

        // 4. 同花与顺子判定
        let isFlush = maxSameSuit >= 5;
        let isStraight = false;
        let straightCards = [];

        if (uniqueRanks >= 5) {
            // 去重，防止有对子时干扰顺子判断
            let uniqueVals = [...new Set(parsedCards.map(c => c.val))];
            for (let i = 0; i <= uniqueVals.length - 5; i++) {
                if (uniqueVals[i] - uniqueVals[i+4] === 4) {
                    isStraight = true;
                    let targetVals = uniqueVals.slice(i, i+5);
                    straightCards = targetVals.map(v => parsedCards.find(c => c.val === v).original);
                    break;
                }
            }
            // 极限兜底：A-2-3-4-5 顺子判定
            if (!isStraight && uniqueVals.includes(14) && uniqueVals.includes(5) && uniqueVals.includes(4) && uniqueVals.includes(3) && uniqueVals.includes(2)) {
                isStraight = true;
                straightCards = [14, 5, 4, 3, 2].map(v => parsedCards.find(c => c.val === v).original);
            }
        }

        // 5. 最终牌型断定（严格遵循从大到小）
        let typeName = '高牌';
        let scoringCards = [];

        if (isFlush && isStraight) {
            typeName = (straightCards[0].rankName === 'A' && straightCards[1].rankName === 'K') ? '皇家同花顺' : '同花顺';
            scoringCards = cards; // 同花顺5张全算
        } else if (quints.length === 1) {
            typeName = isFlush ? '同花五条' : '五条';
            scoringCards = cards;
        } else if (quads.length === 1) {
            typeName = '四条';
            scoringCards = parsedCards.filter(c => c.val === quads[0]).map(c => c.original);
        } else if (trips.length === 1 && pairs.length >= 1) {
            typeName = isFlush ? '同花葫芦' : '葫芦';
            scoringCards = parsedCards.filter(c => c.val === trips[0] || c.val === pairs[0]).map(c => c.original);
        } else if (isFlush) {
            typeName = '同花';
            let flushSuit = parseInt(Object.keys(suitCounts).find(k => suitCounts[k] >= 5));
            scoringCards = parsedCards.filter(c => c.suit === flushSuit).map(c => c.original).slice(0, 5);
        } else if (isStraight) {
            typeName = '顺子';
            scoringCards = straightCards;
        } else if (trips.length === 1) {
            typeName = '三条';
            scoringCards = parsedCards.filter(c => c.val === trips[0]).map(c => c.original);
        } else if (pairs.length >= 2) {
            typeName = '两对';
            // 确保两对只取最大的两个对子（防止抓6张牌出现3对的情况）
            scoringCards = parsedCards.filter(c => c.val === pairs[0] || c.val === pairs[1]).map(c => c.original);
        } else if (pairs.length === 1) {
            typeName = '一对';
            scoringCards = parsedCards.filter(c => c.val === pairs[0]).map(c => c.original);
        } else {
            typeName = '高牌';
            // 严格执行高牌战术：只算最大的一张
            scoringCards = [parsedCards[0].original]; 
        }

        return {
            type: { n: typeName },
            scoringCards: scoringCards
        };
    }
};