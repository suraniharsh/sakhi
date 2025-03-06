# Twilio Proxy Server for Sakhi App

This is a simple proxy server that allows the Sakhi app to send SMS messages through Twilio without running into CORS issues.

## Why is this needed?

Due to browser security restrictions (CORS), web applications cannot make direct authenticated API calls to Twilio from the browser. This proxy server acts as a middleman, allowing your frontend to send SMS messages by proxying the requests to Twilio.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install express cors twilio
```

### 2. Start the Server

```bash
node twilio-proxy-server.js
```

The server will run on port 3001 by default. You can change this by setting the `PORT` environment variable.

### 3. Keep the Server Running

While testing SMS functionality in the Sakhi app, keep this terminal window open. The proxy server needs to be running for SMS messages to be sent.

## How it Works

1. The frontend sends a request to the proxy server with Twilio credentials and message details
2. The proxy server creates a Twilio client with the provided credentials
3. The proxy server sends the SMS message through Twilio
4. The proxy server returns the result to the frontend

## Security Considerations

This proxy server is intended for development and testing purposes only. For a production environment, you should:

1. Implement proper authentication and authorization
2. Store Twilio credentials securely on the server
3. Implement rate limiting to prevent abuse
4. Add logging and monitoring
5. Use HTTPS for all communications

## Troubleshooting

If you encounter issues:

1. Check that the proxy server is running
2. Verify that your Twilio credentials are correct
3. Ensure recipient phone numbers are in E.164 format (e.g., +1XXXXXXXXXX)
4. Check the proxy server terminal for error messages
5. If using a Twilio trial account, verify that recipient numbers are verified in your Twilio console 