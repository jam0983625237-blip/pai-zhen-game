// 游戏全局状态管理器
class GameState {
    constructor() {
        this.reset();
    }

    // 重置游戏（开新局时调用）
    reset() {
        // 卡牌区域
        this.deck = [];           // 抽牌堆
        this.hand = [];           // 当前手牌
        this.discardPile = [];    // 弃牌堆
        this.selectedCardIds = [];// 玩家当前选中的卡牌 ID 列表
        
        // 槽位区域
        this.jokers = [];         // 拥有的法宝牌
        this.consumables = [];    // 拥有的消耗品（符箓/星宿/灵符）
        this.jokerSlots = 5;      // 法宝槽位上限
        this.consSlots = 2;       // 消耗品槽位上限
        
        // 经济与基础资源
        this.money = 4;           // 初始资金 4 两
        this.handsLeft = 4;       // 每回合出牌次数
        this.discardsLeft = 3;    // 每回合弃牌次数
        this.handSize = 8;        // 手牌上限
        
        // 游戏进程
        this.ante = 1;            // 当前重天（1-8）
        this.round = 0;           // 0:小劫, 1:大劫, 2:Boss劫
        this.currentScore = 0;    // 当前累计分数
        this.targetScore = 300;   // 目标分数
        this.phase = 'menu';      // 当前游戏阶段：menu(菜单), playing(打牌), shop(坊市), win(通关), lose(失败)
        
        // 统计数据（用于某些法宝的判定）
        this.handCounts = {};     // 记录每种牌型打出过多少次
        this.vouchers = [];       // 已购买的机缘令
    }

    // 洗牌算法（Fisher-Yates 算法）
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
}

// 实例化一个全局唯一的游戏状态对象
const state = new GameState();