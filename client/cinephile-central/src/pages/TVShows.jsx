// src/pages/TVShows.jsx
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

const TVShows = () => {
  const [popularShows, setPopularShows] = useState([]);
  const [latestShows, setLatestShows] = useState([]);
  const [showOfTheWeek, setShowOfTheWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("popular");

  useEffect(() => {
    fetchTVShows();
  }, []);

  const fetchTVShows = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch popular TV shows
      const popularRes = await tmdbService.getPopularTVShows();
      setPopularShows(popularRes.data.results.slice(0, 20));

      // Fetch airing today
      const latestRes = await tmdbService.getAiringTodayTVShows();
      setLatestShows(latestRes.data.results.slice(0, 20));

      // Get TV show of the week (highest community rating from trending)
      const trendingRes = await tmdbService.getTrendingTVShows();
      const trending = trendingRes.data.results;

      // Get community ratings for trending shows
      const ratingsPromises = trending.slice(0, 10).map(async (show) => {
        const rating = await reviewsService.getCommunityRating(`tv-${show.id}`);
        return { ...show, communityRating: rating };
      });

      const showsWithRatings = await Promise.all(ratingsPromises);
      const topCommunityShow = showsWithRatings
        .filter((s) => s.communityRating && s.communityRating.average >= 3.5)
        .sort(
          (a, b) => b.communityRating.average - a.communityRating.average
        )[0];

      setShowOfTheWeek(topCommunityShow || trending[0]);
    } catch (err) {
      setError("Failed to fetch TV shows. Please try again later.");
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
      {/* TV Show of the Week */}
      {showOfTheWeek && (
        <div className="hero-section mb-5">
          <img
            src={`https://image.tmdb.org/t/p/original${showOfTheWeek.backdrop_path}`}
            alt={showOfTheWeek.name}
            className="hero-backdrop"
          />
          <div className="hero-content">
            <h1 className="hero-title">🏆 TV Show of the Week</h1>
            <h2>{showOfTheWeek.name}</h2>
            <p className="hero-description">{showOfTheWeek.overview}</p>
            <div className="d-flex gap-3 align-items-center">
              <span className="badge bg-warning text-dark">
                ⭐ {showOfTheWeek.vote_average.toFixed(1)}
              </span>
              {showOfTheWeek.communityRating && (
                <span className="badge bg-success">
                  👥 {showOfTheWeek.communityRating.average.toFixed(1)} (
                  {showOfTheWeek.communityRating.count} reviews)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Popular and Airing Today */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4 custom-tabs"
      >
        <Tab eventKey="popular" title="Popular TV Shows">
          <Row xs={2} sm={3} md={4} lg={5} className="g-4 mt-2">
            {popularShows.map((show) => (
              <Col key={show.id}>
                <MovieCard movie={show} type="tv" />
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab eventKey="latest" title="Airing Today">
          <Row xs={2} sm={3} md={4} lg={5} className="g-4 mt-2">
            {latestShows.map((show) => (
              <Col key={show.id}>
                <MovieCard movie={show} type="tv" />
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default TVShows;
