import axios from "axios";
import {
  appendEvent,
  getPendingEvents,
  removeEventsById,
  toBackendPayload,
} from "./eventLogPersistence";
import AXIOS from '../axios/testAxiosConfig'

const API_BASE = "http://localhost:5000";

/**
 * Send event via sendBeacon so it is delivered even when the tab is throttled
 * (e.g. after exiting fullscreen or switching tab). Used for critical events
 * that must not be delayed by the browser.
 */
function sendEventBeacon(attemptId, eventType, timestamp, questionId, metadata) {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const url = `${API_BASE}/api/attempt/${attemptId}/event`;
  const body = JSON.stringify({
    events: [{ eventType, timestamp, questionId, metadata }],
  });
  const blob = new Blob([body], { type: "application/json" });
  navigator.sendBeacon(url, blob);
}

export const logEvent = async (
  {
    attemptId,
    eventType,
    questionId = null,
    metadata = {},
  },
  options = {}
) => {
  // console.log("QuestionId in logEvent",questionId);
  
  const { useBeacon = false } = options;
  const timestamp = new Date().toISOString();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const event = {
    id,
    eventType,
    timestamp,
    questionId,
    metadata,
  };

  appendEvent(attemptId, event);

  if (useBeacon) {
    console.log("BEAN LOG");
    
    sendEventBeacon(attemptId, eventType, timestamp, questionId, metadata);
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE}/api/attempt/${attemptId}/event`,
      { events: [{ eventType, timestamp, questionId, metadata }] },
    );
    removeEventsById(attemptId, [id]);
    return response.data;
  } catch (error) {
    console.error(
      "Error logging event:",
      error.response?.data || error.message,
    );
  }
};

/**
 * Flush events persisted locally (e.g. after offline or page refresh).
 * Call this when the test page loads so pending events are sent to the backend.
 */
export const flushPendingEvents = async (attemptId) => {
  const pending = getPendingEvents(attemptId);
  if (pending.length === 0) return;

  const { events, ids } = toBackendPayload(pending);
  try {
    await axios.post(
      `${API_BASE}/api/attempt/${attemptId}/event`,
      { events },
    );
    removeEventsById(attemptId, ids);
  } catch (error) {
    console.error(
      "Flush pending events failed:",
      error.response?.data || error.message,
    );
  }
};

export const submitTest = async (attemptId) => {
  try {
    const response = await AXIOS.post(
      `/attempt/submit/${attemptId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Submit failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getAttemptById = async (attemptId) => {
  const response = await AXIOS.get(
    `/attempt/${attemptId}`,
  );
  return response.data;
};

export const getQuestions = async () => {
  const response = await AXIOS.get(`/attempt/questions`);
  return response.data;
};

export const getAttemptAnswers = async (attemptId) => {
  const response = await AXIOS.get(
    `/attempt/${attemptId}/answers`,
  );
  return response.data;
};

export const saveAnswers = async (attemptId, answers) => {
  const response = await AXIOS.post(
    `/attempt/${attemptId}/answers`,
    { answers },
  );
  return response.data;
};
