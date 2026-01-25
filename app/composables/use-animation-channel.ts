import { computed } from 'vue'

export const useAnimationChannel = (id: string, initialValue = 0) => {
  const animationsStore = useAnimationsStore()
  animationsStore.ensureChannel(id, initialValue)

  const value = computed(() => animationsStore.channels[id] ?? initialValue)
  const set = (next: number): void => {
    animationsStore.setChannel(id, next)
  }

  return {
    value,
    set
  }
}
