// 定义四象花色（黑桃-玄武，红心-朱雀，梅花-青龙，方块-白虎）
const SUITS = {
    xuanwu: { id: 'xuanwu', name: '玄武', symbol: '♠', color: '#2C2C2C' },
    zhuque: { id: 'zhuque', name: '朱雀', symbol: '♥', color: '#C41E3A' },
    qinglong: { id: 'qinglong', name: '青龙', symbol: '♣', color: '#1B5E20' },
    baihu: { id: 'baihu', name: '白虎', symbol: '♦', color: '#D4A017' }
};

// 定义十三种点数
const RANKS = [
    { value: 1, name: 'A', cName: '壹' },
    { value: 2, name: '2', cName: '贰' },
    { value: 3, name: '3', cName: '叁' },
    { value: 4, name: '4', cName: '肆' },
    { value: 5, name: '5', cName: '伍' },
    { value: 6, name: '6', cName: '陆' },
    { value: 7, name: '7', cName: '柒' },
    { value: 8, name: '8', cName: '捌' },
    { value: 9, name: '9', cName: '玖' },
    { value: 10, name: '10', cName: '拾' },
    { value: 11, name: 'J', cName: '甲' },
    { value: 12, name: 'Q', cName: '爵' },
    { value: 13, name: 'K', cName: '王' }
];

// 工厂函数：生成一副崭新的 52 张牌
function generateStandardDeck() {
    const deck = [];
    Object.keys(SUITS).forEach(suitKey => {
        RANKS.forEach(rank => {
            deck.push({
                id: Math.random().toString(36).substring(2, 9), // 给每张牌生成一个唯一身份证号
                suit: suitKey,
                rank: rank.value,
                rankName: rank.name,
                rankCName: rank.cName,
                enhancement: null, // 卡牌增强（如琉璃牌、万花牌）
                seal: null,        // 封印（如赤印、紫印）
                edition: null      // 版本（如闪箔、全息）
            });
        });
    });
    return deck;
}