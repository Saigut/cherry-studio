import { useSyncExternalStore } from 'react'

type SidebarVisibilityState = {
  showAssistants: boolean
  showTopics: boolean
}

const SHOW_ASSISTANTS_KEY = 'ui:showAssistants'
const SHOW_TOPICS_KEY = 'ui:showTopics'

let sidebarVisibilityState: SidebarVisibilityState | null = null
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function readStoredBoolean(key: string, fallback: boolean) {
  const value = window.localStorage.getItem(key)
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function persistState(state: SidebarVisibilityState) {
  window.localStorage.setItem(SHOW_ASSISTANTS_KEY, String(state.showAssistants))
  window.localStorage.setItem(SHOW_TOPICS_KEY, String(state.showTopics))
}

function ensureSidebarVisibilityState(fallbackState: SidebarVisibilityState) {
  if (sidebarVisibilityState) {
    return sidebarVisibilityState
  }

  sidebarVisibilityState = {
    showAssistants: readStoredBoolean(SHOW_ASSISTANTS_KEY, fallbackState.showAssistants),
    showTopics: readStoredBoolean(SHOW_TOPICS_KEY, fallbackState.showTopics)
  }

  persistState(sidebarVisibilityState)
  return sidebarVisibilityState
}

function updateSidebarVisibility(partialState: Partial<SidebarVisibilityState>) {
  if (!sidebarVisibilityState) {
    throw new Error('Sidebar visibility state has not been initialized')
  }

  sidebarVisibilityState = {
    ...sidebarVisibilityState,
    ...partialState
  }
  persistState(sidebarVisibilityState)
  notifyListeners()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  if (!sidebarVisibilityState) {
    throw new Error('Sidebar visibility state has not been initialized')
  }

  return sidebarVisibilityState
}

function getCurrentSidebarVisibilityState() {
  return getSnapshot()
}

export function useSidebarVisibility(fallbackState: SidebarVisibilityState) {
  ensureSidebarVisibilityState(fallbackState)

  const state = useSyncExternalStore(subscribe, getSnapshot, () => fallbackState)

  return {
    ...state,
    setShowAssistants: (showAssistants: boolean) => updateSidebarVisibility({ showAssistants }),
    toggleShowAssistants: () =>
      updateSidebarVisibility({ showAssistants: !getCurrentSidebarVisibilityState().showAssistants }),
    setShowTopics: (showTopics: boolean) => updateSidebarVisibility({ showTopics }),
    toggleShowTopics: () => updateSidebarVisibility({ showTopics: !getCurrentSidebarVisibilityState().showTopics })
  }
}
