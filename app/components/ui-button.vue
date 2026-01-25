<template>
  <button class="ui-button" :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const buttonClasses = computed(() => {
  return [
    `ui-button--${props.variant}`,
    `ui-button--${props.size}`
  ]
})
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables.scss" as *;

.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-weight: $font-weight-medium;
  transition: background-color 0.3s ease, color 0.3s ease;
  white-space: nowrap;
  text-decoration: none;
  
  // Размеры через паддинги
  &--sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: 0.5rem;
  }
  
  &--md {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.75rem;
  }
  
  &--lg {
    padding: 1.722rem 3.333rem; // 80px высота, 310px ширина при базовом 18px
    font-size: 1rem;
    border-radius: 1rem;
  }
  
  // Варианты
  &--primary {
    background-color: $color-primary;
    color: $color-white;
    
    &:hover {
      background-color: $color-primary-dark;
    }
  }
  
  &--secondary {
    background-color: $color-white;
    color: $color-primary;
    
    &:hover {
      background-color: $color-primary-light;
      color: $color-white;
    }
  }
  
  &--outline {
    background-color: transparent;
    color: $color-primary;
    border: 2px solid $color-primary;
    
    &:hover {
      background-color: $color-primary;
      color: $color-white;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: $color-primary;
    }
  }
}
</style>
