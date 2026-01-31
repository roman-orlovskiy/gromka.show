import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'

type WakeLockSentinelLike = {
  release: () => Promise<void>
  addEventListener?: (type: string, listener: () => void) => void
}

/**
 * Предотвращает засыпание экрана (Wake Lock API).
 * Безопасно для SSR: работает только на клиенте.
 */
export function useWakeLock() {
  const wakeLock: Ref<WakeLockSentinelLike | null> = ref(null)
  const isActive = ref(false)

  const requestWakeLock = async () => {
    if (!import.meta.client) return
    try {
      if (!('wakeLock' in navigator)) {
        isActive.value = false
        return
      }

      // @ts-expect-error - Wake Lock API может отсутствовать в типах TS окружения
      wakeLock.value = await navigator.wakeLock.request('screen')
      isActive.value = true

      wakeLock.value?.addEventListener?.('release', () => {
        isActive.value = false
      })
    } catch {
      isActive.value = false
    }
  }

  const releaseWakeLock = async () => {
    if (!import.meta.client) return
    if (!wakeLock.value) return
    try {
      await wakeLock.value.release()
    } finally {
      wakeLock.value = null
      isActive.value = false
    }
  }

  const toggleWakeLock = async () => {
    if (isActive.value) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }

  onBeforeUnmount(() => {
    void releaseWakeLock()
  })

  return {
    wakeLock,
    isActive,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock
  }
}

