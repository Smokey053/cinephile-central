import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Spinner,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaSave,
  FaEdit,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import { auth } from "../services/firebaseClient";
import { updateProfile } from "firebase/auth";
import { reviewsService } from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
  });
  const [userReviews, setUserReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Initialize profile data
    setProfileData({
      displayName: currentUser.displayName || "",
      photoURL: currentUser.photoURL || "",
    });

    // Fetch user reviews
    fetchUserReviews();
  }, [currentUser, navigate]);

  const fetchUserReviews = async () => {
    if (!currentUser) return;

    setLoadingReviews(true);
    try {
      // Note: This is a placeholder. You'll need to implement a backend endpoint
      // that fetches reviews by userId. For now, we'll leave it empty.
      // const token = await currentUser.getIdToken();
      // const response = await apiClient.get('/user/reviews', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setUserReviews(response.data);
      setUserReviews([]);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "danger",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId, movieId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await reviewsService.deleteReview(reviewId, movieId, token);
      setMessage({ type: "success", text: "Review deleted successfully!" });
      fetchUserReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      setMessage({
        type: "danger",
        text: "Failed to delete review. Please try again.",
      });
    }
  };

  if (!currentUser) {
    return null;
  }

  const memberSince = currentUser.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <Container className="profile-page mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="profile-header mb-4">
            <h2 className="page-title">
              <FaUser className="me-2" />
              My Profile
            </h2>
            <p className="text-muted">Manage your account information</p>
          </div>

          {message.text && (
            <Alert
              variant={message.type}
              dismissible
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          )}

          <Card className="profile-card shadow-lg">
            <Card.Body className="p-4">
              <div className="profile-avatar-section text-center mb-4">
                <div className="avatar-wrapper">
                  {profileData.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt="Profile"
                      className="profile-avatar"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          profileData.displayName || "User"
                        )}&size=150&background=e50914&color=fff&bold=true`;
                      }}
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <FaUser />
                    </div>
                  )}
                </div>
                <h4 className="mt-3">{profileData.displayName || "User"}</h4>
                <p className="text-muted">{currentUser.email}</p>
              </div>

              <div className="profile-info mb-4">
                <Row>
                  <Col md={6} className="mb-3">
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <div>
                        <small className="text-muted">Email Address</small>
                        <p className="mb-0">{currentUser.email}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="info-item">
                      <FaCalendar className="info-icon" />
                      <div>
                        <small className="text-muted">Member Since</small>
                        <p className="mb-0">{memberSince}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <hr className="my-4" />

              {editing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Profile Photo URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="photoURL"
                      value={profileData.photoURL}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <Form.Text className="text-muted">
                      Enter a URL to your profile photo
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="btn-save"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setEditing(false);
                        setProfileData({
                          displayName: currentUser.displayName || "",
                          photoURL: currentUser.photoURL || "",
                        });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Button
                    variant="outline-primary"
                    onClick={() => setEditing(true)}
                    className="btn-edit mb-4"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* User Reviews Section */}
          <Card className="profile-card shadow-lg mt-4">
            <Card.Body className="p-4">
              <h4 className="mb-4">
                <FaStar className="me-2 text-warning" />
                My Reviews
              </h4>

              {loadingReviews ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading reviews...</p>
                </div>
              ) : userReviews.length === 0 ? (
                <div className="text-center py-5">
                  <FaStar
                    className="mb-3"
                    style={{ fontSize: "3rem", opacity: 0.3 }}
                  />
                  <p className="text-muted mb-3">
                    You haven't written any reviews yet.
                  </p>
                  <Button as={Link} to="/movies" variant="primary">
                    Browse Movies
                  </Button>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {userReviews.map((review) => (
                    <ListGroup.Item
                      key={review.id}
                      className="review-item d-flex justify-content-between align-items-start"
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <Badge bg="warning" text="dark" className="me-2">
                            <FaStar /> {review.rating}/5
                          </Badge>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="mb-1">{review.text}</p>
                        <small className="text-muted">
                          Movie ID: {review.movieId}
                        </small>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          handleDeleteReview(review.id, review.movieId)
                        }
                        title="Delete review"
                      >
                        <FaTrash />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
