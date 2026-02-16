// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "../../axios/axiosConfig";

// export default function AdminAttempts() {
//   const [attempts, setAttempts] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios.get("/admin/attempts")
//       .then(res => setAttempts(res.data));
//   }, []);
//   console.log(attempts.map(a=>a.attemptId));

//   return (
//     <div>
//       <h2>Candidate Attempts</h2>

//       <table border="1">
//         <thead>
//           <tr>
//             <th>Candidate</th>
//             <th>Status</th>
//             <th>Score</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {attempts.map(a => (
//             <tr key={a._id}>
//               <td>{a.userId}</td>
//               <td>{a.status}</td>
//               <td>{a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "N/A"}</td>
//               <td>
//                     <button onClick={() => navigate(`/admin/attempt/${a.attemptId}`)}>
//                   View Audit
//                 </button>
//                 <button onClick={() => navigate(`/admin/attempt/${a.attemptId}/answers`)}>
//                   View Answers
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }






// AdminAttempts.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios/axiosConfig";
import "./AdminAttempts.css";

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/admin/attempts")
      .then(res => setAttempts(res.data));
  }, []);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("adminToken");
    // Navigate to login page
    navigate("/admin/login");
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "submitted":
        return "status-badge status-completed";
      case "in_progress":
      case "in-progress":
        return "status-badge status-progress";
      case "abandoned":
      case "timeout":
        return "status-badge status-abandoned";
      default:
        return "status-badge status-default";
    }
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, " ").replace(/-/g, " ") || "Unknown";
  };

  return (
    <div className="attempts-container">
      <div className="attempts-header">
        <div className="header-row">
          <h2 className="attempts-title">Candidate Attempts</h2>
          <button className="logout-button" onClick={handleLogout}>
            <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
        <div className="attempts-stats">
          <div className="stat-badge">
            <span className="stat-badge-value">{attempts.length}</span>
            <span className="stat-badge-label">Total Attempts</span>
          </div>
          <div className="stat-badge">
            <span className="stat-badge-value">
              {attempts.filter(a => a.status?.toLowerCase() === "completed" || a.status?.toLowerCase() === "submitted").length}
            </span>
            <span className="stat-badge-label">Completed</span>
          </div>
          <div className="stat-badge">
            <span className="stat-badge-value">
              {attempts.filter(a => a.status?.toLowerCase() === "in_progress" || a.status?.toLowerCase() === "in-progress").length}
            </span>
            <span className="stat-badge-label">In Progress</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="attempts-table">
          <thead>
            <tr>
              <th>Candidate ID</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  No attempts found
                </td>
              </tr>
            ) : (
              attempts.map(a => (
                <tr key={a._id}>
                  <td className="candidate-cell">
                    <div className="candidate-id">{a.userId}</div>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(a.status)}>
                      {formatStatus(a.status)}
                    </span>
                  </td>
                  <td className="timestamp-cell">
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—"}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn btn-primary"
                      onClick={() => navigate(`/admin/attempt/${a.attemptId}`)}
                    >
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Audit Trail
                    </button>
                    <button 
                      className="action-btn btn-secondary"
                      onClick={() => navigate(`/admin/attempt/${a.attemptId}/answers`)}
                    >
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Answers
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}