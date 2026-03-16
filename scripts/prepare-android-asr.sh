#!/bin/bash

# Android ASR 准备脚本
# 下载并配置 Sherpa-ONNX Android 库和 SenseVoice 模型

set -e

echo "================================"
echo "Android ASR 准备脚本"
echo "================================"
echo ""

# 配置
SHERPA_VERSION="v1.12.26"
SHERPA_ANDROID_URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/${SHERPA_VERSION}/sherpa-onnx-${SHERPA_VERSION}-android.tar.bz2"
MODEL_NAME="sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09"
MODEL_URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/${MODEL_NAME}.tar.bz2"

# 目录配置
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${PROJECT_ROOT}/android"
ASSETS_DIR="${ANDROID_DIR}/app/src/main/assets"
JNILIBS_DIR="${ANDROID_DIR}/app/src/main/jniLibs"
TEMP_DIR="${PROJECT_ROOT}/.temp_android_asr"

echo "项目根目录: ${PROJECT_ROOT}"
echo "Android 目录: ${ANDROID_DIR}"
echo ""

# 创建临时目录
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"
cd "${TEMP_DIR}"

# 步骤 1: 下载 Sherpa-ONNX Android 库
echo "步骤 1: 下载 Sherpa-ONNX Android 库..."
echo "URL: ${SHERPA_ANDROID_URL}"
curl -L -o sherpa-onnx-android.tar.bz2 "${SHERPA_ANDROID_URL}"
tar xjf sherpa-onnx-android.tar.bz2

echo "✓ Android 库下载完成"
echo ""

# 步骤 2: 复制 JNI 库
echo "步骤 2: 复制 JNI 库到项目..."
mkdir -p "${JNILIBS_DIR}/arm64-v8a"
mkdir -p "${JNILIBS_DIR}/armeabi-v7a"

if [ -d "jniLibs/arm64-v8a" ]; then
    cp -v jniLibs/arm64-v8a/* "${JNILIBS_DIR}/arm64-v8a/"
fi

if [ -d "jniLibs/armeabi-v7a" ]; then
    cp -v jniLibs/armeabi-v7a/* "${JNILIBS_DIR}/armeabi-v7a/"
fi

echo "✓ JNI 库复制完成"
echo ""

# 步骤 3: 下载 SenseVoice 模型
echo "步骤 3: 下载 SenseVoice 模型..."
echo "URL: ${MODEL_URL}"
curl -L -o "${MODEL_NAME}.tar.bz2" "${MODEL_URL}"
tar xjf "${MODEL_NAME}.tar.bz2"

echo "✓ 模型下载完成"
echo ""

# 步骤 4: 复制模型到 assets
echo "步骤 4: 复制模型到 assets..."
mkdir -p "${ASSETS_DIR}/models"

if [ -d "${MODEL_NAME}" ]; then
    cp -rv "${MODEL_NAME}" "${ASSETS_DIR}/models/"
    echo "✓ 模型复制完成: ${ASSETS_DIR}/models/${MODEL_NAME}/"
else
    echo "警告: 模型目录不存在"
    ls -la
fi

echo ""

# 清理
cd "${PROJECT_ROOT}"
rm -rf "${TEMP_DIR}"

echo "================================"
echo "✓ Android ASR 准备完成！"
echo "================================"
echo ""
echo "已配置："
echo "1. JNI 库: ${JNILIBS_DIR}"
echo "2. 模型文件: ${ASSETS_DIR}/models/"
echo ""
echo "下一步："
echo "1. 在 Android 项目中添加语音识别代码"
echo "2. 创建 Capacitor 插件接口"
echo "3. 构建 APK"
echo ""
