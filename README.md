# 🎹 Piano Tiles Game - Airtable Integration 🎹  

## 📖 Overview  
This project integrates a **Piano Tiles Game** with an **Airtable database** to store game performance metrics such as score, response times, and hit accuracy.  

This README provides **step-by-step instructions** to set up **Airtable** and connect it to the game.

---

## 📌 Table of Contents  
- [📖 Overview](#-overview)  
- [🛠️ Prerequisites](#️-prerequisites)  
- [⚙️ Setting Up Airtable](#️-setting-up-airtable)  
- [🔑 Configuring API Keys](#-configuring-api-keys)  
- [📡 How Data is Stored](#-how-data-is-stored)  
- [❗ Troubleshooting](#-troubleshooting)  
- [🎮 Play the Game](#-play-the-game)  

---

## 🛠️ Prerequisites  
Before setting up Airtable, ensure you have:  
✔️ An **Airtable account** (sign up at [airtable.com](https://airtable.com/))  
✔️ An **API Key** from your Airtable account  
✔️ The **Base ID** and **Table Name** where the data will be stored  

---

## ⚙️ Setting Up Airtable  
1. **Create a new Base** in Airtable  
2. **Create a Table** inside the base with the following fields:  

| Field Name | Field Type |
|------------|-----------|
| Timestamp | Single line text |
| Score | Single line text |
| Fails | Single line text |
| Response Times | Single line text |
| Valid Hit Windows | Single line text |
| Average Response Difference | Single line text |
| Heart Rate | Single line text |

> **⚠️ Important:** Ensure the field names match exactly as listed above to avoid issues with data submission.

---

## 🔑 Configuring API Keys  
Locate the following lines in your **JavaScript file**:

```javascript
const AIRTABLE_API_KEY = 'YOUR_API_KEY';
const BASE_ID = 'YOUR_BASE_ID';
const TABLE_NAME = 'YOUR_TABLE_NAME';
```

Replace them with your actual **Airtable API Key**, **Base ID**, and **Table Name**.

### 📌 Where to Find These Values?  
1. **API Key**  
   - Go to [Airtable Account Settings](https://airtable.com/account)  
   - Find **API Key** and copy it.  

2. **Base ID**  
   - Open your Airtable base  
   - Click **Help > API Documentation**  
   - Find your **Base ID** (Format: `appXXXXXXXXXXXXXX`)  

3. **Table Name**  
   - Use the exact name of your **table** inside your Airtable base.  

---

## 📡 How Data is Stored  
At the **end of each game session**, the following data is sent to Airtable:  

✔️ **Timestamp** – The exact time the game ended.  
✔️ **Score** – The total score achieved in the game.  
✔️ **Fails** – The number of missed tiles.  
✔️ **Response Times** – A list of response times recorded.  
✔️ **Valid Hit Windows** – Time ranges for valid hits.  
✔️ **Average Response Difference** – Average deviation from the ideal hit time.  
✔️ **Heart Rate** – (If applicable) Player’s heart rate during gameplay.  

The data is stored in **two tables**:  
- **UserRecord Table** (Stores overall game session data)  
- **GameDetails Table** (Stores individual response times for deeper analysis)  

---

## ❗ Troubleshooting  

### ❌ Data is not saving in Airtable?  
✔️ Ensure your **Airtable API Key** is correct.  
✔️ Double-check the **Base ID** and **Table Name**.  
✔️ Confirm that **field names** match exactly as specified.  

### ❌ CORS Errors?  
If your browser blocks the request, consider using a **backend server** as a proxy to handle Airtable API requests.  

### ❌ Still Having Issues?  
1. Open the **browser console** (`F12 > Console`).  
2. Look for any **Airtable API request errors**.  
3. If needed, check **Airtable API logs** for blocked requests.  

---

## 🎮 Play the Game  
Now that Airtable is set up, you’re ready to **start the game**! 🚀  

Enjoy tracking your **performance metrics** in real-time with Airtable!  

---
