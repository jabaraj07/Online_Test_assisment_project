import axios from "axios";
import React, { createContext, useContext, useEffect, useRef } from "react";

const EventLoggerContext = createContext();

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
        await axios.post(
          `http://localhost:5000/api/attempt/${attemptId}/event`,
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
