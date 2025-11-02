import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { auth } from "../services/firebaseClient";
import {
  FaFilm,
  FaTv,
  FaSearch,
  FaUser,
  FaMoon,
  FaSun,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import "./NavigationBar.css";

const NavigationBar = ({ toggleTheme, theme }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await auth.signOut();
    setShowDropdown(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Navbar expand="lg" className="modern-navbar sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <FaFilm className="me-2" />
            <span className="brand-text">Cinephile Central</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link
                as={Link}
                to="/"
                className={`nav-item-custom ${isActive("/") ? "active" : ""}`}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/movies"
                className={`nav-item-custom ${
                  isActive("/movies") ? "active" : ""
                }`}
              >
                <FaFilm className="me-1" /> Movies
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/tv-shows"
                className={`nav-item-custom ${
                  isActive("/tv-shows") ? "active" : ""
                }`}
              >
                <FaTv className="me-1" /> TV Shows
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/search"
                className={`nav-item-custom ${
                  isActive("/search") ? "active" : ""
                }`}
              >
                <FaSearch className="me-1" /> Search
              </Nav.Link>
            </Nav>

            <Nav className="align-items-center">
              <Button
                variant="link"
                onClick={toggleTheme}
                className="theme-toggle"
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </Button>

              {currentUser ? (
                <div className="user-dropdown-wrapper" ref={dropdownRef}>
                  <Button
                    variant="link"
                    className="user-dropdown-toggle"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <FaUser className="me-1" />
                    {currentUser.displayName ||
                      currentUser.email?.split("@")[0] ||
                      "User"}
                  </Button>
                  {showDropdown && (
                    <div className="user-dropdown-menu">
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaUserCircle className="me-2" />
                        Profile
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <FaSignOutAlt className="me-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="login-btn"
                >
                  Login
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav d-lg-none">
        <Link
          to="/"
          className={`mobile-nav-item ${isActive("/") ? "active" : ""}`}
        >
          <FaHome />
          <span>Home</span>
        </Link>
        <Link
          to="/movies"
          className={`mobile-nav-item ${isActive("/movies") ? "active" : ""}`}
        >
          <FaFilm />
          <span>Movies</span>
        </Link>
        <Link
          to="/tv-shows"
          className={`mobile-nav-item ${isActive("/tv-shows") ? "active" : ""}`}
        >
          <FaTv />
          <span>TV</span>
        </Link>
        <Link
          to="/search"
          className={`mobile-nav-item ${isActive("/search") ? "active" : ""}`}
        >
          <FaSearch />
          <span>Search</span>
        </Link>
        <Link
          to={currentUser ? "/profile" : "/login"}
          className={`mobile-nav-item ${
            isActive("/profile") || isActive("/login") ? "active" : ""
          }`}
        >
          <FaUser />
          <span>{currentUser ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </>
  );
};

export default NavigationBar;
