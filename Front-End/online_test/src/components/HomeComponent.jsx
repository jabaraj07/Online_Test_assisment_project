import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./HomeComponent.css";

const STORAGE_KEY = "assessment_user_id";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
});

function isValidId(id) {
  return typeof id === "string" && id.trim().length > 0 && id !== "undefined";
}

const HomeComponent = () => {
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userId, setUserId] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  });
  const nav = useNavigate();
  const location = useLocation()

  useEffect(() => {
    if (!userId.trim()) return;
    if (location.pathname !== "/") return; 
  
    let cancelled = false;
  
    const checkAttemptStatus = async () => {
      try {
        const response = await api.get(
          `/attempt/status/${userId}`,
        );
  
        if (cancelled) return;
  
        const aid = response.data?.attemptId;
        if (!isValidId(aid)) return;
  
        if (response.data.status === "EXPIRED") {
          setIsCompleted(true);
          nav(`/result/${aid}`);
        } else if (response.data.status === "IN_PROGRESS") {
          const aid = response.data.attemptId;

          if (response.data.token) {
            sessionStorage.setItem("token", response.data.token);
          }
          nav(`/test/${aid}`);
        }
      } catch (error) {
        if (!cancelled) console.log("No existing attempt found");
      }
    };
  
    checkAttemptStatus();
  
    return () => {
      cancelled = true;
    };
  }, [userId, nav, location.pathname]);
  
  const handleStartTest = async () => {
    const id = userId.trim();
    if (!id) {
      alert("Please enter your User ID or email.");
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, id);
    setUserId(id);

    try {
      setLoading(true);

      // const response = await axios.post(
      //   "http://localhost:5000/api/attempt/start",
      //   {
      //     userId: id,
      //   },
      // );
      const response = await api.post(
        "/attempt/start",
        {
          userId: id,
        },
      );

      // console.log("Token : "+response.data.Token)

      if (response.status === 201) {
        const existingToken = sessionStorage.getItem("token");

        if (existingToken) {
          sessionStorage.removeItem("token");
        }
        sessionStorage.setItem("token", response.data.Token);
      }

      // console.log("Attempt started:", response.data);
      // console.log("Token : "+response.data?.Token)

      const aid = response.data?.attemptId;
      if (response.data?.status === "EXPIRED" && isValidId(aid)) {
        nav(`/result/${aid}`, { replace: true });
        return;
      }
      if (isValidId(aid)) {
        nav(`/test/${aid}`, {
          replace: true,
          state: { endTime: response.data.endTime },
        });
        return;
      }
    } catch (error) {
      setErrorMessage(null);
      const data = error.response?.data;
      const status = error.response?.status;

      if (
        data?.message === "Assessment already in progress" &&
        isValidId(data?.attemptId)
      ) {
        nav(`/test/${data.attemptId}`, {
          state: {
            attemptId: data.attemptId,
          },
        });
        return;
      }

      if (
        data?.message === "Assessment already completed" &&
        isValidId(data?.attemptId)
      ) {
        setIsCompleted(true);
        setErrorMessage({
          text: "You have already completed this assessment.",
          attemptId: data.attemptId,
        });
        return;
      }

      if (status !== 400) {
        console.error(
          "Error starting test:",
          error.response?.data?.message || error.message,
        );
      }
      setErrorMessage({
        text: data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchUser = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUserId("");
    setIsCompleted(false);
    setErrorMessage(null);
  };

  if (loading) {
    return (
      <div className="home__loading">
        <div style={{ textAlign: "center" }}>
          <div className="home__spinner" />
          <p className="home__loading-text">Starting assessment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home__card">
        <header className="home__header">
          <h1 className="home__title">Assessment Portal</h1>
          <p className="home__subtitle">
            Enter your ID or email to begin or resume your test
          </p>
        </header>

        {errorMessage && (
          <div className="home__alert">
            <p>{errorMessage.text}</p>
            {isValidId(errorMessage.attemptId) && (
              <button
                type="button"
                className="home__btn home__btn--secondary"
                onClick={() =>
                  isValidId(errorMessage.attemptId) &&
                  nav(`/result/${errorMessage.attemptId}`)
                }
              >
                View result
              </button>
            )}
          </div>
        )}

        <label className="home__field" htmlFor="userId">
          <span className="home__label">User ID / Email</span>
          <input
            id="userId"
            type="text"
            className="home__input"
            value={userId ?? ""}
            onChange={(e) => {
              setUserId(e.target.value ?? "");
              setErrorMessage(null);
            }}
            placeholder="e.g. john.doe@company.com or Employee ID"
            disabled={!!userId && isCompleted}
            autoComplete="off"
            data-form-type="other"
          />
        </label>

        <div className="home__actions">
          <button
            type="button"
            className="home__btn home__btn--primary"
            onClick={() => handleStartTest()}
            disabled={isCompleted}
          >
            {isCompleted ? "Test Completed" : "Start Test"}
          </button>
          {userId && (
            <button
              type="button"
              className="home__btn home__btn--secondary"
              onClick={handleSwitchUser}
            >
              Switch user
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
