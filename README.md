# AI Code Preview Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](#english) | [中文](#chinese)

## 目录 (Contents)

- [项目简介 (Introduction)](#项目简介-introduction)
- [功能特性 (Features)](#功能特性-features)
- [技术栈 (Tech Stack)](#技术栈-tech-stack) 
- [安装说明 (Installation)](#安装说明-installation)
- [使用指南 (Usage)](#使用指南-usage)
- [注意事项 (Notes)](#注意事项-notes)
- [问题反馈 (Feedback)](#问题反馈-feedback)
- [许可证 (License)](#许可证-license)

<h2 id="chinese">中文说明</h2>

### 项目简介

这是一个专为 AI 对话平台用户设计的 Chrome 扩展程序,能够实时预览、收集和运行html+css+js和 React 组件代码与 CSS 样式。通过简单的点击操作,即可实现代码的预览、复制和下载等功能。

### 功能特性

- ✨ **智能代码检测**
  - 自动识别页面中的 React/JSX 代码
  - 支持 CSS 样式代码检测
  - 精准识别代码块位置

- 🔄 **实时代码预览**
  - React 组件实时渲染
  - 支持 JSX 语法转换
  - 隔离环境安全运行

- 📦 **代码管理工具**
  - 一键收集代码片段
  - 支持代码复制到剪贴板
  - 本地文件下载功能

### 技术栈

- Chrome Extension API
- JavaScript (ES6+)
- React & ReactDOM
- Babel (JSX 转换)
- CSS3

### 安装说明

1. 下载项目源码
2. 打开 Chrome 浏览器,访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目目录即可

### 使用指南

1. **代码收集**
   - 找到目标代码块
   - 点击「Collect JSX」或「Collect CSS」按钮
   - 代码会被自动收集保存

2. **预览功能**
   - 点击「Preview Code」按钮
   - 在右侧面板查看渲染效果
   - 支持预览/代码视图切换

3. **代码管理**
   - 使用复制按钮保存到剪贴板
   - 通过下载按钮保存到本地
   - 可随时重新加载预览

### 注意事项

- 仅支持基础 React 组件代码
- 同时支持html+css+js
- 需要 Chrome 浏览器 88+ 版本
- 确保代码格式规范
- 避免使用外部依赖库

### 问题反馈

如有问题或建议,欢迎通过以下方式反馈:
- 提交 GitHub Issues
- 发送邮件至维护者邮箱

<h2 id="english">English</h2>

### Introduction

A Chrome extension designed for AI platform users that enables real-time preview, collection and execution of React component code and CSS styles. Users can preview, copy and download code with simple clicks.

### Features

- ✨ **Smart Code Detection**
  - Auto-detect React/JSX code
  - CSS style code support
  - Precise code block location

- 🔄 **Real-time Preview**
  - Live React component rendering
  - JSX syntax transformation
  - Isolated execution environment

- 📦 **Code Management**
  - One-click code collection
  - Copy to clipboard
  - Local file download

### Tech Stack

- Chrome Extension API
- JavaScript (ES6+)
- React & ReactDOM
- Babel (JSX Transform)
- CSS3

### Installation

1. Download source code
2. Open Chrome browser, visit `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select project directory

### Usage

1. **Code Collection**
   - Locate target code block
   - Click "Collect JSX" or "Collect CSS"
   - Code will be automatically saved

2. **Preview Function**
   - Click "Preview Code" button
   - Check rendering in right panel
   - Switch between preview/code view

3. **Code Management**
   - Copy to clipboard
   - Download locally
   - Reload preview anytime

### Notes

- Basic React components only
- Requires Chrome 88+
- Ensure proper code format
- Avoid external dependencies

### Feedback

For issues or suggestions:
- Submit GitHub Issues
- Email maintainer

### Icons
Icons used in this project are from Icons8, under their usage terms and conditions.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.