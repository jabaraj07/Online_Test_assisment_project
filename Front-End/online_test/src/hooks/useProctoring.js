import { useCallback, useEffect, useRef } from "react";
import { logEvent } from "../services/api";

const useProctoring = ({ attemptId, onViolationLimitReached, questionId }) => {
  const violationCount = useRef(0);

  const questionIdRef = useRef(questionId);

  useEffect(() => {
    questionIdRef.current = questionId;
  }, [questionId]);

  // console.log("questionIdRef in useProctoring", questionIdRef.current);
  const getBrowserMetadata = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    onlineStatus: navigator.onLine,
  });

    const checkViolationLimit = useCallback(() => {
  if (violationCount.current >= 10) {
    logEvent({
      attemptId,
      eventType: "VIOLATION_LIMIT_REACHED",
      questionId: null,
      metadata: getBrowserMetadata(),
    });

    if (onViolationLimitReached) {
      onViolationLimitReached();
    }
  }
}, [attemptId, onViolationLimitReached]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        violationCount.current++;

        logEvent(
          {
            attemptId,
            eventType: "FULLSCREEN_EXIT",
            questionId: null,
            metadata: getBrowserMetadata(),
          },
          { useBeacon: true },
        );
        console.log("Full screen Exit – event sent (proctoring)");

        checkViolationLimit();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [attemptId,checkViolationLimit]);

  useEffect(() => {
    const handleVisisbilityChange = () => {
      if (document.hidden) {
        violationCount.current++;
        const meta = {
          focusState: document.visibilityState,
          timestamp: new Date().toISOString(),
          ...getBrowserMetadata(),
        };

        logEvent(
          {
            attemptId,
            eventType: "TAB_HIDDEN",
            questionId: null,
            metadata: meta,
          },
          { useBeacon: true },
        );

        logEvent(
          {
            attemptId,
            eventType: "FOCUS_LOST",
            questionId: null,
            metadata: { ...meta, visibilityState: document.visibilityState },
          },
          { useBeacon: true },
        );
        console.log("Tab Hidden – events sent (proctoring)");
        checkViolationLimit();
      } else {
        logEvent({
          attemptId,
          eventType: "TAB_VISIBLE",
          questionId: null,
          metadata: {
            timestamp: new Date().toISOString(),
            focusState: document.visibilityState,
          },
        });
        console.log("Tab_visible");
      }
    };
    document.addEventListener("visibilitychange", handleVisisbilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisisbilityChange);
    };
  }, [attemptId, checkViolationLimit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationCount.current++;

        logEvent(
          {
            attemptId,
            eventType: "TAB_SWITCH",
            questionId: null,
            metadata: getBrowserMetadata(),
          },
          { useBeacon: true },
        );

        checkViolationLimit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attemptId, checkViolationLimit]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setTimeout(() => {
          if (!document.fullscreenElement) {
            violationCount.current++;

            logEvent(
              {
                attemptId,
                eventType: "FULLSCREEN_EXIT",
                questionId: null,
                metadata: getBrowserMetadata(),
              },
              { useBeacon: true },
            );

            checkViolationLimit();
          }
        }, 100);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [attemptId, checkViolationLimit]);

  useEffect(() => {
    const handleCopy = () => {
      violationCount.current++;
      logEvent({
        attemptId,
        eventType: "COPY_ATTEMPT",
        questionId: questionIdRef.current || null,
        metadata: getBrowserMetadata(),
      });
      console.log("Copy Attempt");
      checkViolationLimit();
    };

    const handlePaste = () => {
      violationCount.current++;
      logEvent({
        attemptId,
        eventType: "PASTE_ATTEMPT",
        questionId: questionIdRef.current || null,
        metadata: getBrowserMetadata(),
      });
      console.log("Paste Attempt");
      checkViolationLimit();
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [attemptId, questionId, checkViolationLimit]);

  useEffect(() => {
    const handleRightClick = (e) => {
      e.preventDefault();
      violationCount.current++;
      logEvent({
        attemptId,
        eventType: "RIGHT_CLICK_BLOCKED",
        questionId: questionIdRef.current || null,
        metadata: getBrowserMetadata(),
      });
      console.log("Right Click Blocked");
      checkViolationLimit();
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J")
      ) {
        e.preventDefault();
        violationCount.current++;
        logEvent({
          attemptId,
          eventType: "DEVTOOLS_ATTEMPT",
          questionId: null,
          metadata: getBrowserMetadata(),
        });
        console.log("DevTools Attempt");
        checkViolationLimit();
      }

      if (e.key === "Escape" && !document.fullscreenElement) {
        console.log("Escape button pressed");

        violationCount.current++;
        logEvent({
          attemptId,
          eventType: "FULLSCREEN_EXIT",
          questionId: questionIdRef.current || null,
          metadata: getBrowserMetadata(),
        });
        console.log("ESC pressed – fullscreen exit violation");
        checkViolationLimit();
      }

      if (e.ctrlKey && ["c", "v", "u", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        violationCount.current++;
        console.log(
          `Keyboard shortcut blocked (Ctrl+${e.key.toUpperCase()}) – logged as violation`,
        );
        logEvent({
          attemptId,
          eventType: "KEYBOARD_SHORTCUT_BLOCKED",
          questionId: questionIdRef.current || null,
          metadata: {
            key: e.key,
          },
        });
        checkViolationLimit();
      }
    };

    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [attemptId, questionId, checkViolationLimit]);

  // const checkViolationLimit = () => {
  //   if (violationCount.current >= 10) {
  //     logEvent({
  //       attemptId,
  //       eventType: "VIOLATION_LIMIT_REACHED",
  //       questionId: null,
  //       metadata: getBrowserMetadata(),
  //     });

  //     if (onViolationLimitReached) {
  //       onViolationLimitReached();
  //     }
  //   }
  // };




};

export default useProctoring;
