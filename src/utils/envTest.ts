/**
 * Utility to test if environment variables are loaded correctly
 */

export const logEnvironmentVariables = () => {
  console.log('=== Environment Variables Test ===');
  console.log('VITE_TWILIO_ACCOUNT_SID:', import.meta.env.VITE_TWILIO_ACCOUNT_SID || '(not set)');
  console.log('VITE_TWILIO_AUTH_TOKEN:', import.meta.env.VITE_TWILIO_AUTH_TOKEN ? '(exists)' : '(not set)');
  console.log('VITE_TWILIO_PHONE_NUMBER:', import.meta.env.VITE_TWILIO_PHONE_NUMBER || '(not set)');
  
  // Check if the variables are defined but empty
  console.log('VITE_TWILIO_ACCOUNT_SID is empty string:', import.meta.env.VITE_TWILIO_ACCOUNT_SID === '');
  console.log('VITE_TWILIO_AUTH_TOKEN is empty string:', import.meta.env.VITE_TWILIO_AUTH_TOKEN === '');
  console.log('VITE_TWILIO_PHONE_NUMBER is empty string:', import.meta.env.VITE_TWILIO_PHONE_NUMBER === '');
  
  // Check if the variables are defined at all
  console.log('VITE_TWILIO_ACCOUNT_SID is defined:', 'VITE_TWILIO_ACCOUNT_SID' in import.meta.env);
  console.log('VITE_TWILIO_AUTH_TOKEN is defined:', 'VITE_TWILIO_AUTH_TOKEN' in import.meta.env);
  console.log('VITE_TWILIO_PHONE_NUMBER is defined:', 'VITE_TWILIO_PHONE_NUMBER' in import.meta.env);
  
  console.log('=== End Environment Variables Test ===');
}; 