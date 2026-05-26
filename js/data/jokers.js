// js/data/jokers.js

const JOKERS_DB = [
    // === 🏮 门神系列 (基础数值与特定牌型强化) ===
    { id: 'J01', n: '神荼', r: 'common', p: 4, e: '每次出牌 +4 倍率', t: 'add_mult', v: 4 },
    { id: 'J02', n: '郁垒', r: 'common', p: 5, e: '打出♠(青龙)牌时，每张 +3 倍率', t: 'suit_mult', su: 'spades', v: 3 },
    { id: 'J03', n: '秦琼', r: 'uncommon', p: 6, e: '打出K时，每张 ×1.5 倍率', t: 'rank_xmult', rank: 'K', v: 1.5 },
    { id: 'J04', n: '尉迟恭', r: 'common', p: 5, e: '打出♣(玄武)牌时，每张 +20 筹码', t: 'suit_chips', su: 'clubs', v: 20 },
    { id: 'J05', n: '钟馗', r: 'common', p: 4, e: '打出人头牌(J/Q/K)时，每张 +30 筹码', t: 'face_chips', v: 30 },
    { id: 'J06', n: '魏征', r: 'common', p: 5, e: '结算时，每剩余1次弃牌 +30 筹码', t: 'disc_chips', v: 30 },

    // === 🎭 脸谱系列 (牌型组合强化) ===
    { id: 'J07', n: '红净', r: 'common', p: 5, e: '打出♥(朱雀)牌时，每张 +3 倍率', t: 'suit_mult', su: 'hearts', v: 3 },
    { id: 'J08', n: '黑头', r: 'common', p: 5, e: '打出的牌包含【一对】时，+8 倍率', t: 'type_mult', type: 'Pair', v: 8 },
    { id: 'J09', n: '白面', r: 'common', p: 4, e: '打出奇数牌(A,3,5,7,9)时，每张 +31 筹码', t: 'odd_chips', v: 31 },
    { id: 'J10', n: '丑角', r: 'common', p: 4, e: '打出偶数牌(2,4,6,8,10)时，每张 +4 倍率', t: 'even_mult', v: 4 },
    { id: 'J11', n: '武生', r: 'uncommon', p: 6, e: '打出的牌包含【顺子】时，+100 筹码', t: 'type_chips', type: 'Straight', v: 100 },
    { id: 'J12', n: '花旦', r: 'uncommon', p: 6, e: '打出的牌包含【同花】时，+80 筹码', t: 'type_chips', type: 'Flush', v: 80 },

    // === 🐁 生肖系列 (经济机制与手牌控制) ===
    { id: 'J13', n: '子鼠', r: 'common', p: 4, e: '进入坊市时，额外获得 4 两银子', t: 'income', v: 4 },
    { id: 'J14', n: '丑牛', r: 'uncommon', p: 6, e: '打出的牌面为2,3,4,5时，筹码重新触发1次', t: 'retrig_low' },
    { id: 'J15', n: '寅虎', r: 'common', p: 5, e: '出牌若不含人头牌，本法宝永久 +1 倍率', t: 'grow_mult', v: 1 },
    { id: 'J16', n: '卯兔', r: 'uncommon', p: 6, e: '战斗时 +1 手牌上限', t: 'handsize', v: 1 },
    { id: 'J17', n: '辰龙', r: 'rare', p: 8, e: '所有牌都被视为人头牌(J/Q/K)', t: 'all_face' },
    { id: 'J18', n: '巳蛇', r: 'uncommon', p: 5, e: '摧毁相邻右侧法宝，获得其原价的双倍银两', t: 'destroy_right' },

    // === 🖌️ 文房四宝 (全局倍率与特定加成) ===
    { id: 'J19', n: '湖笔', r: 'uncommon', p: 6, e: '每打出一张黑桃♠，全局 ×0.2 倍率', t: 'suit_xmult_add', su: 'spades', v: 0.2 },
    { id: 'J20', n: '徽墨', r: 'rare', p: 8, e: '如果打出的牌全是黑色(♠/♣)，全局 ×3 倍率', t: 'all_black_xmult', v: 3 },
    { id: 'J21', n: '宣纸', r: 'uncommon', p: 6, e: '打出【高牌】时，提供 ×2 倍率', t: 'type_xmult', type: 'High Card', v: 2 },
    { id: 'J22', n: '端砚', r: 'common', p: 4, e: '手牌中(未打出)每有一张9，结算时赚取 1 两', t: 'held_nine_coin', v: 1 },

    // === 🐉 神兽系列 (终极核心与逆天改命) ===
    { id: 'J23', n: '青龙', r: 'rare', p: 8, e: '黑桃♠牌额外提供 +7 倍率', t: 'suit_mult_heavy', su: 'spades', v: 7 },
    { id: 'J24', n: '白虎', r: 'rare', p: 8, e: '打出A时，+20筹码 且 +4倍率', t: 'ace_both', vC: 20, vM: 4 },
    { id: 'J25', n: '朱雀', r: 'rare', p: 8, e: '红桃♥牌被计分时，额外 ×1.5 倍率', t: 'suit_xmult', su: 'hearts', v: 1.5 },
    { id: 'J26', n: '玄武', r: 'rare', p: 8, e: '方块♦和梅花♣被系统视为同一种花色', t: 'merge_suits' },
    { id: 'J27', n: '饕餮', r: 'rare', p: 8, e: '你当前每拥有 5 两银子，就提供 +2 倍率', t: 'money_mult', v: 2 },
    { id: 'J28', n: '貔貅', r: 'uncommon', p: 6, e: '每次出牌后，赚取 1 两银子', t: 'play_income', v: 1 }
];