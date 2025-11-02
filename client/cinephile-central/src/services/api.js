// src/services/api.js
import axios from "axios";

// Read secret keys from Vite environment variables (VITE_*)
// See client/cinephile-central/.env.example for the expected names.
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  console.warn(
    "VITE_TMDB_API_KEY is not set. TMDb requests will fail without an API key. Add it to client/cinephile-central/.env.local"
  );
}

// TMDb API client
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Firebase Functions client (for reviews)
// Allow overriding the API base via VITE_API_BASE; otherwise fall back to existing logic
const API_BASE = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : import.meta.env.DEV
  ? "http://localhost:5001/gen-lang-client-0239125682/us-central1/api"
  : "https://us-central1-gen-lang-client-0239125682.cloudfunctions.net/api";

const apiClient = axios.create({
  baseURL: API_BASE,
});

// TMDb API Service
export const tmdbService = {
  // Movies
  getPopularMovies: (page = 1) =>
    tmdbClient.get("/movie/popular", { params: { page } }),
  getTrendingMovies: () => tmdbClient.get("/trending/movie/week"),
  getNowPlayingMovies: (page = 1) =>
    tmdbClient.get("/movie/now_playing", { params: { page } }),
  getUpcomingMovies: (page = 1) =>
    tmdbClient.get("/movie/upcoming", { params: { page } }),
  getTopRatedMovies: (page = 1) =>
    tmdbClient.get("/movie/top_rated", { params: { page } }),
  getMovieDetails: (id) =>
    tmdbClient.get(`/movie/${id}`, {
      params: { append_to_response: "videos,credits" },
    }),

  // TV Shows
  getPopularTVShows: (page = 1) =>
    tmdbClient.get("/tv/popular", { params: { page } }),
  getTrendingTVShows: () => tmdbClient.get("/trending/tv/week"),
  getTopRatedTVShows: (page = 1) =>
    tmdbClient.get("/tv/top_rated", { params: { page } }),
  getAiringTodayTVShows: (page = 1) =>
    tmdbClient.get("/tv/airing_today", { params: { page } }),
  getTVShowDetails: (id) =>
    tmdbClient.get(`/tv/${id}`, {
      params: { append_to_response: "videos,credits" },
    }),

  // Search
  searchMulti: (query, page = 1) =>
    tmdbClient.get("/search/multi", { params: { query, page } }),
  searchMovies: (query, page = 1) =>
    tmdbClient.get("/search/movie", { params: { query, page } }),
  searchTVShows: (query, page = 1) =>
    tmdbClient.get("/search/tv", { params: { query, page } }),

  // Genres
  getMovieGenres: () => tmdbClient.get("/genre/movie/list"),
  getTVGenres: () => tmdbClient.get("/genre/tv/list"),

  // Discover (with filters)
  discoverMovies: (params) => tmdbClient.get("/discover/movie", { params }),
  discoverTVShows: (params) => tmdbClient.get("/discover/tv", { params }),
};

// Reviews API Service
export const reviewsService = {
  getReviews: (movieId) =>
    apiClient.get(`/reviews/${movieId}`).catch((error) => {
      console.warn(`No reviews found for ${movieId}:`, error.message);
      return { data: [] };
    }),
  createReview: async (movieId, rating, text, token) => {
    if (!token) {
      throw new Error("Authentication required");
    }
    return apiClient.post(
      "/reviews",
      { movieId: String(movieId), rating: Number(rating), text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
  updateReview: (id, movieId, rating, text, token) =>
    apiClient.put(
      `/reviews/${id}`,
      { movieId: String(movieId), rating: Number(rating), text },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
  deleteReview: (id, movieId, token) =>
    apiClient.delete(`/reviews/${id}`, {
      params: { movieId: String(movieId) },
      headers: { Authorization: `Bearer ${token}` },
    }),
  getCommunityRating: async (movieId) => {
    try {
      const response = await apiClient.get(`/reviews/${movieId}`);
      const reviews = response.data;
      if (!reviews || reviews.length === 0) return null;
      const avgRating =
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
      return { average: avgRating, count: reviews.length };
    } catch (error) {
      console.warn(`Failed to get community rating for ${movieId}`);
      return null;
    }
  },
};

export default apiClient;
