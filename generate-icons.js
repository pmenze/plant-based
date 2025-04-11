const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDirectory = path.join(__dirname, 'src', 'assets', 'icons');

// Ensure the directory exists
if (!fs.existsSync(iconDirectory)) {
  fs.mkdirSync(iconDirectory, { recursive: true });
}

// Create a leaf SVG icon for each size
iconSizes.forEach(size => {
  const filePath = path.join(iconDirectory, `icon-${size}x${size}.svg`);
  
  // Calculate dimensions for the leaf
  const padding = size * 0.1;
  const leafWidth = size - (padding * 2);
  const leafHeight = leafWidth * 1.2;
  
  // Create an SVG with a leaf icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <!-- Background circle -->
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#4CAF50" />
    
    <!-- Leaf shape -->
    <path d="
      M ${size/2} ${padding}
      C ${size*0.8} ${size*0.2}, ${size*0.9} ${size*0.6}, ${size/2} ${size*0.9}
      C ${size*0.1} ${size*0.6}, ${size*0.2} ${size*0.2}, ${size/2} ${padding}
      Z
    " fill="#FFFFFF" opacity="0.9" />
    
    <!-- Leaf vein -->
    <path d="
      M ${size/2} ${padding}
      L ${size/2} ${size*0.9}
    " stroke="#4CAF50" stroke-width="${size/40}" stroke-linecap="round" />
    
    <!-- Side veins -->
    <path d="
      M ${size/2} ${size*0.3}
      L ${size*0.65} ${size*0.35}
      
      M ${size/2} ${size*0.45}
      L ${size*0.7} ${size*0.5}
      
      M ${size/2} ${size*0.6}
      L ${size*0.65} ${size*0.65}
      
      M ${size/2} ${size*0.3}
      L ${size*0.35} ${size*0.35}
      
      M ${size/2} ${size*0.45}
      L ${size*0.3} ${size*0.5}
      
      M ${size/2} ${size*0.6}
      L ${size*0.35} ${size*0.65}
    " stroke="#4CAF50" stroke-width="${size/80}" stroke-linecap="round" />
  </svg>`;
  
  // Write the SVG to a file
  fs.writeFileSync(filePath.replace('.png', '.svg'), svg);
  
  console.log(`Created icon: ${size}x${size}`);
});
