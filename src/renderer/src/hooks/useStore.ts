/**
 * @deprecated Scheduled for removal in v2.0.0
 * --------------------------------------------------------------------------
 * ⚠️ NOTICE: V2 DATA&UI REFACTORING (by 0xfullex)
 * --------------------------------------------------------------------------
 * STOP: Feature PRs affecting this file are currently BLOCKED.
 * Only critical bug fixes are accepted during this migration phase.
 *
 * This file is being refactored to v2 standards.
 * Any non-critical changes will conflict with the ongoing work.
 *
 * 🔗 Context & Status:
 * - Contribution Hold: https://github.com/CherryHQ/cherry-studio/issues/10954
 * - v2 Refactor PR   : https://github.com/CherryHQ/cherry-studio/pull/10162
 * --------------------------------------------------------------------------
 */
import { CHERRYAI_PROVIDER } from '@renderer/config/providers'
import store, { useAppDispatch, useAppSelector } from '@renderer/store'
import { setAssistantsTabSortType } from '@renderer/store/settings'
import type { AssistantsSortType } from '@renderer/types'

import { useSidebarVisibility } from './useSidebarVisibility'

export function useShowAssistants() {
  const fallbackShowAssistants = useAppSelector((state) => state.settings.showAssistants)
  const fallbackShowTopics = useAppSelector((state) => state.settings.showTopics)
  const { showAssistants, setShowAssistants, toggleShowAssistants } = useSidebarVisibility({
    showAssistants: fallbackShowAssistants,
    showTopics: fallbackShowTopics
  })

  return { showAssistants, setShowAssistants, toggleShowAssistants }
}

export function useShowTopics() {
  const fallbackShowAssistants = useAppSelector((state) => state.settings.showAssistants)
  const fallbackShowTopics = useAppSelector((state) => state.settings.showTopics)
  const { showTopics, setShowTopics, toggleShowTopics } = useSidebarVisibility({
    showAssistants: fallbackShowAssistants,
    showTopics: fallbackShowTopics
  })

  return { showTopics, setShowTopics, toggleShowTopics }
}

export function useAssistantsTabSortType() {
  const assistantsTabSortType = useAppSelector((state) => state.settings.assistantsTabSortType)
  const dispatch = useAppDispatch()

  return {
    assistantsTabSortType,
    setAssistantsTabSortType: (sortType: AssistantsSortType) => dispatch(setAssistantsTabSortType(sortType))
  }
}

export function getStoreProviders() {
  return store.getState().llm.providers.concat([CHERRYAI_PROVIDER])
}
