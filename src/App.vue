<template>
  <div class="container">
    <header>
      <h1>魔法听写板</h1>
    </header>

    <!-- Scrollable content -->
    <div class="scrollable-body">
      <!-- Input Area -->
      <div class="input-area">
        <textarea 
          v-model="inputText"
          class="text-input"
          placeholder="请输入文字，然后点击【生成】或【AI纠正】按钮..."
          rows="2"
        ></textarea>
      </div>

      <!-- Display Area -->
      <main ref="displayArea" class="notebook-area">
        <div v-if="characters.length === 0" class="placeholder-text">
          输入文字后点击【生成】或【AI纠正】...
        </div>
        <div class="char-wrapper" v-else>
          <CharBlock 
            v-for="(char, index) in characters" 
            :key="index + char" 
            :char="char"
            :active="index <= activeIndex"
            @ready="handleCharReady(index)"
          />
        </div>
      </main>
    </div>

    <!-- Controls -->
    <div class="controls-wrapper">
      <button @click="clearAll" class="pixel-btn btn-clear">清空</button>
      <button @click="generateDirect" class="pixel-btn btn-generate" :disabled="!inputText.trim()">
        生成
      </button>
      <button v-if="showAI" @click="autoCorrect" class="pixel-btn btn-ai" :disabled="!inputText.trim()">
        AI纠正
      </button>
      <button v-if="showSubmit" @click="submitText" class="pixel-btn btn-submit">提交</button>
    </div>

    <div v-if="statusMessage" id="status-indicator">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import CharBlock from './components/CharBlock.vue';

// State
const inputText = ref('');
const characters = ref([]);
const activeIndex = ref(-1);
const statusMessage = ref('');

// Env Config
const showAI = import.meta.env.VITE_ENABLE_AI === 'true';
const showSubmit = import.meta.env.VITE_ENABLE_SUBMIT === 'true';
const LLM_URL = import.meta.env.VITE_LLM_API_URL;
const API_KEY = import.meta.env.VITE_LLM_API_KEY;
const MODEL = import.meta.env.VITE_LLM_MODEL;

// Actions
const handleCharReady = (index) => {
  if (index === activeIndex.value && activeIndex.value < characters.value.length - 1) {
    activeIndex.value++;
  }
};

const generateDirect = async () => {
  if (!inputText.value.trim()) {
    alert('请先输入文字');
    return;
  }
  // 先强制清空画板
  characters.value = [];
  activeIndex.value = -1;
  
  await nextTick(); // 确保 DOM 已清空
  
  // 直接显示输入的文字，不经过AI处理
  characters.value = inputText.value.split('');
  activeIndex.value = 0;
};

const autoCorrect = async () => {
  if (!inputText.value.trim()) {
    alert('请先输入文字');
    return;
  }
  
  statusMessage.value = "AI正在批改...";
  
  try {
    const response = await fetch(LLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "你是一个小学语文老师。请纠正用户输入的句子的错别字和标点符号。直接输出纠正后的句子，不要包含任何解释或其他文字。如果句子没有问题，就原样输出。"
          },
          {
            role: "user",
            content: inputText.value
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const correctedText = data.choices[0].message.content.trim();
    
    // 先强制清空画板
    characters.value = [];
    activeIndex.value = -1;
    await nextTick();

    // 渲染纠正后的文字
    characters.value = correctedText.split('');
    activeIndex.value = 0;

  } catch (error) {
    console.error("LLM API Error:", error);
    alert("AI 批改服务暂时不可用，将显示原始文本。");
    // Fallback: 显示原始输入
    characters.value = [];
    activeIndex.value = -1;
    await nextTick();
    
    characters.value = inputText.value.split('');
    activeIndex.value = 0;
  } finally {
    statusMessage.value = '';
  }
};

const clearAll = () => {
  inputText.value = '';
  characters.value = [];
  activeIndex.value = -1;
  statusMessage.value = '';
};

const submitText = () => {
  if (characters.value.length === 0) {
    alert('没有内容可提交');
    return;
  }
  alert(`提交成功！内容：${characters.value.join('')}`);
};
</script>

<style scoped>
/* Scoped styles specific to App layout components */
.container {
  width: 100%;
  max-width: 800px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-left: 4px solid #000;
  border-right: 4px solid #000;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  margin: 0 auto; /* Center the container */
}

/* Responsive adjustments for Mobile and Tablets */
@media (max-width: 1024px) {
  .container {
    max-width: 100%;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }
}

header {
  background-color: #ffd43b;
  border-bottom: 4px solid #000;
  padding: 0.5rem;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 1.2rem;
  text-shadow: 2px 2px 0px rgba(255, 255, 255, 0.5);
  letter-spacing: 2px;
}

.scrollable-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.input-area {
  background-color: #f8f9fa;
  border-bottom: 2px dashed #adb5bd; /* Changed to dashed to look more like a single unit */
  padding: 15px;
}

.text-input {
  width: 100%;
  font-family: 'DotGothic16', sans-serif;
  font-size: 1.2rem;
  padding: 15px;
  border: 4px solid #000;
  border-radius: 8px;
  box-shadow: 4px 4px 0px #000;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  background-color: #fff;
}

.text-input:focus {
  box-shadow: 6px 6px 0px #000;
  transform: translate(-2px, -2px);
}

.text-input::placeholder {
  color: #adb5bd;
}

.notebook-area {
  padding: 15px;
  background-color: #fff;
  position: relative;
  min-height: 400px; /* Ensure there's some space for content */
}

.char-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
}

.placeholder-text {
  color: #adb5bd;
  font-size: 1.2rem;
  width: 100%;
  text-align: center;
  margin-top: 50px;
}

.controls-wrapper {
  background-color: #f8f9fa;
  border-top: 4px solid #000;
  padding: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
}

.pixel-btn {
  flex: 1; /* Make buttons equal width */
  max-width: 150px;
  font-family: 'DotGothic16', sans-serif;
  font-size: 1.1rem;
  padding: 10px 5px; /* Flatter padding */
  border: 3px solid #000;
  cursor: pointer;
  position: relative;
  outline: none;
  transition: all 0.1s;
  font-weight: bold;
  color: white;
  box-shadow: 3px 3px 0px #000;
  border-radius: 6px;
}

.pixel-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px transparent;
}

.pixel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 3px 3px 0px #000;
}

.btn-clear { background-color: #fab005; }
.btn-generate { background-color: #339af0; }
.btn-ai { background-color: #51cf66; }
.btn-submit { background-color: #cc5de8; }

#status-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  font-size: 2rem;
  pointer-events: none;
  z-index: 100;
}
</style>
