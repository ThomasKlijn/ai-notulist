// Simple test to check if audio chunks can be found
const fs = require('fs');
const path = require('path');

const meetingId = 'dd0b57a8-29ba-4c28-9e52-ded21d6347d0';
const chunkKey = `${meetingId}-chunk-0`;

console.log('Testing audio chunk access...');
console.log('Looking for chunk:', chunkKey);

// Check if file exists directly
const filePath = path.join('/tmp', 'audio-chunks', `${chunkKey}.webm`);
console.log('File path:', filePath);
console.log('File exists:', fs.existsSync(filePath));

if (fs.existsSync(filePath)) {
  const stats = fs.statSync(filePath);
  console.log('File size:', stats.size, 'bytes');
  
  // Try to read the file
  try {
    const buffer = fs.readFileSync(filePath);
    console.log('✅ Successfully read audio chunk, size:', buffer.length, 'bytes');
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
} else {
  console.error('❌ File does not exist at:', filePath);
}