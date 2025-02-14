/*********************************************************************
 * @file    reaction_record.ino
 * @brief   反應時間測試
 * @note    TODO: 1. button debounce
 *                2. remove delay
 *********************************************************************/

#include <FastLED.h>
#include "ble.h"
#include "max3010x.h"
#include <BleKeyboard.h>

#define NUM_LEDS 1
#define DATA_PIN 21

#define NUM_REACTIONS 10  // 定義10次數據的數量
#define REPORTING_PERIOD_MS 1000

BleKeyboard bleKeyboard;

CRGB leds[NUM_LEDS];

const int buttonPin = 2;  // 按鈕引腳

bool gameStarted = false;                   // 遊戲是否已經開始
bool timing = false;                        // 是否正在計時
unsigned long startTime;                    // 開始時間
unsigned long reactionTime[NUM_REACTIONS];  // 反應時間陣列
int count = 0;                              // 反應時間計數

uint32_t tsLastReport = 0;

extern BLECharacteristic *pReactionCh;
extern BLECharacteristic *pMax3010xCh;
extern BLECharacteristic *pStartgameCh;

extern PulseOximeter pox;

void setup() {
  Serial.begin(115200);
  Serial.println("Starting BLE work!");

  Serial.println("[INFO] Initializing BLE work!");
  setupBLE();
  Serial.println("[INFO] BLE work!");

  Serial.println("[INFO] Initializing PulseOximeter.");
  setupMax3010x();
  Serial.println("[INFO] PulseOximeter success.");

  pinMode(buttonPin, INPUT);
  bleKeyboard.begin();
}

void loop() {
  pox.update();

  // run every REPORTING_PERIOD_MS
  if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
    // send heart rate and SpO2 data by BLE
    int max3010xData[2];
    getMax3010x(max3010xData);

    int data = (max3010xData[1] << 16) + max3010xData[0];

    Serial.print("Heart rate:");
    Serial.print(max3010xData[0]);
    Serial.print("bpm / SpO2:");
    Serial.print(max3010xData[1]);

    pMax3010xCh->setValue((uint8_t *)&data, 4);
    pMax3010xCh->notify();

    tsLastReport = millis();
  }

  if (!bleKeyboard.isConnected()) {
    return;
  }

  int buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {
    bleKeyboard.print(" ");
  } else {
    // do nothing
  }
}
