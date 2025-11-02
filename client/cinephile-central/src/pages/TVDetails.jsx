// src/pages/TVDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Image,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import { tmdbService, reviewsService } from "../services/api";
import ReviewCard from "../components/ReviewCard";
import AddReview from "../components/AddReview";

const TVDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [communityRating, setCommunityRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch TV show details
      const showResponse = await tmdbService.getTVShowDetails(id);
      setShow(showResponse.data);

      // Fetch reviews
      try {
        const reviewsResponse = await reviewsService.getReviews(`tv-${id}`);
        setReviews(reviewsResponse.data || []);

        // Calculate community rating
        if (reviewsResponse.data && reviewsResponse.data.length > 0) {
          const avgRating =
            reviewsResponse.data.reduce((acc, r) => acc + r.rating, 0) /
            reviewsResponse.data.length;
          setCommunityRating({
            average: avgRating,
            count: reviewsResponse.data.length,
          });
        }
      } catch (err) {
        console.log("Reviews not available:", err);
        setReviews([]);
      }
    } catch (err) {
      setError("Failed to fetch TV show details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate community rating
    const avgRating =
      updatedReviews.reduce((acc, r) => acc + r.rating, 0) /
      updatedReviews.length;
    setCommunityRating({
      average: avgRating,
      count: updatedReviews.length,
    });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading TV show details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </Container>
    );
  }

  if (!show) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">TV show not found.</Alert>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </Container>
    );
  }

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "https://via.placeholder.com/500x750";
  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : null;
  const trailer = show.videos?.results?.find(
    (vid) => vid.type === "Trailer" && vid.site === "YouTube"
  );

  return (
    <div className="movie-details-page">
      {/* Backdrop Hero */}
      {backdropUrl && (
        <div className="details-hero">
          <img src={backdropUrl} alt={show.name} className="backdrop-img" />
          <div className="backdrop-overlay" />
        </div>
      )}

      <Container className="details-content">
        <Link to="/" className="back-link mb-4">
          <FaArrowLeft /> Back to Home
        </Link>

        <Row className="mb-5">
          <Col md={4}>
            <Image
              src={posterUrl}
              alt={show.name}
              fluid
              rounded
              className="shadow-lg"
            />
          </Col>
          <Col md={8}>
            <h1 className="movie-title mb-3">
              {show.name}{" "}
              <span className="text-muted">
                ({new Date(show.first_air_date).getFullYear()})
              </span>
            </h1>

            {show.tagline && (
              <p className="tagline text-muted fst-italic mb-3">
                "{show.tagline}"
              </p>
            )}

            {/* Ratings Section */}
            <div className="ratings-section mb-4">
              <div className="rating-card">
                <div className="rating-label">TMDB Rating</div>
                <div className="rating-value">
                  <FaStar className="star-icon" />
                  <span className="rating-number">
                    {show.vote_average.toFixed(1)}
                  </span>
                  <span className="rating-max">/10</span>
                </div>
                <div className="rating-count">
                  {show.vote_count.toLocaleString()} votes
                </div>
              </div>

              {communityRating && (
                <div className="rating-card community-rating">
                  <div className="rating-label">Community Rating</div>
                  <div className="rating-value">
                    <FaStar className="star-icon" />
                    <span className="rating-number">
                      {communityRating.average.toFixed(1)}
                    </span>
                    <span className="rating-max">/5</span>
                  </div>
                  <div className="rating-count">
                    {communityRating.count} review
                    {communityRating.count !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>

            <p className="overview mb-4">{show.overview}</p>

            <div className="movie-meta">
              <div className="meta-item">
                <strong>Genres:</strong>{" "}
                {show.genres.map((g) => (
                  <Badge key={g.id} bg="secondary" className="me-2">
                    {g.name}
                  </Badge>
                ))}
              </div>
              <div className="meta-item">
                <strong>Seasons:</strong> {show.number_of_seasons}
              </div>
              <div className="meta-item">
                <strong>Episodes:</strong> {show.number_of_episodes}
              </div>
              <div className="meta-item">
                <strong>First Air Date:</strong>{" "}
                {new Date(show.first_air_date).toLocaleDateString()}
              </div>
              <div className="meta-item">
                <strong>Status:</strong> {show.status}
              </div>
            </div>

            {trailer && (
              <div className="mt-4">
                <h4 className="mb-3">Watch Trailer</h4>
                <div className="ratio ratio-16x9 trailer-container">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`}
                    title={`${show.name} Trailer`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
                <p className="trailer-warning mt-2 small">
                  <em>
                    Note: If the trailer doesn't load, you may have an ad
                    blocker enabled.
                  </em>
                </p>
              </div>
            )}
          </Col>
        </Row>

        <hr className="my-5" />

        {/* Reviews Section */}
        <Row>
          <Col>
            <h3 className="mb-4">User Reviews</h3>
            <AddReview movieId={`tv-${id}`} onReviewAdded={handleReviewAdded} />
            <div className="mt-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <Alert variant="info">
                  No reviews yet. Be the first to write one!
                </Alert>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TVDetails;
