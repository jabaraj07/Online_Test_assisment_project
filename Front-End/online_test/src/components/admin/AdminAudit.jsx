import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axios/axiosConfig";
import "./AdminAudit.css";

export default function AdminAudit() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  console.log("events",events);

  useEffect(() => {
    axios.get(`/attempt/${attemptId}/events`)
      .then(res => {
        const sorted = res.data.events.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setEvents(sorted);
      });
  }, [attemptId]);

  const violationTypes = [
    "TAB_SWITCH",
    "FULLSCREEN_EXIT",
    "COPY_ATTEMPT",
    "DEVTOOLS_ATTEMPT",
    "TAB_HIDDEN",
    "TAB_VISIBLE",
    "REFRESH_DETECTED",
    "RIGHT_CLICK_BLOCKED",
    "VIOLATION_LIMIT_REACHED",
    "KEYBOARD_SHORTCUT_BLOCKED"
  ];

  const violationCount = events.filter(e =>
    violationTypes.includes(e.eventType)
  ).length;

  const getEventBadgeClass = (eventType) => {
    if (violationTypes.includes(eventType)) {
      return "badge badge-violation";
    }
    return "badge badge-normal";
  };

  const getSeverityLevel = () => {
    if (violationCount === 0) return { label: "Clean", class: "severity-clean" };
    if (violationCount <= 3) return { label: "Low", class: "severity-low" };
    if (violationCount <= 7) return { label: "Medium", class: "severity-medium" };
    return { label: "High", class: "severity-high" };
  };

  const severity = getSeverityLevel();

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div className="header-top">
          <button 
            className="back-button"
            onClick={() => navigate("/admin/attempts")}
          >
            <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Attempts
          </button>
          <h2 className="audit-title">Audit Trail</h2>
          <div className="attempt-id-badge">Attempt ID: {attemptId}</div>
        </div>
        <div className="audit-stats">
          <div className={`stat-card ${severity.class}`}>
            <div className="stat-label">Total Violations</div>
            <div className="stat-value">{violationCount}</div>
            <div className="stat-severity">{severity.label} Risk</div>
          </div>
          <div className="stat-card stat-secondary">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{events.length}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>Question ID</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-state">
                  No events recorded
                </td>
              </tr>
            ) : (
              events.map((e, index) => (
                <tr key={index} className={violationTypes.includes(e.eventType) ? "violation-row" : ""}>
                  <td className="timestamp-cell">
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className={getEventBadgeClass(e.eventType)}>
                      {e.eventType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="question-cell">{e.questionId || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}