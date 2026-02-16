/**
 * Persists proctoring/audit events locally so they survive offline and page refresh.
 * Events are keyed by attemptId and sent to the backend when online; successful
 * sends remove them from storage to keep logs immutable and avoid duplicates.
 */

const STORAGE_KEY_PREFIX = "proctor_pending_";
const MAX_EVENTS_PER_ATTEMPT = 500;

function getStorageKey(attemptId) {
  return `${STORAGE_KEY_PREFIX}${attemptId}`;
}

/**
 * @param {string} attemptId
 * @returns {Array<{ id: string, eventType: string, timestamp: string, questionId: string | null, metadata: object }>}
 */
export function getPendingEvents(attemptId) {
  if (!attemptId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(attemptId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn("eventLogPersistence: getPendingEvents failed", e);
    return [];
  }
}

/**
 * Append a single event to local storage for this attempt.
 * @param {string} attemptId
 * @param {{ id?: string, eventType: string, timestamp: string, questionId?: string | null, metadata?: object }} event
 */
export function appendEvent(attemptId, event) {
  if (!attemptId) return;
  try {
    const list = getPendingEvents(attemptId);
    const withId = { ...event, id: event.id || crypto.randomUUID() };
    list.push(withId);
    if (list.length > MAX_EVENTS_PER_ATTEMPT) {
      list.splice(0, list.length - MAX_EVENTS_PER_ATTEMPT);
    }
    localStorage.setItem(getStorageKey(attemptId), JSON.stringify(list));
  } catch (e) {
    console.warn("eventLogPersistence: appendEvent failed", e);
  }
}

/**
 * Remove events by id after successful send to backend.
 * @param {string} attemptId
 * @param {string[]} ids
 */
export function removeEventsById(attemptId, ids) {
  if (!attemptId || !ids?.length) return;
  try {
    const set = new Set(ids);
    const list = getPendingEvents(attemptId).filter((e) => !set.has(e.id));
    if (list.length === 0) {
      localStorage.removeItem(getStorageKey(attemptId));
    } else {
      localStorage.setItem(getStorageKey(attemptId), JSON.stringify(list));
    }
  } catch (e) {
    console.warn("eventLogPersistence: removeEventsById failed", e);
  }
}

/**
 * Build payload for backend from stored events (strip id for API).
 * @param {Array<{ id: string, eventType: string, timestamp: string, questionId?: string | null, metadata?: object }>} events
 * @returns {{ events: Array<{ eventType: string, timestamp: string, questionId?: string | null, metadata?: object }>, ids: string[] }}
 */
export function toBackendPayload(events) {
  const ids = events.map((e) => e.id);
  const eventsForApi = events.map(({ id, ...rest }) => rest);
  return { events: eventsForApi, ids };
}
