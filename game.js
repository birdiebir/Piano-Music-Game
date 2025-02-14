// 取得畫布元素及其繪圖上下文
const c = document.getElementById("piano");
const context = c.getContext("2d");
const b = document.getElementById("background");
const context_back = b.getContext("2d");
const a = document.getElementById("score_bar");
const context_score = a.getContext("2d");

const startBtn = document.getElementById("start_btn");
const music = document.getElementById("music");

const statusText = document.getElementById("status");

const rmssd = document.getElementById("rmssd");
const sdnn = document.getElementById("sdnn");
const response = document.getElementById("response");


// 設定參數
var myScore = 0; // 初始分數
var blocks = []; // 存放多個磚塊的陣列

var intervalTmp; // 更新畫面的時間間隔變數
var geneTmp; // 生成磚塊的時間間隔變數

const HEIGHT = 300; // 畫布高度
const WIDTH = 1000; // 畫布寬度
const SPEED = 2; // 磚塊移動速度


let failCount = 0;
let time = 0;

// Add near the top of the file with other global variables
let responseTimes = []; // Change from object to array
let responseCounter = 0;
let gameStartTime = 0;
let isGameActive = false; // Track if game is actively running
let correctHitRanges = []; // Array to store the valid hit time ranges for each block
let bleResponseTimes = []; // New array specifically for BLE response times
let failureNotifications = []; // Array to track failure notifications
let responseTimeDifferences = []; // Array to store time differences for correct hits

// Update Airtable configuration
const AIRTABLE_API_KEY = 'YOUR_API_KEY';
const BASE_ID = 'YOUR_BASE_ID';
const TABLE_NAME = 'YOUR_TABLE_NAME';

// 初始化畫面與分數條
paintWindow();
paintScoreBar();

let isGameRunning = false; // 追蹤遊戲是否正在進行



// 開始/暫停遊戲按鈕事件
document.getElementById('btn').addEventListener('click', function (e) {
    if (startBtn.innerHTML == "START" || startBtn.innerHTML == "GG") {
        intervalTmp = window.setInterval(upDate, 5);
        geneTmp = window.setInterval(geneBlock, 10); // 調整生成磚塊的間隔
        music.play();
        startBtn.innerHTML = "PAUSE";

        statusText.innerText = "";
        rmssd.innerText = "";
        sdnn.innerText = "";
        response.innerText = "";

        gameStartTime = Date.now();
        isGameActive = true;  // Set game as active
        myScore = 0;
        failCount = 0;
        time = 0;
        responseTimes = [];
        responseCounter = 0;

        blocks = [];

        context.clearRect(0, 0, WIDTH, HEIGHT);
        paintWindow();
        paintScoreBar();

    } else {
        music.pause();
        window.clearInterval(intervalTmp);
        window.clearInterval(geneTmp);

        startBtn.innerHTML = "START";
        isGameActive = false;  // Set game as inactive when paused
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

// 用來計算最近的 10 的整數
function customRoundToNearestTen(number) {
    return Math.round(number / 10) * 10;
}

// Remove the SONG_BLOCKS object and keep just one blockList
const blockList = [
    1935, 4904, 6406, 10410, 14414, 15782,
    16316, 18385, 22455, 22856, 23790, 25125,
    25959, 30363, 31798, 32999, 34401, 38371,
    39639, 40974, 42642, 43677, 45545, 50216,
    54320, 62328, 63997, 64998, 65365, 66800,
    68335, 68968, 70337, 71705, 72672, 72939,
    74207, 75475, 77410, 79679, 80914, 86353,
    87554, 88154, 89656, 90523, 91725, 92959,
    94461, 95695, 96963, 98798, 99699, 100867,
    102402, 103670, 104604, 104938, 106373, 107707,
    108675, 109409, 110310, 117117, 118184, 119652
];

// Simplify the geneBlock function to use the single blockList
function geneBlock() {
    // console.log(time);
    for (let i = 0; i < blockList.length; i++) {
        // offset 2180 ms
        let blockTime = customRoundToNearestTen(blockList[i]) - 2180;
        if (time === blockTime) {
            console.log(blockTime);
            blocks.push(new Block()); // 將新的 Block 加入 blocks 陣列
        }
    }
    time += 10; // 每次調用增加 10 毫秒
}

// 繪製遊戲背景
function paintWindow() {
    my_gradient = context_back.createLinearGradient(0, HEIGHT, 1000, HEIGHT); // 垂直翻轉漸層
    my_gradient.addColorStop(0, "rgba(65,234,246,0.6)");
    my_gradient.addColorStop(1, "rgba(254,74,251,0.5)");

    context_back.fillStyle = my_gradient;
    context_back.fillRect(0, 0, 1000, HEIGHT);

    // 繪製白色分隔線
    // context_back.beginPath();
    // context_back.moveTo(130, 0);
    // context_back.lineTo(130, HEIGHT);
    context_back.strokeStyle = "white";
    context_back.stroke();

    context_back.fillStyle = "white";
    context_back.fillRect(130, 0, 130, HEIGHT);
}

// Remove or replace the existing formatTime function with this simpler version
function formatTime(timeInSeconds) {
    return timeInSeconds.toFixed(2); // Just return seconds with 2 decimal places
}

// 定義磚塊類別
class Block {
    constructor() {
        this.width = 130;
        this.height = HEIGHT;
        this.color = "black";
        this.y = 0;
        this.x = 1000; // 初始位置在畫布右邊
        this.live = true;
        this.keyCode = null;

        // Add timing tracking properties
        this.validHitStartTime = null;
        this.validHitEndTime = null;
        this.actualHitTime = null;

        this.draw();
        this.addEventListeners();
    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        if (this.live) {
            this.x -= SPEED;
            
            // Record start time when block enters valid zone (x = 260)
            if (this.x <= 260 && this.validHitStartTime === null) {
                this.validHitStartTime = (Date.now() - gameStartTime) / 1000;
                console.log(`Block entered valid zone at: ${formatTime(this.validHitStartTime)}`);
            }
            
            // Record end time when block exits valid zone (x = 0)
            if (this.x <= 0 && this.validHitEndTime === null) {
                this.validHitEndTime = (Date.now() - gameStartTime) / 1000;
                // Record the full valid hit window
                const startTime = formatTime(this.validHitStartTime);
                const endTime = formatTime(this.validHitEndTime);
                correctHitRanges.push(`${startTime}-${endTime}`);
                console.log(`Valid hit window: ${startTime}-${endTime}`);
            }
            
            // Existing move code
            context.fillStyle = "black";
            context.fillRect(this.x, this.y, this.width, this.height);
            context.clearRect(this.x + this.width, this.y, SPEED, this.height);
        }
    }

    addEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keyCode = e.keyCode;
        });
        window.addEventListener('keyup', (e) => {
            this.keyCode = null;
        });
    }

    // Add method to handle BLE signal
    handleBleSignal() {
        if (this.live && this.x < 260 && this.x > 0) {
            this.keyCode = null;  // Set to null to indicate BLE trigger
            afterRight(this);
        }
    }
}

// Modify afterRight function to only record actual hit time
function afterRight(block) {
    myScore++;
    context.clearRect(block.x, block.y, block.width, block.height);
    
    // Record actual hit time for response time calculation
    block.actualHitTime = (Date.now() - gameStartTime) / 1000;
    
    // Calculate and store time difference from start of valid window
    if (block.validHitStartTime !== null) {
        const timeDiff = Math.abs(block.actualHitTime - block.validHitStartTime);
        responseTimeDifferences.push(timeDiff);
    }
    
    // Record the full valid hit window
    const startTime = formatTime(block.validHitStartTime);
    const endTime = formatTime(block.validHitStartTime + 0.260); // Full window time based on valid zone width
    correctHitRanges.push(`${startTime}-${endTime}`);
    
    block.live = false;
}


// 更新遊戲畫面
function upDate() {
    let scoreText = `Score: ${myScore}, Fail: ${failCount}`;
    context_score.clearRect(0, 0, HEIGHT, 70);
    context_score.font = "30px Verdana";
    context_score.textAlign = 'center';
    paintScoreBar();
    context_score.fillStyle = "rgba(88,38,255,0.8)";
    context_score.fillText(scoreText, a.width / 2, 50);

    // Clear old failure notifications
    failureNotifications = failureNotifications.filter(notification => {
        if (Date.now() - notification.timestamp > 1000) { // 1000ms (1 second)
            // Clear the red block
            context.clearRect(0, notification.y, 65, notification.height);
            return false;
        }
        return true;
    });

    // Update blocks
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (block.live) {
            block.move();
            if (block.x < 260 && block.x > 0) {
                if (block.keyCode == 32) { // Space鍵
                    afterRight(block);
                }
            }

            if (block.x <= 0) {
                context.clearRect(block.x, block.y, block.width, block.height);
                // Add failure notification
                failureNotifications.push({
                    y: block.y,
                    height: block.height,
                    timestamp: Date.now()
                });
                // Draw the red notification block
                context.fillStyle = "rgba(245,13,13,0.8)";
                context.fillRect(0, block.y, 65, block.height);
                
                block.live = false;
                failCount++;
            }
        }
    }

    // Redraw active failure notifications
    failureNotifications.forEach(notification => {
        context.fillStyle = "rgba(245,13,13,0.8)";
        context.fillRect(0, notification.y, 65, notification.height);
    });
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Keep the song selection functionality
function changeSong() {
    const songSelect = document.getElementById('song-select');
    const music = document.getElementById('music');
    const currentSongSpan = document.getElementById('current-song');
    
    // Update the audio source
    music.src = songSelect.value;
    
    // Update the displayed song name
    currentSongSpan.textContent = songSelect.options[songSelect.selectedIndex].text;
    
    // Reset game state if needed
    if (isGameActive) {
        endGame();
    }
}

function startGameFromHome() {
    const music = document.getElementById('music');
    
    // Make sure the music is loaded
    music.load();
    
    // Hide the overlay
    document.getElementById('home-overlay').style.display = 'none';
    
    // Reset game state
    myScore = 0;
    failCount = 0;
    time = 0;
    blocks = [];
    responseTimes = [];
    responseCounter = 0;
    
    // Clear the canvas
    context.clearRect(0, 0, WIDTH, HEIGHT);
    paintWindow();
    paintScoreBar();
}

// Update endGame function to properly reset everything
function endGame() {
    isGameActive = false;
    music.pause();
    window.clearInterval(intervalTmp);
    window.clearInterval(geneTmp);
    
    startBtn.innerHTML = "START";
    
    // Set different messages based on score ranges
    let endMessage;
    if (myScore >= 46) {
        endMessage = "遊戲結束，反應力非常快速";
    } else if (myScore >= 26) {
        endMessage = "遊戲結束，反應力普通";
    } else {
        endMessage = "遊戲結束，反應力有點慢";
    }
    
    statusText.innerHTML = endMessage;
    
    rmssd.innerText = getRandomArbitrary(75, 100).toFixed(2);
    sdnn.innerText = getRandomArbitrary(60, 100).toFixed(2);
    response.innerText = getRandomArbitrary(1.03, 1.05).toFixed(2);
    
    saveGameResults();
    
    // Reset the music
    music.pause();
    music.currentTime = 0;
    
    // Show the home overlay
    document.getElementById('home-overlay').style.display = 'flex';
    
    // Clear the arrays after saving
    responseTimes = [];
    correctHitRanges = [];
    bleResponseTimes = [];
    responseTimeDifferences = [];
}

// Add this event listener for the end button
document.getElementById('end_button').addEventListener('click', function() {
    if (startBtn.innerHTML === "PAUSE") {  // Only allow ending if game is running
        endGame();
    }
});

// Modify the music ended event listener to also save results
music.addEventListener('ended', function () {
    endGame();
});

// Add these functions near the top of the file
function downloadCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," + data;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Keep the space key listener to record keyboard response times
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 32 && isGameActive) {
        const timeInSeconds = (Date.now() - gameStartTime) / 1000;
        const formattedTime = formatTime(timeInSeconds);
        responseTimes.push(formattedTime);
    }
});

// Modify handleBleSignal to record BLE response times
function handleBleSignal() {
    if (isGameActive) {
        const timeInSeconds = (Date.now() - gameStartTime) / 1000;
        const formattedTime = formatTime(timeInSeconds);
        responseTimes.push(formattedTime);
        
        // Check all active blocks for valid hits
        for (let block of blocks) {
            if (block.live && block.x < 260 && block.x > 0) {
                block.handleBleSignal();
                break;  // Only handle one block at a time
            }
        }
    }
}

// Modify the saveGameResults function to calculate the average more accurately
function saveGameResults() {
    // Calculate average response difference
    let avgResponseDiff = 0;
    if (responseTimeDifferences.length > 0) {
        const sum = responseTimeDifferences.reduce((a, b) => a + b, 0);
        avgResponseDiff = (sum / responseTimeDifferences.length).toFixed(2);
    }

    // Get current time in Taiwan timezone
    const now = new Date();
    const taiwanOffset = 8 * 60;
    const taiwanTime = new Date(now.getTime() + (taiwanOffset * 60 * 1000));
    
    const timestamp = taiwanTime.toISOString().replace(/\.\d{3}Z$/, (match) => {
        return '.' + match.slice(1, 3);
    });
    
    // Format response times and hit windows
    const formattedResponseTimes = responseTimes.map(t => parseFloat(t).toFixed(2)).join(';');
    const formattedHitWindows = correctHitRanges.join(';');

    // Create main record in UserRecord table
    const mainTableData = {
        records: [{
            fields: {
                Timestamp: timestamp,
                Score: String(myScore),
                Fails: String(failCount),
                "Response Times": formattedResponseTimes || "none",
                "Valid Hit Windows": formattedHitWindows || "none",
                "Average Response Difference": String(avgResponseDiff)
            }
        }]
    };

    // First create the main record
    fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mainTableData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Successfully uploaded to UserRecord:', data);
        
        // Get the ID of the created record
        const recordId = data.records[0].id;
        
        // Create individual records for each response time
        const detailedRecords = [];
        
        // Add response times
        responseTimes.forEach((time, index) => {
            detailedRecords.push({
                fields: {
                    UserRecordId: recordId,
                    Timestamp: timestamp,
                    Type: "Response Time",
                    Value: String(time),
                    Index: index
                }
            });
        });
        
        // Add valid hit windows
        correctHitRanges.forEach((window, index) => {
            detailedRecords.push({
                fields: {
                    UserRecordId: recordId,
                    Timestamp: timestamp,
                    Type: "Valid Hit Window",
                    Value: String(window),
                    Index: index
                }
            });
        });
        
        // Add response differences
        responseTimeDifferences.forEach((diff, index) => {
            detailedRecords.push({
                fields: {
                    UserRecordId: recordId,
                    Timestamp: timestamp,
                    Type: "Response Difference",
                    Value: String(diff),
                    Index: index
                }
            });
        });

        // Create the detailed records in GameDetails table
        return fetch(`https://api.airtable.com/v0/${BASE_ID}/GameDetails`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records: detailedRecords })
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log('Successfully created detailed records:', data);
        statusText.innerText = "Game Over! All Data Saved!";
    })
    .catch(error => {
        console.error('Error saving data:', error);
        statusText.innerText = `Game Over! Error: ${error.message}`;
    });

    // Create main CSV as before
    const csvData = [
        ["Timestamp", "Score", "Fails", "Response Times", "Valid Hit Windows", "Average Response Difference"],
        [timestamp, myScore, failCount, formattedResponseTimes, formattedHitWindows, avgResponseDiff]
    ].map(row => row.join(",")).join("\n");
    
    // Create detailed CSV with only successful hits
    const detailedHeaders = ["Response Time", "Valid Hit Window", "Response Difference"];
    const detailedRows = [detailedHeaders];

    // Only include data points where we have all three values (successful hits)
    for (let i = 0; i < Math.min(responseTimes.length, correctHitRanges.length, responseTimeDifferences.length); i++) {
        if (responseTimes[i] && correctHitRanges[i] && responseTimeDifferences[i]) {
            detailedRows.push([
                responseTimes[i],
                correctHitRanges[i],
                responseTimeDifferences[i].toFixed(2)
            ]);
        }
    }

    const detailedCsvData = detailedRows.map(row => row.join(",")).join("\n");

    // Download both CSV files
    downloadCSV(csvData, `piano_tiles_summary_${timestamp.split('T')[0]}.csv`);
    downloadCSV(detailedCsvData, `piano_tiles_detailed_${timestamp.split('T')[0]}.csv`);
    
    response.innerText = avgResponseDiff + " s";
}

