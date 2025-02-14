// 取得畫布元素及其繪圖上下文
var c = document.getElementById("piano");
var context = c.getContext("2d");
var b = document.getElementById("background");
var context_back = b.getContext("2d");
var a = document.getElementById("score_bar");
var context_score = a.getContext("2d");

// 設定參數
var myScore = 0; // 初始分數
var myTile; // 單條音軌（磚塊）

var intervalTmp; // 更新畫面的時間間隔變數
var geneTmp; // 生成磚塊的時間間隔變數

const HEIGHT = 300; // 畫布高度
const WIDTH = 1000; // 畫布寬度
const SPEED = 2; // 磚塊移動速度

// 初始化畫面與分數條
paintWindow();
paintScoreBar();

// 開始/暫停遊戲按鈕事件
document.getElementById('btn').addEventListener('click', function (e) {
    content = document.getElementById('start_btn');
    if (content.innerHTML == "START" || content.innerHTML == "GG") {
        intervalTmp = window.setInterval(upDate, 5);
        geneTmp = window.setInterval(geneBlock, 10);
        document.getElementById('music').play();
        content.innerHTML = "PAUSE";
    } else {
        document.getElementById('music').pause();
        window.clearInterval(intervalTmp);
        window.clearInterval(geneTmp);
        content.innerHTML = "START";
    }
});

// 繪製分數條
function paintScoreBar() {
    score_gradient = context_score.createLinearGradient(0, 0, HEIGHT, 0);
    score_gradient.addColorStop(0, "rgba(74,171,254,0)");
    score_gradient.addColorStop(0.5, "rgba(74,84,254,0)");
    score_gradient.addColorStop(1, "rgba(116,74,254,0)");
    context_score.fillStyle = score_gradient;
    context_score.fillRect(0, 0, HEIGHT, 70);
}

const blockList = [
    1935,   4904,   6406,  10410,  14414,  15782,
   16316,  18385,  22455,  22856,  23790,  25125,
   25959,  30363,  31798,  32999,  34401,  38371,
   39639,  40974,  42642,  43677,  45545,  50216,
   54320,  62328,  63997,  64998,  65365,  66800,
   68335,  68968,  70337,  71705,  72672,  72939,
   74207,  75475,  77410,  79679,  80914,  86353,
   87554,  88154,  89656,  90523,  91725,  92959,
   94461,  95695,  96963,  98798,  99699, 100867,
  102402, 103670, 104604, 104938, 106373, 107707,
  108675, 109409, 110310, 117117, 118184, 119652
]

let time = 0

function customRoundToNearestTen(number) {
    return Math.round(number / 10) * 10;
}

// 生成新的磚塊（單一音軌）
function geneBlock() {
    console.log(time)
    for (let i = 0; i < blockList.length; i++) {
        // offset 2.66s
        let blockTime = customRoundToNearestTen(blockList[i]) - 2660
        if (time === blockTime) {
            myTile = new Block();   
        }
    }
    time = time + 10;
    // if (!myTile || !myTile.live) {
    //     myTile = new Block();
    // }
}

// 繪製遊戲背景
function paintWindow() {
    my_gradient = context_back.createLinearGradient(0, HEIGHT, 1000, HEIGHT); // 垂直翻轉漸層
    my_gradient.addColorStop(0, "rgba(65,234,246,0.6)");
    my_gradient.addColorStop(1, "rgba(254,74,251,0.5)");

    context_back.fillStyle = my_gradient;
    context_back.fillRect(0, 0, 1000, HEIGHT);

    // 繪製白色分隔線
    context_back.beginPath();
    context_back.moveTo(130, 0);
    context_back.lineTo(130, HEIGHT);
    context_back.strokeStyle = "white";
    context_back.stroke();
}

// 定義磚塊類別（單一音軌）
function Block() {
    this.width = 130;
    this.height = 600;
    this.color = "black";

    this.y = 0;
    this.x = 1000; // 初始位置在畫布右邊

    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
    this.live = true;

    window.addEventListener('keydown', function (e) {
        myTile.keyCode = e.keyCode;
    });
    window.addEventListener('keyup', function (e) {
        myTile.keyCode = false;
    });
}

function getRandomSpeed(min, max) {
    return Math.random() * (max - min) + min;
}

// 移動磚塊（音軌）
function move() {
    if (myTile.live) {
        myTile.x -= SPEED; // 磚塊左移
        context.fillStyle = "black";
        context.fillRect(myTile.x, myTile.y, myTile.width, myTile.height);
        context.clearRect(myTile.x + myTile.width, myTile.y, SPEED, myTile.height); // 清除右側殘影
    }
}

// 正確按下按鍵後的處理
function afterRight() {
    myScore++;
    context.clearRect(myTile.x, myTile.y, myTile.width, myTile.height);
    myTile.live = false;
}

let failCount = 0;

// 更新遊戲畫面
function upDate() {
    let scoreText = `Score: ${myScore}, Fail: ${failCount}`;
    var textWidth = context_score.measureText(scoreText).width;
    context_score.clearRect(0, 0, HEIGHT, 70);
    context_score.font = "30px Verdana";
    context_score.textAlign = 'center';
    paintScoreBar();
    context_score.fillStyle = "rgba(88,38,255,0.8)";
    context_score.fillText(scoreText, a.width / 2, 50);

    if (myTile && myTile.live) {
        move();
        if (myTile.x < 150 && myTile.x > 0) {
            if (myTile.keyCode == 65) { // A鍵
                afterRight();
            }
        }

        if (myTile.x <= 0) {
            context.clearRect(myTile.x, myTile.y, myTile.width, myTile.height);
            context.fillStyle = "rgba(245,13,13,0.8)";
            context.fillRect(myTile.x, myTile.y, myTile.width / 2, myTile.height);
            myTile.live = false;
            // document.getElementById('music').pause();
            // window.clearInterval(intervalTmp);
            // window.clearInterval(geneTmp);
            // content.innerHTML = "GG";
            failCount++;
        }
    }
}