import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ResultPage.css";
import { getAttemptById } from "../services/api";

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId } = useParams();
  const [data,setData] = useState()
  const reason = location.state?.reason;

  console.log("Location Data In Result Page "+JSON.stringify(location))

  const isViolation = reason === "VIOLATION_LIMIT";

  useEffect(()=>{

    const fetchAttempt = async()=>{
      try {
        const attempt = await getAttemptById(attemptId)
        // console.log("Data In Result Page : "+attempt);
        setData(attempt);
      } catch (error) {
        console.error("Failed to fetch attempt:", error);
      }
    }
    if (attemptId) {
      fetchAttempt();
    }
  },[attemptId])


  return (
    <div className="result-page-wrapper">
      <div className="result-background-pattern"></div>
      
      <div className="result-main-container">
        <div className={`result-status-card ${isViolation ? 'violation-mode' : 'success-mode'}`}>
          
          {/* Animated Status Icon */}
          <div className="status-icon-container">
            {isViolation ? (
              <div className="icon-circle violation-circle">
                <svg className="status-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : (
              <div className="icon-circle success-circle">
                <svg className="status-svg checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Main Message */}
          <div className="result-text-container">
            <h1 className="result-main-title">
              {isViolation ? "Assessment Terminated" : "Submission Complete"}
            </h1>
            
            <p className="result-description">
              {isViolation
                ? "Your assessment was automatically ended due to multiple policy violations detected during the exam session."
                : "Your responses have been successfully submitted and recorded. Thank you for completing the assessment."}
            </p>
          </div>

          {/* Details Section */}
          <div className="result-details-grid">
            <div className="detail-card">
              <div className="detail-icon-wrapper">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Status</span>
                <span className={`detail-value ${isViolation ? 'text-warning' : 'text-success'}`}>
                  {isViolation ? "Auto-Terminated" : "Submitted"}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon-wrapper">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Time</span>
                <span className="detail-value">
                  {new Date(data?.submittedAt).toLocaleString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon-wrapper">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="detail-content">
                <span className="detail-label">Date</span>
                <span className="detail-value">
                  {new Date(data?.submittedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Alert Banner for Violations */}
          {isViolation && (
            <div className="alert-banner">
              <svg className="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="alert-text">
                <strong>Important:</strong> This termination may impact your assessment results. 
                If you believe this was an error, please contact support immediately.
              </div>
            </div>
          )}

          {/* Next Steps Section */}
          <div className="next-steps-section">
            <h3 className="next-steps-title">What happens next?</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <span className="step-text">
                  {isViolation 
                    ? "Your proctor will review the violation details"
                    : "Your responses will be evaluated by our team"}
                </span>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <span className="step-text">
                  {isViolation
                    ? "You may be contacted for additional information"
                    : "Results will be processed within 3-5 business days"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate("/")}>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultPage;