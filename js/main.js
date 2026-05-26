// js/main.js
function initGame() {
    console.log("「牌阵」系统启动中...");
    
    // 1. 重置并设置状态
    state.reset();

    // ✨ 核心初始化：准备功法等级容器
    state.handLevels = {
        '高牌': { level: 1, chips: 5, mult: 1 },
        '一对': { level: 1, chips: 10, mult: 2 },
        '两对': { level: 1, chips: 20, mult: 2 },
        '三条': { level: 1, chips: 30, mult: 3 },
        '顺子': { level: 1, chips: 30, mult: 4 },
        '同花': { level: 1, chips: 35, mult: 4 },
        '葫芦': { level: 1, chips: 40, mult: 4 }
    };

    state.phase = 'playing'; 
    
    // 2. 洗牌与发牌
    state.deck = generateStandardDeck();
    state.shuffleDeck();
    for(let i = 0; i < state.handSize; i++) {
        state.hand.push(state.deck.pop());
    }

    // 3. 初始法宝 (已注释掉，现在开局是干净的，必须去坊市买啦！)
    // if (typeof JOKERS_DB !== 'undefined') {
    //     state.jokers.push(JOKERS_DB[0], JOKERS_DB[1]);
    // }
    
    // 4. 绑定事件与渲染
    bindEvents();
    Renderer.updateAll();
    
    console.log("发牌完成！");
}

// 💥 崩溃雷达：如果引擎死机，把错误原因直接打印在屏幕上
window.addEventListener('DOMContentLoaded', () => {
    try {
        initGame();
    } catch (error) {
        document.body.innerHTML += `
        <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:#FFFDE7; z-index:9999; padding:40px; box-sizing:border-box;">
            <h1 style="color:#C41E3A;">🚨 游戏引擎崩溃了！</h1>
            <p style="font-size:20px; color:#2C2C2C;">可能是某个文件少复制了一个括号。请截图把下面的错误代码发给我：</p>
            <pre style="background:#2C2C2C; color:#FFD700; padding:20px; font-size:16px; margin-top:20px; border-radius:10px; white-space:pre-wrap;">${error.stack}</pre>
        </div>`;
    }
});