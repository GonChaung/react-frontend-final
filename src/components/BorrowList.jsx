// BorrowList.jsx — View borrow requests with cancel capability
// ADMIN sees all requests and can cancel with CANCEL-ADMIN
// USER sees only their own requests and can cancel with CANCEL-USER

import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { useNavigate } from "react-router-dom";

export default function BorrowList() {
  const { user } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch borrow requests
  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        setBorrows(await response.json());
      }
    } catch (err) {
      setMessage("Failed to fetch borrow requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  // Cancel a borrow request
  const handleCancel = async (borrowId) => {
    if (!confirm("Are you sure you want to cancel this borrow request?"))
      return;

    // ADMIN uses CANCEL-ADMIN, USER uses CANCEL-USER
    const cancelStatus = user.role === "ADMIN" ? "CANCEL-ADMIN" : "CANCEL-USER";

    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ borrowId, requestStatus: cancelStatus }),
      });
      if (response.ok) {
        setMessage("Request cancelled successfully");
        fetchBorrows();
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to cancel request");
      }
    } catch (err) {
      setMessage("Failed to cancel request");
    }
  };

  // Color-code request statuses
  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "#4caf50";
      case "INIT":
        return "#2196f3";
      case "CLOSE-NO-AVAILABLE-BOOK":
        return "#f44336";
      case "CANCEL-ADMIN":
        return "#ff9800";
      case "CANCEL-USER":
        return "#ff9800";
      default:
        return "#888";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Borrow Requests</h2>
        <div>
          <button
            onClick={() => navigate("/books")}
            style={{ marginRight: "10px" }}
          >
            Books
          </button>
          <button onClick={() => navigate("/logout")}>Logout</button>
        </div>
      </div>

      <p style={{ marginBottom: "10px", color: "#888" }}>
        Logged in as: <strong>{user.email}</strong> (Role: {user.role})
        {user.role === "ADMIN" && " — Viewing all requests"}
      </p>

      {message && (
        <div
          style={{ padding: "10px", marginBottom: "10px", color: "#4caf50" }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading requests...</p>
      ) : borrows.length === 0 ? (
        <p>No borrow requests found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #555" }}>
              <th style={{ textAlign: "left", padding: "10px" }}>Book</th>
              {user.role === "ADMIN" && (
                <th style={{ textAlign: "left", padding: "10px" }}>User</th>
              )}
              <th style={{ textAlign: "left", padding: "10px" }}>Created</th>
              <th style={{ textAlign: "left", padding: "10px" }}>
                Target Date
              </th>
              <th style={{ textAlign: "center", padding: "10px" }}>Status</th>
              <th style={{ textAlign: "center", padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((borrow) => (
              <tr key={borrow._id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ padding: "10px" }}>{borrow.bookTitle}</td>
                {user.role === "ADMIN" && (
                  <td style={{ padding: "10px" }}>{borrow.userEmail}</td>
                )}
                <td style={{ padding: "10px" }}>
                  {new Date(borrow.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px" }}>
                  {new Date(borrow.targetDate).toLocaleDateString()}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    color: getStatusColor(
                      borrow.requestStatus || borrow.status,
                    ),
                    fontWeight: "bold",
                  }}
                >
                  {borrow.requestStatus || borrow.status}
                </td>
                <td style={{ textAlign: "center", padding: "10px" }}>
                  {/* Cancel button only for ACCEPTED or INIT requests */}
                  {(borrow.requestStatus === "ACCEPTED" ||
                    borrow.requestStatus === "INIT") && (
                    <button
                      onClick={() => handleCancel(borrow._id)}
                      style={{ color: "#f44336" }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
