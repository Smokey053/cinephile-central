// src/components/MovieCard.jsx
import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { reviewsService } from "../services/api";

const MovieCard = ({ movie, type = "movie" }) => {
  const [communityRating, setCommunityRating] = useState(null);
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const tmdbRating = movie.vote_average;

  useEffect(() => {
    const fetchCommunityRating = async () => {
      const rating = await reviewsService.getCommunityRating(
        type === "tv" ? `tv-${movie.id}` : movie.id
      );
      setCommunityRating(rating);
    };
    fetchCommunityRating();
  }, [movie.id, type]);

  return (
    <Card className="movie-card h-100 fade-in">
      <div className="card-link-wrapper">
        {tmdbRating > 0 && (
          <div className="rating-badge">
            <FaStar className="star" />
            <span>{tmdbRating.toFixed(1)}</span>
          </div>
        )}
        <div className="card-image-wrapper">
          <Card.Img variant="top" src={posterUrl} alt={title} loading="lazy" />
          <div className="card-overlay">
            <Link
              to={`/${type}/${movie.id}`}
              className="view-details-btn"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
            </Link>
          </div>
        </div>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text className="d-flex justify-content-between align-items-center">
            <span className="release-year">
              {releaseDate && new Date(releaseDate).getFullYear()}
            </span>
            {communityRating && (
              <span className="community-rating" title="Community Rating">
                <FaStar
                  style={{
                    color: "var(--accent-secondary)",
                    fontSize: "0.8rem",
                  }}
                />{" "}
                {communityRating.average.toFixed(1)} ({communityRating.count})
              </span>
            )}
          </Card.Text>
        </Card.Body>
      </div>
    </Card>
  );
};

export default MovieCard;
