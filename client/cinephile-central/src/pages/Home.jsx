import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Carousel,
  Tabs,
  Tab,
  Badge,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { tmdbService } from "../services/api";
import MovieCard from "../components/MovieCard";
import { FaPlay, FaInfoCircle, FaFire, FaStar } from "react-icons/fa";

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("movies");

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setError("");
      setLoading(true);

      // Fetch trending movies for hero section
      const trendingRes = await tmdbService.getTrendingMovies();
      setTrendingMovies(trendingRes.data.results.slice(0, 5));

      // Fetch popular movies
      const popularRes = await tmdbService.getPopularMovies();
      setPopularMovies(popularRes.data.results.slice(0, 10));

      // Fetch upcoming movies
      const upcomingRes = await tmdbService.getUpcomingMovies();
      setUpcomingMovies(upcomingRes.data.results.slice(0, 10));
    } catch (err) {
      setError("Failed to fetch content. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="loading-container text-center"
        style={{ paddingTop: "5rem" }}
      >
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading amazing content...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      {trendingMovies.length > 0 && (
        <Carousel className="hero-carousel" interval={5000}>
          {trendingMovies.map((movie) => (
            <Carousel.Item key={movie.id}>
              <div className="carousel-backdrop">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  className="d-block w-100"
                />
                <div className="carousel-overlay" />
              </div>
              <Carousel.Caption className="hero-caption">
                <div className="hero-badge-group mb-3">
                  <Badge bg="danger" className="hero-badge">
                    <FaFire /> Trending
                  </Badge>
                  <Badge bg="dark" className="hero-badge">
                    {new Date(movie.release_date).getFullYear()}
                  </Badge>
                </div>
                <h1 className="hero-title">{movie.title}</h1>
                <p className="hero-description">
                  {movie.overview.length > 200
                    ? movie.overview.substring(0, 200) + "..."
                    : movie.overview}
                </p>
                <div className="d-flex gap-3 align-items-center justify-content-center mb-3">
                  <span className="badge bg-warning text-dark fs-6">
                    <FaStar /> {movie.vote_average.toFixed(1)}
                  </span>
                  <span className="badge bg-light text-dark fs-6">
                    {movie.vote_count.toLocaleString()} votes
                  </span>
                </div>
                <div className="hero-actions d-flex gap-3 justify-content-center">
                  <Link
                    to={`/movie/${movie.id}`}
                    className="btn btn-primary btn-lg hero-btn"
                  >
                    <FaInfoCircle className="me-2" />
                    View Details
                  </Link>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="btn btn-outline-light btn-lg hero-btn"
                  >
                    <FaPlay className="me-2" />
                    Watch Trailer
                  </Link>
                </div>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      )}

      <Container className="content-section">
        {/* Trending Section */}
        <section className="mb-5">
          <div className="section-header">
            <h2 className="section-title">🔥 Trending Now</h2>
            <Link to="/movies" className="see-all-link">
              See All →
            </Link>
          </div>
          <Row xs={2} sm={3} md={4} lg={5} className="g-4">
            {trendingMovies.map((movie) => (
              <Col key={movie.id}>
                <MovieCard movie={movie} type="movie" />
              </Col>
            ))}
          </Row>
        </section>

        {/* Popular Movies & Upcoming Tabs */}
        <section>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4 custom-tabs"
          >
            <Tab eventKey="movies" title="Popular Movies">
              <Row xs={2} sm={3} md={4} lg={5} className="g-4">
                {popularMovies.map((movie) => (
                  <Col key={movie.id}>
                    <MovieCard movie={movie} type="movie" />
                  </Col>
                ))}
              </Row>
            </Tab>

            <Tab eventKey="upcoming" title="Coming Soon">
              <Row xs={2} sm={3} md={4} lg={5} className="g-4">
                {upcomingMovies.map((movie) => (
                  <Col key={movie.id}>
                    <MovieCard movie={movie} type="movie" />
                  </Col>
                ))}
              </Row>
            </Tab>
          </Tabs>
        </section>
      </Container>
    </div>
  );
};

export default Home;
