# Setting Up Twilio for SMS Alerts in Sakhi App

This guide will help you set up Twilio for SMS alerts in the Sakhi app.

## Demo Mode Information

**This is a demonstration version of the emergency alert system.** In this demo, SMS messages are simulated rather than actually sent to recipients. This allows you to test the functionality without incurring SMS charges or dealing with complex server setups.

In a production environment, you would need to implement a secure backend service to handle the actual sending of SMS messages through Twilio.

## Using Twilio API Keys (Recommended)

For better security, we recommend using Twilio API Keys instead of your main Account SID and Auth Token. API Keys provide more granular access control and can be revoked without affecting your main account credentials.

### How to Create a Twilio API Key

1. Log in to your Twilio account
2. Navigate to the [Twilio Console](https://www.twilio.com/console)
3. Go to Settings → API Keys
4. Click "Create API Key"
5. Give your API Key a name (e.g., "Sakhi SMS API Key")
6. Choose "Standard" for the Key Type
7. Click "Create API Key"
8. **Important**: Make sure to copy both the API Key SID (starts with "SK") and the API Secret. The API Secret will only be shown once!

## Configuring Twilio Credentials

You'll need the following Twilio credentials:

1. **Account SID**: Your main Twilio account identifier
2. **API Key**: The API Key SID you created (starts with "SK")
3. **API Secret**: The secret associated with your API Key
4. **Phone Number**: Your Twilio phone number capable of sending SMS

### Option 1: In-App Configuration

You can configure Twilio credentials directly in the app:

1. Go to the Safety Resources page
2. Click on the "Settings" tab
3. Scroll down to the "Twilio SMS Configuration" section
4. Enter your Twilio credentials (Account SID, API Key, API Secret, and Phone Number)
5. Click "Save Twilio Credentials"
6. Refresh the page

### Option 2: Environment Variables

Add the following variables to your `.env` file:

```
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_API_KEY=your_api_key_here
VITE_TWILIO_API_SECRET=your_api_secret_here
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

Make sure to replace the placeholder values with your actual Twilio credentials.

## Important Notes About SMS

- **Phone Number Format**: Phone numbers should be in E.164 format (e.g., +91XXXXXXXXXX for India). If you enter a number without the country code, +91 will be added automatically.
- **Simulation**: In this demo version, SMS messages are simulated with alerts and console logs.
- **Free Trial Limitations**: If you're using a Twilio trial account, you can only send SMS to verified phone numbers. Make sure to verify all recipient numbers in your Twilio console.
- **Costs**: Sending SMS messages with Twilio is not free. Check [Twilio's pricing page](https://www.twilio.com/sms/pricing) for current rates.
- **Message Delivery**: SMS delivery is not guaranteed and depends on recipient's carrier, phone status, etc.

## Implementing a Production Solution

For a production environment, you would need to:

1. Create a backend API endpoint (using Node.js, Express, etc.)
2. Store your Twilio credentials securely on the server
3. Make the API call to Twilio from your server
4. Call your backend API from the frontend

Example backend code (Node.js/Express):

```javascript
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(express.json());

// Twilio credentials stored securely on the server
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Create a Twilio client using API Key authentication
const client = twilio(apiKey, apiSecret, { accountSid });

// API endpoint to send SMS
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to
    });
    
    res.json({ success: true, messageSid: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

## Security Considerations

- API Keys are more secure than using your main Auth Token
- Never expose your Twilio credentials in client-side code in a production environment
- For production use, implement a secure backend service to handle SMS sending

## Important Note About Browser Limitations

**Due to browser security restrictions (CORS), direct API calls to Twilio from the browser are not possible.** To solve this, we've provided a simple proxy server that allows you to send real SMS messages during development.

## Running the Proxy Server

To send real SMS messages, you need to run the proxy server:

1. Open a new terminal window
2. Navigate to your project directory
3. Install the required dependencies:
   ```
   npm install express cors twilio
   ```
4. Start the proxy server:
   ```
   node twilio-proxy-server.js
   ```
5. Keep this terminal window open while testing SMS functionality

The proxy server will run on port 3001 and will handle SMS sending on behalf of your frontend application.

## Prerequisites

1. A Twilio account - [Sign up here](https://www.twilio.com/try-twilio)
2. A Twilio phone number capable of sending SMS

## Steps to Configure Twilio

### 1. Get Your Twilio Credentials

1. Log in to your Twilio account
2. Navigate to the [Twilio Console Dashboard](https://www.twilio.com/console)
3. Find your Account SID and Auth Token (you may need to reveal the Auth Token)
4. Note down your Twilio phone number (or purchase one if you don't have one yet)

### 2. Add Credentials to Environment Variables

#### Option 1: Using the Setup Script (Recommended)

We've provided a setup script to make this process easier:

1. Open a terminal in the project root directory
2. Run the setup script using npm:
   ```
   npm run setup-twilio
   ```
   Or directly with Node:
   ```
   node setup-twilio.js
   ```
3. Follow the prompts to enter your Twilio credentials
4. Restart your development server for the changes to take effect

#### Option 2: Manual Setup

Add the following variables to your `.env` file:

```
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_API_KEY=your_api_key_here
VITE_TWILIO_API_SECRET=your_api_secret_here
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

Make sure to replace the placeholder values with your actual Twilio credentials.

#### Option 3: In-App Configuration

You can also configure Twilio credentials directly in the app:

1. Go to the Safety Resources page
2. Click on the "Settings" tab
3. Scroll down to the "Twilio SMS Configuration" section
4. Enter your Twilio credentials
5. Click "Save Twilio Credentials"
6. Refresh the page

### 3. Important Notes About Twilio

- **Free Trial Limitations**: If you're using a Twilio trial account, you can only send SMS to verified phone numbers. Make sure to verify all recipient numbers in your Twilio console.
- **Phone Number Format**: Phone numbers should be in E.164 format (e.g., +91XXXXXXXXXX for India). If you enter a number without the country code, +91 will be added automatically.
- **Costs**: Sending SMS messages with Twilio is not free. Check [Twilio's pricing page](https://www.twilio.com/sms/pricing) for current rates.
- **Message Delivery**: SMS delivery is not guaranteed and depends on recipient's carrier, phone status, etc.

### 4. Testing Your Setup

1. Make sure the proxy server is running (`node twilio-proxy-server.js`)
2. Add an emergency contact with a verified phone number
3. Send a test alert
4. Check the browser console and proxy server terminal for any error messages
5. Verify that the recipient received the SMS

### 5. Troubleshooting

If SMS messages are not being delivered:

1. Check that your Twilio credentials are correct
2. Ensure the recipient's phone number is in the correct format (+91XXXXXXXXXX for India)
3. If using a trial account, verify that the recipient's number is verified in Twilio
4. Check the browser console and proxy server terminal for error messages
5. Make sure your Twilio account has sufficient funds
6. Verify that the proxy server is running and doesn't show any errors

## Security Considerations

- API Keys are more secure than using your main Auth Token
- Never expose your Twilio credentials in client-side code in a production environment
- The proxy server is for development purposes only
- For production use, implement a more secure backend service

## Next Steps for Production

For a production environment, it's recommended to:

1. Move the Twilio API calls to a secure backend service
2. Implement rate limiting to prevent abuse
3. Add additional authentication for emergency alert sending
4. Consider implementing delivery receipts and status callbacks

## Implementing a Backend Service

To properly send SMS messages in a production environment, you would need to:

1. Create a backend API endpoint (using Node.js, Express, etc.)
2. Store your Twilio credentials securely on the server
3. Make the API call to Twilio from your server
4. Call your backend API from the frontend

Example backend code (Node.js/Express):

```javascript
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(express.json());

// Twilio credentials stored securely on the server
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Create a Twilio client using API Key authentication
const client = twilio(apiKey, apiSecret, { accountSid });

// API endpoint to send SMS
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    const message = await client.messages.create({
      body,
      from: twilioNumber,
      to
    });
    
    res.json({ success: true, messageSid: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
``` 