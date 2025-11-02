// src/components/SearchFilters.jsx
import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

const SearchFilters = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, genre, year, language });
  };

  const handleReset = () => {
    setQuery("");
    setGenre("");
    setYear("");
    setLanguage("");
    onSearch({ query: "", genre: "", year: "", language: "" });
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search movies or TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group className="mb-3">
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g., 2023"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group className="mb-3">
            <Form.Label>Language</Form.Label>
            <Form.Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">All</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Form.Group className="mb-3 d-flex gap-2">
            <Button variant="primary" type="submit">
              Search
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchFilters;
