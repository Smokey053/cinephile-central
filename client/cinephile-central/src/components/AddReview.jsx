import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { reviewsService } from "../services/api";
import RatingStars from "./RatingStars";

const AddReview = ({ movieId, onReviewAdded }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to write a review.");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = await currentUser.getIdToken();
      const response = await reviewsService.createReview(
        movieId,
        rating,
        text,
        token
      );
      onReviewAdded(response.data);
      setRating(0);
      setText("");
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(
        err.response?.data ||
          err.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return <Alert variant="info">Please log in to add a review.</Alert>;
  }

  return (
    <Form onSubmit={handleSubmit} className="add-review-form">
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Your Rating</Form.Label>
        <RatingStars rating={rating} setRating={setRating} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Your Review</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts..."
        />
      </Form.Group>
      <Button variant="primary" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </Form>
  );
};

export default AddReview;
