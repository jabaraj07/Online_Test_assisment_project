import React, { useEffect, useRef, useState } from "react";
import { logEvent } from "../services/api";
import "./TimerComponent.css";

const TimerComponent = ({ duration, attemptId, onExpire, isSubmitted }) => {
  console.log("AttemptId : "+attemptId);
  console.log("Duration : "+duration);
  console.log(isSubmitted)
  
  const endTime = new Date(duration);
  const WARNING_THRESHOLDS = [300, 60];
  const [triggeredWarnings, setTriggeredWarnings] = useState([]);

  const calculateTimeLeft = () => {
    const now = new Date();
    const diff = endTime - now;
    return Math.max(0, Math.floor(diff / 1000));
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  const timerRef = useRef(null);
  const hasExpiredRef = useRef(false);
  const hasStartedRef = useRef(false);


  useEffect(() => {
    WARNING_THRESHOLDS.forEach(async (threshold) => {
      if (timeLeft === threshold && !triggeredWarnings.includes(threshold)) {
        try {
          await logEvent({
            attemptId,
            eventType: "WARNING_THRESHOLD_REACHED",
            questionId: null,
            metadata: {
              remainingTime: threshold,
            },
          })
        } catch (error) {
          console.error("Failed to log warning:", error);
        }

        setTriggeredWarnings((prev) => [...prev, threshold]);
      }
    });
  }, [timeLeft, triggeredWarnings]);

    const getBrowserMetadata = () => ({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      onlineStatus: navigator.onLine,
    });

  useEffect(() => {
    if (!duration || isSubmitted) return;

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
  
      logEvent({
        attemptId,
        eventType: "TIMER_STARTED",
        questionId: null,
        metadata: getBrowserMetadata(),
      });
    }

    timerRef.current = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((new Date(duration) - now) / 1000));

      setTimeLeft(diff);

      if (diff <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;

        clearInterval(timerRef.current);

        logEvent({
          attemptId,
          eventType: "TIMER_EXPIRED",
          questionId: null,
          metadata: getBrowserMetadata(),
        });
        logEvent({
          attemptId,
          eventType: "AUTO_SUBMIT",
          questionId: null,
          metadata: getBrowserMetadata(),
        });

        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [duration, isSubmitted]);

  useEffect(() => {
    if (isSubmitted) {
      clearInterval(timerRef.current);
    }
  }, [isSubmitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isWarning = timeLeft > 0 && timeLeft <= 300;
  const isCritical = timeLeft > 0 && timeLeft <= 60;
  const isExpired = timeLeft <= 0;

  const timerClass = [
    "timer",
    isExpired && "timer--expired",
    isCritical && "timer--critical",
    isWarning && !isCritical && "timer--warning",
  ]
    .filter(Boolean)
    .join(" ");

  const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return (
    <div className={timerClass} role="timer" aria-live="polite" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
      <span className="timer__icon" aria-hidden="true">
        <ClockIcon />
      </span>
      <span className="timer__content">
        <span className="timer__label">Time left</span>
        <span className="timer__value">{formatTime(timeLeft)}</span>
      </span>
    </div>
  );
};

export default TimerComponent;
