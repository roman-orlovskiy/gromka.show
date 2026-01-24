import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

interface ModalParams {
  [key: string]: any
}

export const useMainStore = defineStore('main', () => {
  const modalType: Ref<string | null> = ref(null)
  const modalParams: Ref<ModalParams> = ref({})

  const isModalOpen: ComputedRef<boolean> = computed(() => modalType.value !== null)

  const openModal = (type: string, params: ModalParams = {}): void => {
    console.log('openModal', type)
    modalType.value = type
    modalParams.value = params
    console.log(params)
  }

  const closeModal = (): void => {
    modalType.value = null
    modalParams.value = {}
  }

  // Текущий активный слайд (для синхронизации с хедером)
  const activeViewId: Ref<string> = ref('hero')
  const setActiveViewId = (viewId: string): void => {
    activeViewId.value = viewId
  }

  return {
    modalType,
    modalParams,
    isModalOpen,
    openModal,
    closeModal,
    activeViewId,
    setActiveViewId
  }
})
