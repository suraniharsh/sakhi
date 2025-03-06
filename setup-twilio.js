#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Twilio SMS Setup for Sakhi App ===\n');
console.log('This script will help you set up Twilio credentials for SMS alerts.');
console.log('You can find your Twilio credentials in your Twilio Console Dashboard.');
console.log('Visit: https://www.twilio.com/console\n');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const main = async () => {
  try {
    const accountSid = await askQuestion('Enter your Twilio Account SID: ');
    const authToken = await askQuestion('Enter your Twilio Auth Token: ');
    const phoneNumber = await askQuestion('Enter your Twilio Phone Number (with country code, e.g., +1234567890): ');
    
    if (!accountSid || !authToken || !phoneNumber) {
      console.log('\nError: All fields are required. Please try again.\n');
      return;
    }
    
    // Read existing .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
    } catch (err) {
      console.log('No existing .env file found. Creating a new one.');
    }
    
    // Check if Twilio variables already exist
    const hasTwilioAccountSid = envContent.includes('VITE_TWILIO_ACCOUNT_SID=');
    const hasTwilioAuthToken = envContent.includes('VITE_TWILIO_AUTH_TOKEN=');
    const hasTwilioPhoneNumber = envContent.includes('VITE_TWILIO_PHONE_NUMBER=');
    
    // Prepare new content
    let newContent = envContent;
    
    // Add or update Twilio variables
    if (hasTwilioAccountSid) {
      newContent = newContent.replace(/VITE_TWILIO_ACCOUNT_SID=.*/g, `VITE_TWILIO_ACCOUNT_SID=${accountSid}`);
    } else {
      newContent += `\nVITE_TWILIO_ACCOUNT_SID=${accountSid}`;
    }
    
    if (hasTwilioAuthToken) {
      newContent = newContent.replace(/VITE_TWILIO_AUTH_TOKEN=.*/g, `VITE_TWILIO_AUTH_TOKEN=${authToken}`);
    } else {
      newContent += `\nVITE_TWILIO_AUTH_TOKEN=${authToken}`;
    }
    
    if (hasTwilioPhoneNumber) {
      newContent = newContent.replace(/VITE_TWILIO_PHONE_NUMBER=.*/g, `VITE_TWILIO_PHONE_NUMBER=${phoneNumber}`);
    } else {
      newContent += `\nVITE_TWILIO_PHONE_NUMBER=${phoneNumber}`;
    }
    
    // Write to .env file
    fs.writeFileSync(envPath, newContent);
    
    console.log('\n✅ Twilio credentials have been successfully added to your .env file!');
    console.log('\nImportant notes:');
    console.log('1. If you\'re using a Twilio trial account, you can only send SMS to verified phone numbers.');
    console.log('2. Make sure to restart your development server for the changes to take effect.');
    console.log('3. For security reasons, never commit your .env file to version control.');
    
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
};

main(); 