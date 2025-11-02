import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaFilm,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaHeart,
} from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="modern-footer">
      <Container>
        <Row className="footer-content">
          {/* Brand Section */}
          <Col lg={4} md={6} className="footer-section mb-4 mb-lg-0">
            <div className="footer-brand">
              <FaFilm className="footer-logo-icon" />
              <h3 className="footer-brand-text">Cinephile Central</h3>
            </div>
            <p className="footer-description">
              Your ultimate destination for discovering and exploring movies and
              TV shows. Dive into a world of entertainment with personalized
              recommendations and community reviews.
            </p>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6} className="footer-section mb-4 mb-lg-0">
            <h4 className="footer-heading">Explore</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" onClick={scrollToTop}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" onClick={scrollToTop}>
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-shows" onClick={scrollToTop}>
                  TV Shows
                </Link>
              </li>
              <li>
                <Link to="/search" onClick={scrollToTop}>
                  Search
                </Link>
              </li>
            </ul>
          </Col>

          {/* Account Links */}
          <Col lg={2} md={6} className="footer-section mb-4 mb-lg-0">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li>
                <Link to="/login" onClick={scrollToTop}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={scrollToTop}>
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={scrollToTop}>
                  Profile
                </Link>
              </li>
            </ul>
          </Col>

          {/* About Section */}
          <Col lg={4} md={6} className="footer-section">
            <h4 className="footer-heading">About This Project</h4>
            <div className="project-info">
              <p className="author-info">
                <span className="label">Created by:</span>
                <span className="name">Jelani Lefatle</span>
              </p>
              <p className="university-info">
                <span className="label">Academic Project for:</span>
                <span className="university">
                  Limkokwing University of Creative Technology
                </span>
              </p>
            </div>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© {currentYear} Cinephile Central. Made by Jelani Lefatle</p>
          </div>
          <div className="footer-credits">
            <p>
              Powered by{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="tmdb-link"
              >
                TMDB API
              </a>
            </p>
          </div>
        </div>
      </Container>

      {/* Decorative Elements */}
      <div className="footer-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </footer>
  );
};

export default Footer;
