<template>
  <div class="char-block" :class="{ 'is-failed': isFailed }" @click="handleManualRetry">
    <div class="pinyin">{{ pinyin }}</div>
    <div ref="hanziDiv" class="hanzi-container"></div>
    <div v-if="isFailed" class="retry-hint">点击刷新</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import cnchar from 'cnchar';

const props = defineProps({
  char: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['ready']);

const hanziDiv = ref(null);
const retryCount = ref(0);
const isFailed = ref(false);
const MAX_RETRY = 3;

const pinyin = computed(() => {
  return cnchar.spell(props.char, 'tone').toLowerCase();
});

const handleManualRetry = () => {
  if (isFailed.value) {
    console.log(`[CharBlock] 手动触发重试: ${props.char}`);
    isFailed.value = false;
    retryCount.value = 0;
    drawChar();
  }
};

const drawChar = async () => {
  if (!hanziDiv.value || !props.active) return;
  
  // 先清空，再等待布局/绘制帧，避免首次渲染时容器尺寸为0导致动画不启动
  hanziDiv.value.innerHTML = '';
  await nextTick();

  if (cnchar.isCnChar(props.char)) {
    requestAnimationFrame(() => {
      cnchar.draw(props.char, {
        el: hanziDiv.value,
        type: cnchar.draw.TYPE.ANIMATION,
        style: {
          length: 100,
          lineColor: '#ddd',
          radicalColor: '#e03131',
          strokeColor: '#333',
          width: 4
        },
        animation: {
          loopAnimate: true,
          autoAnimate: true,
          stepByStep: false,
          delayBetweenLoops: 200,
          strokeAnimationSpeed: 1, // 每笔绘制速度，默认1，数值越大越快，越小越慢
          delayBetweenStrokes: 50 // 每笔之间的间隔时间（毫秒），默认1000
        }
      });

      // 监控机制：短暂延迟后检查 SVG 是否真的生成了
      setTimeout(() => {
        const hasSvg = hanziDiv.value.querySelector('svg');
        if (hasSvg) {
          isFailed.value = false;
          emit('ready'); // 成功，通知父组件可以开始下一个
        } else if (retryCount.value < MAX_RETRY) {
          retryCount.value++;
          console.warn(`[CharBlock] ${props.char} 渲染失败，尝试第 ${retryCount.value} 次重试`);
          drawChar(); 
        } else {
          console.error(`[CharBlock] ${props.char} 渲染彻底失败`);
          isFailed.value = true;
          emit('ready'); // 即使失败也放行，避免阻塞后续字符
        }
      }, 60); // 略长于 nextTick/RAF
    });
  } else {
    // Non-Chinese characters
    hanziDiv.value.textContent = props.char;
    hanziDiv.value.style.fontSize = '3rem';
    hanziDiv.value.style.width = '100px';
    hanziDiv.value.style.height = '100px';
    hanziDiv.value.style.display = 'flex';
    hanziDiv.value.style.alignItems = 'center';
    hanziDiv.value.style.justifyContent = 'center';
    isFailed.value = false;
    emit('ready');
  }
};

onMounted(() => {
  if (props.active) drawChar();
});

watch(() => props.active, (newVal) => {
  if (newVal) drawChar();
});

watch(() => props.char, () => {
  retryCount.value = 0;
  drawChar();
});
</script>

<style scoped>
.char-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5px;
  background: white;
  padding: 5px;
  border: 2px dashed #ced4da;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s;
}

.char-block.is-failed {
  border-color: #fa5252;
  background-color: #fff5f5;
  cursor: pointer;
}

.char-block.is-failed:hover {
  background-color: #ffe3e3;
  transform: translateY(-2px);
}

.retry-hint {
  position: absolute;
  bottom: 5px;
  font-size: 0.7rem;
  color: #fa5252;
  font-weight: bold;
}

.pinyin {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 10px;
  font-family: Arial, sans-serif;
  height: 1.5rem; /* Reserve height */
}

.hanzi-container {
  /* Dimensions handled by cnchar usually, but setting block ensures layout */
  display: block;
  width: 100px;
  height: 100px;
}
</style>
