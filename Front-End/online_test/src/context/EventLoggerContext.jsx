import axios from "axios";
import React, { createContext, useContext, useEffect, useRef } from "react";

const EventLoggerContext = createContext();

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
});

export const EventLoggerProvider = ({ attemptId, children }) => {
  const eventQueueRef = useRef([]);

  const logEvent = (type) => {
    eventQueueRef.current.push({
      type,
      timestamp: new Date().toISOString(),
    });
  };

  // Batch sender
  useEffect(() => {
    const interval = setInterval(async () => {
      if (eventQueueRef.current.length === 0) return;

      const eventsToSend = [...eventQueueRef.current];
      eventQueueRef.current = [];

      try {
        await api.post(
          `/attempt/${attemptId}/event`,
          { events: eventsToSend },
        );
      } catch (err) {
        console.error("Batch send failed", err);
        eventQueueRef.current.unshift(...eventsToSend);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [attemptId]);

  return (
    <EventLoggerContext.Provider value={{ logEvent }}>
      {children}
    </EventLoggerContext.Provider>
  );
};

export const useEventLogger = () => {
  return useContext(EventLoggerContext);
};
