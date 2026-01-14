# 魔法听写板 - 使用指南

一个基于 Vue 3 + Vite 的儿童听写辅助应用，支持使用 Pad 自带输入法输入文字，通过 AI 大模型自动纠错，并使用笔顺动画和拼音标注展示汉字。

## 项目结构

```
daily-note/
├── src/                    # Vue 前端源码
│   ├── App.vue            # 主应用组件
│   ├── components/
│   │   └── CharBlock.vue  # 汉字显示组件
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── .gitignore             # Git 忽略文件
├── package.json           # Node.js 依赖
├── vite.config.js         # Vite 配置
└── index.html             # HTML 入口
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录下创建 `.env` 文件，并根据您的 LLM 服务进行配置：

```bash
# 是否开启 AI 纠正功能
VITE_ENABLE_AI=true
# 是否开启提交功能
VITE_ENABLE_SUBMIT=true

# LLM 接口配置
VITE_LLM_API_URL=http://127.0.0.1:8045/v1/chat/completions
VITE_LLM_API_KEY=your_api_key_here
VITE_LLM_MODEL=gemini-3-flash
```

### 3. 启动开发服务器

```bash
pnpm dev
```

前端将运行在 `http://localhost:5173` (如果端口被占用，会自动选择其他端口)

### 4. 在 Pad 上访问

1. 确保 Pad 和电脑在同一局域网
2. 查看控制台输出的 Network 地址，例如：`http://192.168.1.2:5174/`
3. 在 Pad 浏览器中访问该地址

## 使用流程

1. **输入文字**：在文本框中使用 Pad 自带输入法（拼音、手写等）输入文字
2. **自动纠正**：点击"自动纠正"按钮，AI 会分析并纠正错别字和标点符号
3. **查看结果**：纠正后的文字会以笔顺动画形式展示，每个汉字上方标注拼音
4. **清空/提交**：可以清空重新输入，或提交完成的作业

## 系统架构

```
[Pad 浏览器]
    ↓ 使用自带输入法输入文字
    ↓ 点击"自动纠正"
    ↓
[LLM 服务] ← Gemini-3-Flash (纠错)
    ↓ 返回纠正后的句子
    ↓
[前端渲染] ← cnchar + cnchar-draw
    └─ 拼音标注 + 笔顺动画
```

## 功能特性

✅ **Pad 友好输入**：使用原生输入法，支持拼音、手写、语音输入等  
✅ **AI 智能纠错**：基于大模型的错别字和标点符号纠正  
✅ **汉字笔顺动画**：每个汉字自动播放书写笔顺  
✅ **拼音自动标注**：汉字上方显示带声调的拼音  
✅ **像素风格 UI**：适合儿童的复古游戏风格界面

## 配置说明

### LLM 服务配置 (`.env`)

应用通过 Vite 的环境变量机制进行配置。请确保在项目根目录创建并配置 `.env` 文件。

### 修改 AI 纠错提示词

在 `src/App.vue` 的 `autoCorrect` 函数中找到 `system` 消息，可以根据需要调整提示词。

## 故障排查

### 问题 1: LLM 服务连接失败
- 检查 `.env` 中的 `VITE_LLM_API_URL` 是否正确
- 检查 API Key 是否正确
- 查看浏览器控制台的错误信息

### 问题 2: 笔顺动画不显示
- 检查网络连接，cnchar 库从 CDN 加载
- 清除浏览器缓存重试

### 问题 3: Pad 无法访问
- 确保 Pad 和电脑在同一局域网
- 检查电脑防火墙是否阻止了端口访问
- 尝试关闭 VPN

## 生产部署建议

1. 使用 HTTPS（可用 Let's Encrypt 或自签名证书）
2. 配置 Nginx 反向代理
3. 使用 PM2 或 systemd 管理 Python 服务
4. 前端使用 `npm run build` 构建生产版本

## 技术栈

- **前端**: Vue 3 + Vite
- **语音识别**: Faster-Whisper (OpenAI Whisper 优化版)
- **汉字渲染**: cnchar + cnchar-draw
- **LLM**: 兼容 OpenAI 格式的本地模型
- **后端**: FastAPI + Uvicorn

## License

MIT
