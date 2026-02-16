import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttemptById,
  logEvent,
  flushPendingEvents,
  getQuestions,
  getAttemptAnswers,
  saveAnswers,
  submitTest,
} from "../services/api";
import TimerComponent from "./TimerComponent";
import { EventLoggerProvider } from "../context/EventLoggerContext";
import useProctoring from "../hooks/useProctoring";
import "./TestPageComponent.css";

const TestPageComponent = () => {
  const { attemptId } = useParams();
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // console.log("currentQuestionId",currentQuestionId);

  // const location = useLocation();
  const navigate = useNavigate();

  const persistAnswers = useCallback(
    async (answersToSave) => {
      if (!attemptId || isSubmitted) return;
      const payload = Object.entries(answersToSave).map(([questionId, value]) => ({
        questionId,
        value: value ?? "",
      }));
      if (payload.length === 0) return;
      try {
        setSaving(true);
        await saveAnswers(attemptId, payload);
      } catch (err) {
        console.error("Failed to save answers:", err);
      } finally {
        setSaving(false);
      }
    },
    [attemptId, isSubmitted]
  );

  const performSubmit = async (answersToSave,reason = "NORMAL") => {
    // console.log("Navigating to result")
    if (isSubmitted) return;
    try {
      setIsSubmitted(true);
      await persistAnswers(answersToSave ?? answersRef.current);
      logEvent({
        attemptId,
        eventType: reason === "VIOLATION_LIMIT" ? "AUTO_SUBMITTED" : "TEST_SUBMITTED",
        questionId: null,
        metadata: getBrowserMetadata(),
      });
      await submitTest(attemptId);
      sessionStorage.removeItem("assessment_user_id");
      sessionStorage.removeItem("token");
      if (attemptId) navigate(`/result/${attemptId}`, { replace: true, state: { reason: reason } });
    } catch (error) {
      console.error("Error submitting test:", error);
      setIsSubmitted(false);
    }
  };

  const handleSubmit = () => performSubmit(answers);
  const handleViolationLimit = () => {
    performSubmit(answersRef.current,"VIOLATION_LIMIT");
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerBlur = useCallback(() => {
    persistAnswers(answersRef.current);
  }, [persistAnswers]);


  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Fullscreen failed:", err);
      }
    };
  
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
  
    enterFullscreen();
  
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  

  useProctoring({
    attemptId,
    onViolationLimitReached: handleViolationLimit,
    questionId: currentQuestionId,
  });

  const getBrowserMetadata = () => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    onlineStatus: navigator.onLine,
  });

  useEffect(() => {
    fetchUserDetails();
  }, [attemptId]);

  useEffect(() => {
    const load = async () => {
      try {
        const { questions: qs } = await getQuestions();
        setQuestions(qs || []);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!attemptId) return;
    const load = async () => {
      try {
        const { answers: saved } = await getAttemptAnswers(attemptId);
        if (saved && typeof saved === "object") setAnswers((prev) => ({ ...prev, ...saved }));
      } catch (err) {
        console.error("Failed to load saved answers:", err);
      }
    };
    load();
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    flushPendingEvents(attemptId);
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    const handleVisible = () => {
      if (document.visibilityState === "visible") {
        flushPendingEvents(attemptId);
      }
    };
    document.addEventListener("visibilitychange", handleVisible);
    return () => document.removeEventListener("visibilitychange", handleVisible);
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId) return;
    const checkAttemptStatus = async () => {
      try {
        const data = await getAttemptById(attemptId);
        if (data?.status === "EXPIRED" || data?.status === "SUBMITTED") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("assessment_user_id");

          navigate(`/result/${attemptId}`, { replace: true });
        }
      } catch (error) {
        console.error("Check attempt failed:", error);
      }
    };
    checkAttemptStatus();
  }, [attemptId, navigate]);

  const fetchUserDetails = async () => {
    try {
      // const response = await axios.get(
      //   `http://localhost:5000/api/attempt/${attemptId}`,
      // );
      const response = await getAttemptById(attemptId)
      setAttemptDetails(response);
    } catch (error) {
      console.error("Error fetching attempt details:", error);
    }
  };

  return (
    <div className="test-page">
      <EventLoggerProvider attemptId={attemptId}>
        <header className="test-page__header">
          {attemptDetails?.attemptId && (
            <TimerComponent
              attemptId={attemptDetails.attemptId}
              duration={attemptDetails.endTime || 0}
              isSubmitted={isSubmitted}
              onExpire={handleSubmit}
            />
          )}
          {saving && <span className="test-page__saving">Saving…</span>}
        </header>

        <section className="test-page__instructions" aria-label="Test instructions">
          <h2 className="test-page__instructions-title">Instructions – Please read carefully</h2>
          <p className="test-page__instructions-intro">
            To keep the assessment fair, the following are monitored. <strong>If you reach 3 violations, your test will be auto-submitted immediately.</strong>
          </p>
          <ul className="test-page__instructions-list">
            <li>Do <strong>not</strong> exit fullscreen. Keep the test window in fullscreen for the entire duration.</li>
            <li>Do <strong>not</strong> switch tabs or open other windows or applications. Stay on this tab.</li>
            <li>Do <strong>not</strong> copy or paste. Type your answers only. Copy and paste attempts are logged.</li>
            <li>Do <strong>not</strong> right-click on the page. Context menu is disabled.</li>
            <li>Do <strong>not</strong> open Developer Tools (e.g. F12). Such attempts are logged and count as violations.</li>
            <li>Do <strong>not</strong> use keyboard shortcuts such as Ctrl+C, Ctrl+V, Ctrl+U, or Ctrl+S. They are blocked and logged.</li>
          </ul>
          <p className="test-page__instructions-warning">
            After <strong>3 violations</strong>, your test will be automatically submitted and you will not be able to continue.
          </p>
        </section>

        <main className="test-page__main">
          <h2 className="test-page__title">Assessment Questions</h2>
          <p className="test-page__hint">
            Type your answers in the boxes below. Copy/paste is monitored and will be logged.
          </p>

          {questions.length === 0 && (
            <p className="test-page__empty">Loading questions…</p>
          )}
          {questions.map((q) => (
            <section key={q.questionId} className="test-page__question">
              <label className="test-page__question-label" htmlFor={`q-${q.questionId}`}>
                {q.text}
              </label>
              <textarea
                id={`q-${q.questionId}`}
                className="test-page__input"
                value={answers[q.questionId] ?? ""}
                onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                onBlur={handleAnswerBlur}
                placeholder="Type your answer here..."
                rows={4}
                disabled={isSubmitted}
                onFocus={() => setCurrentQuestionId(q.questionId)}
              />
            </section>
          ))}
        </main>

        <footer className="test-page__footer">
          <button
            type="button"
            className="test-page__submit"
            disabled={isSubmitted}
            onClick={() => handleSubmit()}
          >
            {isSubmitted ? "Submitted" : "Submit test"}
          </button>
        </footer>
      </EventLoggerProvider>
    </div>
  );
};

export default TestPageComponent;
