// src/pages/Movies.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { tmdbService, reviewsService } from "../services/api";
import MovieCard from "../components/MovieCard";

const Movies = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [movieOfTheWeek, setMovieOfTheWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("popular");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch popular movies
      const popularRes = await tmdbService.getPopularMovies();
      setPopularMovies(popularRes.data.results.slice(0, 20));

      // Fetch latest/now playing movies
      const latestRes = await tmdbService.getNowPlayingMovies();
      setLatestMovies(latestRes.data.results.slice(0, 20));

      // Get movie of the week (highest community rating from trending)
      const trendingRes = await tmdbService.getTrendingMovies();
      const trending = trendingRes.data.results;

      // Get community ratings for trending movies
      const ratingsPromises = trending.slice(0, 10).map(async (movie) => {
        const rating = await reviewsService.getCommunityRating(movie.id);
        return { ...movie, communityRating: rating };
      });

      const moviesWithRatings = await Promise.all(ratingsPromises);
      const topCommunityMovie = moviesWithRatings
        .filter((m) => m.communityRating && m.communityRating.average >= 3.5)
        .sort(
          (a, b) => b.communityRating.average - a.communityRating.average
        )[0];

      setMovieOfTheWeek(topCommunityMovie || trending[0]);
    } catch (err) {
      setError("Failed to fetch movies. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" />
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
    <Container className="content-section">
      {/* Movie of the Week */}
      {movieOfTheWeek && (
        <div className="hero-section mb-5">
          <img
            src={`https://image.tmdb.org/t/p/original${movieOfTheWeek.backdrop_path}`}
            alt={movieOfTheWeek.title}
            className="hero-backdrop"
          />
          <div className="hero-content">
            <h1 className="hero-title">🏆 Movie of the Week</h1>
            <h2>{movieOfTheWeek.title}</h2>
            <p className="hero-description">{movieOfTheWeek.overview}</p>
            <div className="d-flex gap-3 align-items-center">
              <span className="badge bg-warning text-dark">
                ⭐ {movieOfTheWeek.vote_average.toFixed(1)}
              </span>
              {movieOfTheWeek.communityRating && (
                <span className="badge bg-success">
                  👥 {movieOfTheWeek.communityRating.average.toFixed(1)} (
                  {movieOfTheWeek.communityRating.count} reviews)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Popular and Latest */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 custom-tabs"
      >
        <Tab eventKey="popular" title="Popular Movies">
          <Row xs={2} sm={3} md={4} lg={5} className="g-4 mt-2">
            {popularMovies.map((movie) => (
              <Col key={movie.id}>
                <MovieCard movie={movie} type="movie" />
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab eventKey="latest" title="Now Playing">
          <Row xs={2} sm={3} md={4} lg={5} className="g-4 mt-2">
            {latestMovies.map((movie) => (
              <Col key={movie.id}>
                <MovieCard movie={movie} type="movie" />
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Movies;
