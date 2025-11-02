// src/pages/Profile.jsx
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
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaCalendar, FaSave, FaEdit } from "react-icons/fa";
import { auth } from "../services/firebaseClient";
import { updateProfile } from "firebase/auth";
import apiClient from "../services/api";
import "./Profile.css";

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: "",
    photoURL: "",
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Initialize profile data
    setProfileData({
      displayName: currentUser.displayName || "",
      bio: "",
      photoURL: currentUser.photoURL || "",
    });
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Update in Realtime Database first (this checks for unique displayName)
      const token = await currentUser.getIdToken();
      await apiClient.put("/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If successful, update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);

      // Check if it's a displayName taken error
      if (
        error.response?.status === 409 ||
        error.response?.data?.error === "displayNameTaken"
      ) {
        setMessage({
          type: "danger",
          text:
            error.response?.data?.message ||
            "This display name is already taken. Please choose another one.",
        });
      } else {
        setMessage({
          type: "danger",
          text:
            error.response?.data?.message ||
            "Failed to update profile. Please try again.",
        });
      }
    } finally {
      setLoading(false);
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

                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
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
                          bio: "",
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
                  <div className="profile-details mb-4">
                    <h5 className="mb-3">About</h5>
                    <p className="text-muted">
                      {profileData.bio ||
                        "No bio added yet. Click edit to add one!"}
                    </p>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={() => setEditing(true)}
                    className="btn-edit"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
