// App.jsx — Main application routes

import "./App.css";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./middleware/RequireAuth";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Books from "./components/Books";
import { BookDetail } from "./components/BookDetail";
import BookBorrow from "./components/BookBorrow";
import BorrowList from "./components/BorrowList";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/logout"
        element={
          <RequireAuth>
            <Logout />
          </RequireAuth>
        }
      />
      {/* Book list page (protected) */}
      <Route
        path="/books"
        element={
          <RequireAuth>
            <Books />
          </RequireAuth>
        }
      />
      {/* Book detail page (protected) */}
      <Route
        path="/books/:id"
        element={
          <RequireAuth>
            <BookDetail />
          </RequireAuth>
        }
      />
      {/* Borrow request page (protected) */}
      <Route
        path="/borrow/:bookId"
        element={
          <RequireAuth>
            <BookBorrow />
          </RequireAuth>
        }
      />
      {/* Borrow request list page (protected) */}
      <Route
        path="/borrows"
        element={
          <RequireAuth>
            <BorrowList />
          </RequireAuth>
        }
      />
      {/* Default route redirects to books */}
      <Route
        path="*"
        element={
          <RequireAuth>
            <Books />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
