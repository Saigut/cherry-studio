import store from '.'
import { updateTopicUpdatedAt } from './assistants'

const DEFAULT_TOPIC_UPDATED_AT_DELAY_MS = 400
const topicUpdatedAtTimers = new Map<string, ReturnType<typeof setTimeout>>()

type TopicUpdatedAtDispatch = (action: ReturnType<typeof updateTopicUpdatedAt>) => void

export function scheduleTopicUpdatedAt(
  topicId: string,
  dispatch: TopicUpdatedAtDispatch = store.dispatch,
  delayMs: number = DEFAULT_TOPIC_UPDATED_AT_DELAY_MS
) {
  if (!topicId) {
    return
  }

  const existingTimer = topicUpdatedAtTimers.get(topicId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => {
    topicUpdatedAtTimers.delete(topicId)
    dispatch(updateTopicUpdatedAt({ topicId }))
  }, delayMs)

  topicUpdatedAtTimers.set(topicId, timer)
}
