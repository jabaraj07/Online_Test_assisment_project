// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "../../axios/axiosConfig";

// export default function AdminAnswer() {
//   const { attemptId } = useParams();
//   const [answers, setAnswers] = useState([]);

// //   useEffect(() => {
// //     axios.get(`/admin/attempt/${attemptId}/answers`)
// //       .then(res => {
// //         console.log(res.data);
// //         setAnswers(res.data.answers);
// //       })
// //       .catch(err => {
// //         console.error(err);
// //       });
// //   }, [attemptId]);

// useEffect(() => {
//     axios.get(`/admin/attempt/${attemptId}/answers`)
//       .then(res => {
//         const answerObj = res.data.answers;
  
//         // convert object → array
//         const answerArray = Object.entries(answerObj);
  
//         setAnswers(answerArray);
//       });
//   }, [attemptId]);
  
//   return (
//     <div>
//       <h2>Descriptive Answers</h2>

//       {/* {answers.length === 0 ? (
//         <p>No Answers Submitted</p>
//       ) : (
//         answers.map((a, index) => (
//           <div key={a._id} style={{
//             border: "1px solid #ccc",
//             padding: "10px",
//             marginBottom: "10px"
//           }}>
//             <h4>Question {index + 1}</h4>

//             {a.textAnswer?.trim() ? (
//               <p>{a.textAnswer}</p>
//             ) : (
//               <p style={{ color: "gray" }}>Not Attempted</p>
//             )}
//           </div>
//         ))
//       )} */}


// {answers.length === 0 ? (
//   <p>No Answers Submitted</p>
// ) : (
//   answers.map(([questionId, text], index) => (
//     <div key={questionId} style={{
//       border: "1px solid #ccc",
//       padding: "10px",
//       marginBottom: "10px"
//     }}>
//       <h4>{questionId}</h4>

//       {text?.trim() ? (
//         <p>{text}</p>
//       ) : (
//         <p style={{ color: "gray" }}>Not Attempted</p>
//       )}
//     </div>
//   ))
// )}

//     </div>
//   );
// }





// AdminAnswer.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axios/axiosConfig";
import "./AdminAnswer.css";

export default function AdminAnswer() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    axios.get(`/admin/attempt/${attemptId}/answers`)
      .then(res => {
        const answerObj = res.data.answers;
        // convert object → array
        const answerArray = Object.entries(answerObj);
        setAnswers(answerArray);
      });
  }, [attemptId]);

  const answeredCount = answers.filter(([, text]) => text?.trim()).length;
  const notAttemptedCount = answers.length - answeredCount;

  return (
    <div className="answers-container">
      <div className="answers-header">
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
          <h2 className="answers-title">Descriptive Answers</h2>
          <div className="attempt-id-badge">Attempt ID: {attemptId}</div>
        </div>

        <div className="answers-stats">
          <div className="stat-card stat-total">
            <div className="stat-label">Total Questions</div>
            <div className="stat-value">{answers.length}</div>
          </div>
          <div className="stat-card stat-answered">
            <div className="stat-label">Answered</div>
            <div className="stat-value">{answeredCount}</div>
          </div>
          <div className="stat-card stat-not-attempted">
            <div className="stat-label">Not Attempted</div>
            <div className="stat-value">{notAttemptedCount}</div>
          </div>
        </div>
      </div>

      <div className="answers-content">
        {answers.length === 0 ? (
          <div className="empty-state-card">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="empty-message">No Answers Submitted</p>
          </div>
        ) : (
          answers.map(([questionId, text], index) => (
            <div key={questionId} className={`answer-card ${!text?.trim() ? 'not-attempted' : ''}`}>
              <div className="answer-card-header">
                <div className="question-number">Question {index + 1}</div>
                <div className="question-id">{questionId}</div>
                {!text?.trim() && (
                  <span className="not-attempted-badge">Not Attempted</span>
                )}
              </div>

              <div className="answer-content">
                {text?.trim() ? (
                  <p className="answer-text">{text}</p>
                ) : (
                  <p className="no-answer-text">
                    <svg className="no-answer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    No answer provided
                  </p>
                )}
              </div>

              {text?.trim() && (
                <div className="answer-footer">
                  <span className="word-count">
                    {text.trim().split(/\s+/).length} words
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}