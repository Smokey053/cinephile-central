// src/components/ReviewCard.jsx
import React from "react";
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { reviewsService } from "../services/api";

const ReviewCard = ({ review, onDelete }) => {
  const { currentUser } = useAuth();
  const isAuthor = currentUser && currentUser.uid === review.authorId;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = await currentUser.getIdToken();
      await reviewsService.deleteReview(review.id, review.movieId, token);
      if (onDelete) {
        onDelete(review.id);
      } else {
        window.location.reload(); // Fallback if no onDelete callback
      }
    } catch (error) {
      console.error("Failed to delete review", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const reviewDate = review.createdAt?.seconds
    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
    : new Date(review.createdAt).toLocaleDateString();

  return (
    <Card className="mb-3 bg-white text-dark">
      <Card.Body>
        <Card.Title>{"⭐".repeat(review.rating)}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          by {review.authorName} on {reviewDate}
        </Card.Subtitle>
        <Card.Text>{review.text}</Card.Text>
        {isAuthor && (
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
