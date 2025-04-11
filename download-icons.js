const https = require('https');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconColor = '4CAF50'; // Green color for the plant theme
const iconDirectory = path.join(__dirname, 'src', 'assets', 'icons');

// Ensure the directory exists
if (!fs.existsSync(iconDirectory)) {
  fs.mkdirSync(iconDirectory, { recursive: true });
}

// Download icons for each size
iconSizes.forEach(size => {
  const iconUrl = `https://via.placeholder.com/${size}x${size}/${iconColor}/FFFFFF?text=PD`;
  const filePath = path.join(iconDirectory, `icon-${size}x${size}.png`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(iconUrl, response => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded icon: ${size}x${size}`);
    });
  }).on('error', err => {
    file.close();
    fs.unlink(filePath, () => {
      console.error(`Error downloading icon ${size}x${size}:`, err.message);
    });
  });
});
