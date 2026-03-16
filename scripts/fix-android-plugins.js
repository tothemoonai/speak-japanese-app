const fs = require('fs');
const path = require('path');

// Fix capacitor.plugins.json after sync
const pluginsJsonPath = path.join(__dirname, '../android/app/src/main/assets/capacitor.plugins.json');

const correctConfig = {
  plugins: {
    LocalASR: {
      pkg: 'com.speakjapanese.app.plugins',
      classpath: 'com.speakjapanese.app.plugins.LocalASRPlugin'
    }
  }
};

// Write the correct configuration
fs.writeFileSync(pluginsJsonPath, JSON.stringify(correctConfig, null, 2));

console.log('✅ Fixed capacitor.plugins.json');
console.log('📄 Path:', pluginsJsonPath);
