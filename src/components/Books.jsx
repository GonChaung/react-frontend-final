// Books.jsx — Book list with search filters and admin create form

import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { useNavigate } from "react-router-dom";

export default function Books() {
  const { user } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleFilter, setTitleFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    quantity: 1,
    location: "",
  });
  const [message, setMessage] = useState("");

  // Fetch books with optional search filters
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (titleFilter) params.append("title", titleFilter);
      if (authorFilter) params.append("author", authorFilter);

      const response = await fetch(`${API_URL}/api/book?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (err) {
      setMessage("Failed to fetch books");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  // Create book handler (ADMIN only)
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(newBook),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Book created successfully!");
        setNewBook({ title: "", author: "", quantity: 1, location: "" });
        setShowCreateForm(false);
        fetchBooks();
      } else {
        setMessage(data.message || "Failed to create book");
      }
    } catch (err) {
      setMessage("Failed to create book");
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
        <h2>Books</h2>
        <div>
          <button
            onClick={() => navigate("/logout")}
            style={{ marginLeft: "10px" }}
          >
            Logout
          </button>
        </div>
      </div>

      <p style={{ marginBottom: "10px", color: "#888" }}>
        Logged in as: <strong>{user.email}</strong> (Role: {user.role})
      </p>

      {/* Search filters */}
      <form
        onSubmit={handleSearch}
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by title..."
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          style={{ padding: "8px", flex: 1, minWidth: "150px" }}
        />
        <input
          type="text"
          placeholder="Search by author..."
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          style={{ padding: "8px", flex: 1, minWidth: "150px" }}
        />
        <button type="submit">Search</button>
        <button
          type="button"
          onClick={async () => {
            setTitleFilter("");
            setAuthorFilter("");
            // Fetch all books directly without relying on state
            setLoading(true);
            try {
              const response = await fetch(`${API_URL}/api/book`, {
                headers: { Authorization: `Bearer ${user.token}` },
              });
              if (response.ok) setBooks(await response.json());
            } catch (err) {}
            setLoading(false);
          }}
        >
          Clear
        </button>
      </form>

      {/* Admin: Create book button */}
      {user.role === "ADMIN" && (
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ marginBottom: "15px" }}
        >
          {showCreateForm ? "Cancel" : "+ Create Book"}
        </button>
      )}

      {/* Admin: Create book form */}
      {showCreateForm && user.role === "ADMIN" && (
        <form
          onSubmit={handleCreate}
          style={{
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>Create New Book</h3>
          <div style={{ display: "grid", gap: "10px", maxWidth: "400px" }}>
            <input
              type="text"
              placeholder="Title"
              required
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <input
              type="text"
              placeholder="Author"
              required
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <input
              type="number"
              placeholder="Quantity"
              required
              min="0"
              value={newBook.quantity}
              onChange={(e) =>
                setNewBook({ ...newBook, quantity: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <input
              type="text"
              placeholder="Location"
              required
              value={newBook.location}
              onChange={(e) =>
                setNewBook({ ...newBook, location: e.target.value })
              }
              style={{ padding: "8px" }}
            />
            <button type="submit">Create</button>
          </div>
        </form>
      )}

      {/* Message display */}
      {message && (
        <div
          style={{ padding: "10px", marginBottom: "10px", color: "#4caf50" }}
        >
          {message}
        </div>
      )}

      {/* Book list table */}
      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #555" }}>
              <th style={{ textAlign: "left", padding: "10px" }}>Title</th>
              <th style={{ textAlign: "left", padding: "10px" }}>Author</th>
              <th style={{ textAlign: "center", padding: "10px" }}>Qty</th>
              <th style={{ textAlign: "left", padding: "10px" }}>Location</th>
              {user.role === "ADMIN" && (
                <th style={{ textAlign: "center", padding: "10px" }}>Status</th>
              )}
              <th style={{ textAlign: "center", padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ padding: "10px" }}>{book.title}</td>
                <td style={{ padding: "10px" }}>{book.author}</td>
                <td style={{ textAlign: "center", padding: "10px" }}>
                  {book.quantity}
                </td>
                <td style={{ padding: "10px" }}>{book.location}</td>
                {user.role === "ADMIN" && (
                  <td
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      color: book.status === "DELETED" ? "#f44336" : "#4caf50",
                    }}
                  >
                    {book.status}
                  </td>
                )}
                <td style={{ textAlign: "center", padding: "10px" }}>
                  <button
                    onClick={() => navigate(`/books/${book._id}`)}
                    style={{ marginRight: "5px" }}
                  >
                    View
                  </button>
                  {user.role === "USER" && book.quantity > 0 && (
                    <button onClick={() => navigate(`/borrow/${book._id}`)}>
                      Borrow
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
