// BookDetail.jsx — View book details, ADMIN can update/delete

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export function BookDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState("");

  // Fetch book details by ID
  const fetchBook = async () => {
    try {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBook(data);
        setEditData({
          title: data.title,
          author: data.author,
          quantity: data.quantity,
          location: data.location,
        });
      } else {
        setMessage("Book not found");
      }
    } catch (err) {
      setMessage("Failed to fetch book");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  // Update book (ADMIN only)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setMessage("Book updated successfully!");
        setEditing(false);
        fetchBook();
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to update book");
      }
    } catch (err) {
      setMessage("Failed to update book");
    }
  };

  // Soft-delete book (ADMIN only)
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const response = await fetch(`${API_URL}/api/book/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        setMessage("Book deleted successfully!");
        setTimeout(() => navigate("/books"), 1000);
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to delete book");
      }
    } catch (err) {
      setMessage("Failed to delete book");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!book)
    return <p style={{ padding: "20px" }}>{message || "Book not found"}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/books")}
        style={{ marginBottom: "20px" }}
      >
        &larr; Back to Books
      </button>

      {message && (
        <div
          style={{ padding: "10px", marginBottom: "10px", color: "#4caf50" }}
        >
          {message}
        </div>
      )}

      {/* View mode */}
      {!editing ? (
        <div>
          <h2>{book.title}</h2>
          <table>
            <tbody>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Author</th>
                <td style={{ padding: "8px" }}>{book.author}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Quantity</th>
                <td style={{ padding: "8px" }}>{book.quantity}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Location</th>
                <td style={{ padding: "8px" }}>{book.location}</td>
              </tr>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                <td
                  style={{
                    padding: "8px",
                    color: book.status === "DELETED" ? "#f44336" : "#4caf50",
                  }}
                >
                  {book.status}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            {/* ADMIN actions */}
            {user.role === "ADMIN" && (
              <>
                <button onClick={() => setEditing(true)}>Edit</button>
                {book.status !== "DELETED" && (
                  <button onClick={handleDelete} style={{ color: "#f44336" }}>
                    Delete
                  </button>
                )}
              </>
            )}

            {/* USER borrow link */}
            {user.role === "USER" &&
              book.status === "ACTIVE" &&
              book.quantity > 0 && (
                <button onClick={() => navigate(`/borrow/${book._id}`)}>
                  Borrow This Book
                </button>
              )}
          </div>
        </div>
      ) : (
        /* Edit mode (ADMIN) */
        <form onSubmit={handleUpdate}>
          <h3>Edit Book</h3>
          <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
            <label>Title</label>
            <input
              type="text"
              value={editData.title}
              required
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <label>Author</label>
            <input
              type="text"
              value={editData.author}
              required
              onChange={(e) =>
                setEditData({ ...editData, author: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <label>Quantity</label>
            <input
              type="number"
              value={editData.quantity}
              required
              min="0"
              onChange={(e) =>
                setEditData({ ...editData, quantity: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <label>Location</label>
            <input
              type="text"
              value={editData.location}
              required
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
