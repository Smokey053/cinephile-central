// src/components/RatingStars.jsx
import React from "react";
import { FaStar } from "react-icons/fa";

const RatingStars = ({ rating, setRating }) => {
  return (
    <div>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            size={25}
            color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
            onClick={() => setRating && setRating(ratingValue)}
            style={{
              cursor: setRating ? "pointer" : "default",
              marginRight: 5,
            }}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;
