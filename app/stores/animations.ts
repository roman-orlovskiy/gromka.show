import { defineStore } from 'pinia'
import { reactive } from 'vue'

type ChannelId = string

export const useAnimationsStore = defineStore('animations', () => {
  const channels = reactive<Record<ChannelId, number>>({})

  const ensureChannel = (id: ChannelId, initialValue = 0): void => {
    if (Object.prototype.hasOwnProperty.call(channels, id)) return
    channels[id] = initialValue
  }

  const setChannel = (id: ChannelId, value: number): void => {
    channels[id] = value
  }

  return {
    channels,
    ensureChannel,
    setChannel
  }
})
