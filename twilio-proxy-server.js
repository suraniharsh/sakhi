const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for your frontend domain
app.use(cors({
  origin: 'http://localhost:3000' // Your frontend URL
}));

// Parse JSON request bodies
app.use(express.json());

// Endpoint to send SMS
app.post('/api/send-sms', async (req, res) => {
  try {
    const { accountSid, authToken, from, to, body } = req.body;
    
    if (!accountSid || !authToken || !from || !to || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }
    
    // Create a Twilio client with the provided credentials
    const client = twilio(accountSid, authToken);
    
    // Send the SMS
    const message = await client.messages.create({
      body,
      from,
      to
    });
    
    // Return success response
    res.json({ 
      success: true, 
      messageSid: message.sid,
      status: message.status
    });
    
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Return error response
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Twilio proxy server running on port ${port}`);
}); 