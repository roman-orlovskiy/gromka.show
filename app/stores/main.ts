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

  // Svetlo: состояние света (фонарик/экран)
  // null = не инициализировано, true/false = текущее состояние
  const isLightOn: Ref<boolean | null> = ref(null)

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

  // Запрос навигации к конкретному слайду (например, клик по лого в хедере).
  // Страница `app/pages/index.vue` слушает nonce и выполняет переход через `goToView`.
  const navigationRequestViewId: Ref<string | null> = ref(null)
  const navigationRequestNonce: Ref<number> = ref(0)
  const requestNavigateToView = (viewId: string): void => {
    navigationRequestViewId.value = viewId
    navigationRequestNonce.value += 1
  }

  return {
    modalType,
    modalParams,
    isModalOpen,
    isLightOn,
    openModal,
    closeModal,
    activeViewId,
    setActiveViewId,
    navigationRequestViewId,
    navigationRequestNonce,
    requestNavigateToView
  }
})
