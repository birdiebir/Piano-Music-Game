📄 README: Connecting to Airtable Database 📄
To successfully connect your application to an Airtable database, follow these steps:

🛠️ 1. Create an Airtable Base
You need to create an Airtable base with a table containing the following fields:

Field Name Field Type
Timestamp Single line text
Score Single line text
Fails Single line text
Response Times Single line text
Valid Hit Windows Single line text
Average Response Difference Single line text
Heart Rate Single line text
🔑 2. Configure Your API Key and Table Information
Locate the following constants in your JavaScript file:

const AIRTABLE_API_KEY = 'YOUR_API_KEY';
const BASE_ID = 'YOUR_BASE_ID';
const TABLE_NAME = 'YOUR_TABLE_NAME';
Replace them with your actual Airtable API key, Base ID, and Table Name.

🚀 How to Get Your Airtable API Key, Base ID, and Table Name
API Key:

Go to Airtable Account Settings
Find API Key and copy it.
Base ID:

Open your Airtable base
Click Help > API Documentation
Find your Base ID (format: appXXXXXXXXXXXXXX)
Table Name:

Use the exact name of your table inside your Airtable base.
📡 3. Sending Data to Airtable
The game will automatically send data to Airtable at the end of each session. The data includes:

Score
Fail count
Response times
Valid hit windows
Average response differences
If the data does not appear in Airtable, check your API Key, Base ID, and Table Name for errors.
