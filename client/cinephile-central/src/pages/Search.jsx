// src/pages/Search.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  InputGroup,
  Button,
} from "react-bootstrap";
import { FaSearch, FaTimes } from "react-icons/fa";
import { tmdbService } from "../services/api";
import MovieCard from "../components/MovieCard";
import debounce from "lodash.debounce";
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [popularSearches] = useState([
    "Inception",
    "The Shawshank Redemption",
    "Breaking Bad",
    "Stranger Things",
    "The Matrix",
    "Game of Thrones",
  ]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await tmdbService.searchMulti(searchQuery);
      const allResults = response.data.results.filter(
        (r) => r.media_type !== "person"
      );
      setResults(allResults);

      // Save to recent searches
      const updated = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    } catch (err) {
      setError("Failed to search. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search for live results
  const debouncedSearch = useCallback(
    debounce((searchQuery) => performSearch(searchQuery), 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handlePopularSearchClick = (search) => {
    setQuery(search);
    performSearch(search);
  };

  // Filter results based on type
  const filteredResults = results.filter((item) => {
    if (filterType === "all") return true;
    return item.media_type === filterType;
  });

  const movieCount = results.filter((r) => r.media_type === "movie").length;
  const tvCount = results.filter((r) => r.media_type === "tv").length;

  return (
    <Container className="search-page">
      <div className="search-header">
        <h1 className="page-title">Search Movies & TV Shows</h1>
        <p className="page-subtitle">
          Find your favorite movies and TV shows instantly
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <InputGroup size="lg" className="search-input-group">
          <InputGroup.Text className="search-icon">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search for movies, TV shows..."
            value={query}
            onChange={handleSearchChange}
            className="search-input"
            autoFocus
          />
          {query && (
            <InputGroup.Text
              className="clear-icon"
              onClick={handleClearSearch}
              style={{ cursor: "pointer" }}
            >
              <FaTimes />
            </InputGroup.Text>
          )}
        </InputGroup>
      </div>

      {/* Popular & Recent Searches */}
      {!query && (
        <div className="search-suggestions">
          {recentSearches.length > 0 && (
            <div className="suggestion-section">
              <h5>Recent Searches</h5>
              <div className="suggestion-badges">
                {recentSearches.map((search, idx) => (
                  <Badge
                    key={idx}
                    bg="secondary"
                    className="suggestion-badge"
                    onClick={() => handlePopularSearchClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="suggestion-section">
            <h5>Popular Searches</h5>
            <div className="suggestion-badges">
              {popularSearches.map((search, idx) => (
                <Badge
                  key={idx}
                  bg="primary"
                  className="suggestion-badge"
                  onClick={() => handlePopularSearchClick(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p className="mt-2">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      )}

      {/* Quick Filter Chips */}
      {query && results.length > 0 && (
        <div className="filter-chips-container">
          <Button
            variant={filterType === "all" ? "primary" : "outline-secondary"}
            className="filter-chip"
            onClick={() => setFilterType("all")}
          >
            All ({results.length})
          </Button>
          <Button
            variant={filterType === "movie" ? "primary" : "outline-secondary"}
            className="filter-chip"
            onClick={() => setFilterType("movie")}
          >
            Movies ({movieCount})
          </Button>
          <Button
            variant={filterType === "tv" ? "primary" : "outline-secondary"}
            className="filter-chip"
            onClick={() => setFilterType("tv")}
          >
            TV Shows ({tvCount})
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && query && filteredResults.length > 0 && (
        <div className="search-results">
          <h5 className="results-count">
            Found {filteredResults.length} result
            {filteredResults.length !== 1 ? "s" : ""}
          </h5>
          <Row xs={2} sm={3} md={4} lg={5} className="g-4 mt-2">
            {filteredResults.map((item) => (
              <Col key={item.id}>
                <MovieCard
                  movie={item}
                  type={item.media_type === "tv" ? "tv" : "movie"}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* No Results */}
      {!loading &&
        query &&
        filteredResults.length === 0 &&
        results.length > 0 && (
          <div className="no-results">
            <h3>
              No{" "}
              {filterType === "movie"
                ? "movies"
                : filterType === "tv"
                ? "TV shows"
                : "results"}{" "}
              found
            </h3>
            <p>Try selecting a different filter</p>
          </div>
        )}

      {/* No Results */}
      {!loading && query && results.length === 0 && (
        <div className="no-results">
          <h3>No results found for "{query}"</h3>
          <p>Try searching with different keywords</p>
        </div>
      )}
    </Container>
  );
};

export default Search;
