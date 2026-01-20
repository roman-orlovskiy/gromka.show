<template>
  <button 
    :class="buttonClasses"
    class="app-button"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'gradient-3' | 'gradient-4' | 'gradient-5'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

const buttonClasses = computed(() => ({
  'app-button--primary': props.variant === 'primary',
  'app-button--secondary': props.variant === 'secondary',
  'app-button--gradient-3': props.variant === 'gradient-3',
  'app-button--gradient-4': props.variant === 'gradient-4',
  'app-button--gradient-5': props.variant === 'gradient-5'
}))
</script>

<style lang="scss" scoped>
.app-button {
  padding: 1.5rem 3rem;
  font-size: 1.8rem;
  font-weight: bold;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  text-decoration: none;
  display: inline-block;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &--secondary {
    background: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);
  }

  &--gradient-3 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &--gradient-4 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  &--gradient-5 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
}
</style>
