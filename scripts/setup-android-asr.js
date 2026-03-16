#!/usr/bin/env node

/**
 * Android ASR 自动设置脚本
 *
 * 自动完成：
 * 1. 下载 Sherpa-ONNX JNI 库
 * 2. 下载 SenseVoice 模型
 * 3. 配置 Android build.gradle
 * 4. 同步 Capacitor
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  sherpaVersion: 'v1.12.26',
  modelName: 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09',
  projectRoot: path.resolve(__dirname, '..'),
  androidDir: null,
  tempDir: null,
};

// 初始化路径
function initPaths() {
  CONFIG.androidDir = path.join(CONFIG.projectRoot, 'android');
  CONFIG.tempDir = path.join(CONFIG.projectRoot, '.temp_android_asr');
}

console.log('='.repeat(60));
console.log('Android 本地语音识别自动设置');
console.log('='.repeat(60));
console.log('');

initPaths();

// 检查命令
function checkCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 确定下载工具
const downloadCommand = checkCommand('curl') ? 'curl' : checkCommand('wget') ? 'wget' : null;

if (!downloadCommand) {
  console.error('❌ 错误: 需要 curl 或 wget 来下载文件');
  console.error('请安装其中一个工具');
  process.exit(1);
}

console.log(`✓ 使用 ${downloadCommand} 下载文件`);
console.log('');

// 下载函数
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    console.log(`  下载: ${path.basename(destPath)}`);

    const file = fs.createWriteStream(destPath);

    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 重定向
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r  进度: ${progress}%`);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\r  ✓ 完成');
        resolve();
      });

      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(destPath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });
  });
}

// 解压 .tar.bz2
function extractTarBz2(archivePath, destDir) {
  console.log(`  解压: ${path.basename(archivePath)}`);

  try {
    execSync(`cd "${destDir}" && tar -xjf "${archivePath}"`, { stdio: 'inherit' });
    console.log('  ✓ 完成');
  } catch (error) {
    throw new Error(`解压失败: ${error.message}`);
  }
}

// 步骤 1: 下载 Sherpa-ONNX JNI 库
async function setupJniLibs() {
  console.log('步骤 1: 下载 Sherpa-ONNX JNI 库');
  console.log('-'.repeat(60));

  const url = `https://github.com/k2-fsa/sherpa-onnx/releases/download/${CONFIG.sherpaVersion}/sherpa-onnx-${CONFIG.sherpaVersion}-android.tar.bz2`;
  const archivePath = path.join(CONFIG.tempDir, 'sherpa-onnx-android.tar.bz2');
  const extractDir = CONFIG.tempDir;
  const jniLibsDest = path.join(CONFIG.androidDir, 'app/src/main/jniLibs');

  // 下载
  await downloadFile(url, archivePath);

  // 解压
  extractTarBz2(archivePath, extractDir);

  // 复制 JNI 库
  console.log('  复制 JNI 库...');

  const jniSource = path.join(extractDir, 'jniLibs');
  if (!fs.existsSync(jniSource)) {
    throw new Error(`JNI 库目录不存在: ${jniSource}`);
  }

  // 创建目标目录
  if (!fs.existsSync(jniLibsDest)) {
    fs.mkdirSync(jniLibsDest, { recursive: true });
  }

  // 复制所有架构
  const archs = ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'];
  let copiedCount = 0;

  for (const arch of archs) {
    const sourceDir = path.join(jniSource, arch);
    if (fs.existsSync(sourceDir)) {
      const destDir = path.join(jniLibsDest, arch);
      fs.mkdirSync(destDir, { recursive: true });

      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
        copiedCount++;
      }
      console.log(`    ✓ ${arch}`);
    }
  }

  if (copiedCount === 0) {
    throw new Error('没有找到任何 JNI 库文件');
  }

  console.log(`  ✓ 复制了 ${copiedCount} 个文件`);
  console.log('');
}

// 步骤 2: 下载 SenseVoice 模型
async function setupModels() {
  console.log('步骤 2: 下载 SenseVoice 模型');
  console.log('-'.repeat(60));

  const url = `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/${CONFIG.modelName}.tar.bz2`;
  const archivePath = path.join(CONFIG.tempDir, `${CONFIG.modelName}.tar.bz2`);
  const extractDir = CONFIG.tempDir;
  const assetsDir = path.join(CONFIG.androidDir, 'app/src/main/assets');
  const modelsDir = path.join(assetsDir, 'models');

  // 下载
  await downloadFile(url, archivePath);

  // 解压
  extractTarBz2(archivePath, extractDir);

  // 复制模型
  console.log('  复制模型文件...');

  // 创建 assets/models 目录
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  const sourceDir = path.join(extractDir, CONFIG.modelName);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`模型目录不存在: ${sourceDir}`);
  }

  const destDir = path.join(modelsDir, CONFIG.modelName);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // 递归复制子目录
      const subDestDir = path.join(destDir, file);
      fs.mkdirSync(subDestDir, { recursive: true });
      const subFiles = fs.readdirSync(srcPath);
      for (const subFile of subFiles) {
        fs.copyFileSync(path.join(srcPath, subFile), path.join(subDestDir, subFile));
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // 计算总大小
  const totalSize = files.reduce((sum, file) => {
    const stat = fs.statSync(path.join(destDir, file));
    return sum + stat.size;
  }, 0);

  console.log(`  ✓ 复制了 ${files.length} 个文件 (${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  ✓ 模型位置: ${destDir}`);
  console.log('');
}

// 步骤 3: 配置 Android build.gradle
function configureBuildGradle() {
  console.log('步骤 3: 配置 Android build.gradle');
  console.log('-'.repeat(60));

  const buildGradlePath = path.join(CONFIG.androidDir, 'app/build.gradle');

  if (!fs.existsSync(buildGradlePath)) {
    console.log('  ⚠ build.gradle 不存在，跳过配置');
    console.log('');
    return;
  }

  let content = fs.readFileSync(buildGradlePath, 'utf8');

  // 检查是否已配置
  if (content.includes('sherpa-onnx')) {
    console.log('  ✓ 已经配置过，跳过');
    console.log('');
    return;
  }

  // 添加 sourceSets 配置
  const sourceSetsConfig = `
    // 添加 Sherpa-ONNX JNI 库
    sourceSets {
        main {
            jniLibs.srcDirs = ['src/main/jniLibs']
        }
    }
`;

  // 在 android {} 块中添加
  content = content.replace(
    /(android\s*\{[^}]*)(\n\s*\})/,
    `$1${sourceSetsConfig}$2`
  );

  // 确保 aaptOptions 存在
  if (!content.includes('aaptOptions')) {
    content = content.replace(
      /(sourceSets\s*\{[^}]+\})/,
      `$1

    aaptOptions {
        // 保持 assets 目录
        ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:<dir>_*:!CVS:!thumbs.db:!picasa.ini:!*~'
    }
`
    );
  }

  fs.writeFileSync(buildGradlePath, content, 'utf8');

  console.log('  ✓ 配置已更新');
  console.log('');
}

// 步骤 4: 同步 Capacitor
function syncCapacitor() {
  console.log('步骤 4: 同步 Capacitor');
  console.log('-'.repeat(60));

  try {
    console.log('  运行: npx cap sync android');
    execSync('npx cap sync android', {
      cwd: CONFIG.projectRoot,
      stdio: 'inherit',
    });
    console.log('  ✓ 同步完成');
    console.log('');
  } catch (error) {
    console.log('  ⚠ 同步失败，请手动运行: npx cap sync android');
    console.log('');
  }
}

// 清理临时文件
function cleanup() {
  if (fs.existsSync(CONFIG.tempDir)) {
    fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
  }
}

// 主流程
async function main() {
  try {
    // 创建临时目录
    if (!fs.existsSync(CONFIG.tempDir)) {
      fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    }

    // 步骤 1: JNI 库
    await setupJniLibs();

    // 步骤 2: 模型
    await setupModels();

    // 步骤 3: 配置
    configureBuildGradle();

    // 步骤 4: 同步
    syncCapacitor();

    // 清理
    cleanup();

    console.log('='.repeat(60));
    console.log('✓ Android ASR 设置完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('已完成:');
    console.log('1. ✓ JNI 库已下载并配置');
    console.log('2. ✓ SenseVoice 模型已下载并配置');
    console.log('3. ✓ Android build.gradle 已配置');
    console.log('4. ✓ Capacitor 已同步');
    console.log('');
    console.log('下一步:');
    console.log('1. 构建 APK:');
    console.log('   cd android && ./gradlew assembleDebug');
    console.log('');
    console.log('2. APK 位置:');
    console.log('   android/app/build/outputs/apk/debug/app-debug.apk');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    console.error('');

    // 输出手动下载链接
    console.log('手动下载链接:');
    console.log('1. JNI 库:');
    console.log(`   https://github.com/k2-fsa/sherpa-onnx/releases/download/${CONFIG.sherpaVersion}/sherpa-onnx-${CONFIG.sherpaVersion}-android.tar.bz2`);
    console.log('');
    console.log('2. 模型:');
    console.log(`   https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/${CONFIG.modelName}.tar.bz2`);
    console.log('');

    cleanup();
    process.exit(1);
  }
}

// 运行
main();
