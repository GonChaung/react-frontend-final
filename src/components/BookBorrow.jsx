// BookBorrow.jsx — Submit a book borrowing request

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function BookBorrow() {
  const { bookId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [book, setBook] = useState(null);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch book details for display
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`${API_URL}/api/book/${bookId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.ok) {
          setBook(await response.json());
        } else {
          setMessage("Book not found");
        }
      } catch (err) {
        setMessage("Failed to fetch book");
      }
      setLoading(false);
    };
    if (bookId) fetchBook();
  }, [bookId]);

  // Submit borrow request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ bookId, targetDate }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setMessage(data.message || "Failed to submit borrow request");
      }
    } catch (err) {
      setMessage("Failed to submit borrow request");
    }
    setSubmitting(false);
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/books")}
        style={{ marginBottom: "20px" }}
      >
        &larr; Back to Books
      </button>

      <h2>Borrow Request</h2>

      {message && (
        <div
          style={{ padding: "10px", marginBottom: "10px", color: "#f44336" }}
        >
          {message}
        </div>
      )}

      {/* Show result after submission */}
      {result ? (
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #444",
            marginBottom: "20px",
          }}
        >
          <h3>Request Submitted!</h3>
          <p>
            <strong>Book:</strong> {result.bookTitle}
          </p>
          <p>
            <strong>Target Date:</strong>{" "}
            {new Date(result.targetDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: result.status === "ACCEPTED" ? "#4caf50" : "#f44336",
                fontWeight: "bold",
              }}
            >
              {result.status}
            </span>
          </p>
          {result.status === "CLOSE-NO-AVAILABLE-BOOK" && (
            <p style={{ color: "#ff9800" }}>
              This book is currently not available for borrowing.
            </p>
          )}
          <button
            onClick={() => navigate("/books")}
            style={{ marginTop: "10px" }}
          >
            Back to Books
          </button>
        </div>
      ) : (
        /* Borrow form */
        book && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <p>
                <strong>Book:</strong> {book.title}
              </p>
              <p>
                <strong>Author:</strong> {book.author}
              </p>
              <p>
                <strong>Available quantity:</strong> {book.quantity}
              </p>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                <strong>Target Return Date:</strong>
              </label>
              <br />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                style={{ padding: "8px", marginTop: "5px", width: "100%" }}
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Borrow Request"}
            </button>
          </form>
        )
      )}
    </div>
  );
}
