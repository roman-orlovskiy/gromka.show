import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkTheme: Ref<boolean> = ref(false)

  const setDarkTheme = (value: boolean): void => {
    isDarkTheme.value = value
  }

  const toggleTheme = (): void => {
    isDarkTheme.value = !isDarkTheme.value
  }

  return {
    isDarkTheme,
    setDarkTheme,
    toggleTheme
  }
})
