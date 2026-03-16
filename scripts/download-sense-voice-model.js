#!/usr/bin/env node

/**
 * SenseVoice Model Download Script
 *
 * Downloads the SenseVoiceSmall INT8 model for Sherpa-ONNX
 * from GitHub releases.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MODEL_NAME = 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09';
const GITHUB_RELEASE_URL = `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/${MODEL_NAME}.tar.bz2`;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'models', 'sense-voice');

console.log('='.repeat(60));
console.log('SenseVoice Model Download Script');
console.log('='.repeat(60));
console.log(`Model: ${MODEL_NAME}`);
console.log(`Output Directory: ${OUTPUT_DIR}`);
console.log('');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✓ Created output directory');
}

// Check if curl or wget is available
let downloadCommand;
try {
  execSync('curl --version', { stdio: 'ignore' });
  downloadCommand = 'curl';
} catch {
  try {
    execSync('wget --version', { stdio: 'ignore' });
    downloadCommand = 'wget';
  } catch {
    console.error('❌ Error: Neither curl nor wget is available.');
    console.error('Please install curl or wget to download the model.');
    process.exit(1);
  }
}

console.log(`✓ Found ${downloadCommand}`);

// Download and extract the model
console.log('');
console.log('Downloading model...');
console.log(`URL: ${GITHUB_RELEASE_URL}`);
console.log('');

const tempArchive = path.join(OUTPUT_DIR, `${MODEL_NAME}.tar.bz2`);

try {
  if (downloadCommand === 'curl') {
    execSync(
      `curl -L -o "${tempArchive}" "${GITHUB_RELEASE_URL}"`,
      { stdio: 'inherit' }
    );
  } else {
    execSync(
      `wget -O "${tempArchive}" "${GITHUB_RELEASE_URL}"`,
      { stdio: 'inherit' }
    );
  }

  console.log('');
  console.log('✓ Download completed');
  console.log('');
  console.log('Extracting archive...');

  // Extract the archive
  execSync(`cd "${OUTPUT_DIR}" && tar -xjf "${tempArchive}"`, {
    stdio: 'inherit',
  });

  // Remove the archive
  fs.unlinkSync(tempArchive);

  console.log('');
  console.log('✓ Extraction completed');
  console.log('');

  // List downloaded files
  console.log('Downloaded files:');
  const listDir = (dir, prefix = '') => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        console.log(`${prefix}${file}/`);
        listDir(filePath, prefix + '  ');
      } else {
        const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
        console.log(`${prefix}${file} (${sizeMB} MB)`);
      }
    });
  };

  listDir(OUTPUT_DIR);

  console.log('');
  console.log('='.repeat(60));
  console.log('✓ Model download completed successfully!');
  console.log('='.repeat(60));
} catch (error) {
  console.error('');
  console.error('❌ Error during download/extraction:', error.message);
  console.error('');
  console.error('You can download manually:');
  console.error(`1. Visit: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models`);
  console.error(`2. Download: ${MODEL_NAME}.tar.bz2`);
  console.error(`3. Extract to: ${OUTPUT_DIR}`);
  process.exit(1);
}
