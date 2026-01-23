<template>
  <div class="sparkle-effect">
    <div
      v-for="sparkle in sparkles"
      :key="sparkle.id"
      class="sparkle-effect__item"
      :style="sparkle.style"
    >
      ✦
    </div>
  </div>
</template>

<script setup lang="ts">
interface Sparkle {
  id: number
  style: {
    left: string
    top: string
    fontSize: string
    animationDelay: string
    animationDuration: string
  }
}

const sparkles = ref<Sparkle[]>([])
let sparkleId = 0
let intervalId: NodeJS.Timeout | null = null

const createSparkle = () => {
  const newSparkle: Sparkle = {
    id: sparkleId++,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 2 + 0.5}rem`, // от 0.5rem до 2.5rem
      animationDelay: '0s',
      animationDuration: `${Math.random() * 0.3 + 0.4}s` // от 0.4s до 0.7s
    }
  }
  
  sparkles.value.push(newSparkle)
  
  // Удаляем вспышку после анимации
  setTimeout(() => {
    sparkles.value = sparkles.value.filter(s => s.id !== newSparkle.id)
  }, 800)
}

const startSparkles = () => {
  // Создаём вспышки с интервалом 33-100ms (в три раза чаще)
  const createWithRandomInterval = () => {
    // Создаём 3 вспышки одновременно для увеличения плотности в 3 раза
    createSparkle()
    createSparkle()
    createSparkle()
    const nextInterval = Math.random() * 67 + 33 // 33-100ms
    setTimeout(createWithRandomInterval, nextInterval)
  }
  
  createWithRandomInterval()
}

onMounted(() => {
  // Запускаем вспышки через 2 секунды (когда фон станет чёрным)
  setTimeout(() => {
    startSparkles()
  }, 2000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style lang="scss" scoped>
.sparkle-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  
  &__item {
    position: absolute;
    color: rgba(255, 255, 255, 0.9);
    animation: sparkle-flash forwards;
    transform: translate(-50%, -50%);
  }
}

@keyframes sparkle-flash {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}
</style>
