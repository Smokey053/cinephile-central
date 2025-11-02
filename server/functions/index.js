const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

admin.initializeApp({
  databaseURL: "https://gen-lang-client-0239125682-default-rtdb.firebaseio.com",
});

const app = express();
app.use(cors({ origin: true }));

const db = admin.database(); // Using Realtime Database instead of Firestore
const TMDB_API_KEY = "ab50b351df7f7ded6432c8db8d8100d8";

// Middleware to check authentication
const checkAuth = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        req.user = decodedToken;
        next();
      })
      .catch((error) => {
        res.status(403).send("Unauthorized");
      });
  } else {
    res.status(403).send("Unauthorized");
  }
};

// TMDB Proxy Routes
app.get("/tmdb/popular", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching from TMDB");
  }
});

app.get("/tmdb/search", async (req, res) => {
  const { q, genre, year, language } = req.query;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${q}&language=${
        language || "en-US"
      }&primary_release_year=${year || ""}`
    );
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching from TMDB");
  }
});

app.get("/tmdb/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
    );
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching from TMDB");
  }
});

// TV Show Routes
app.get("/tmdb/tv/popular", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching from TMDB");
  }
});

app.get("/tmdb/tv/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`
    );
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching from TMDB");
  }
});

app.get("/tmdb/search/tv", async (req, res) => {
  const { q, language, year } = req.query;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${q}&language=${
        language || "en-US"
      }&first_air_date_year=${year || ""}`
    );
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching from TMDB");
  }
});

// Review Routes - Using Realtime Database
app.get("/reviews/:movieId", async (req, res) => {
  const { movieId } = req.params;
  try {
    const reviewsRef = db.ref("reviews").child(movieId);
    const snapshot = await reviewsRef.once("value");
    const reviewsData = snapshot.val();

    if (!reviewsData) {
      return res.status(200).send([]);
    }

    // Convert object to array with IDs
    const reviews = Object.entries(reviewsData)
      .map(([id, data]) => ({
        id,
        ...data,
      }))
      .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first

    res.status(200).send(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send(error.message);
  }
});

app.post("/reviews", checkAuth, async (req, res) => {
  const { movieId, rating, text } = req.body;
  const { uid, name, email } = req.user;

  if (!movieId || !rating) {
    return res.status(400).send("Missing required fields: movieId and rating");
  }

  try {
    // Try to get display name from Firebase Auth or Realtime Database
    let authorName = name || "Anonymous";

    try {
      const userRecord = await admin.auth().getUser(uid);
      authorName = userRecord.displayName || authorName;
    } catch (authError) {
      console.log(
        "Could not fetch user from Auth, trying database:",
        authError.message
      );
    }

    // If still no name, try from our database
    if (authorName === "Anonymous" || !authorName) {
      try {
        const userSnapshot = await db.ref("users").child(uid).once("value");
        const userData = userSnapshot.val();
        if (userData && userData.displayName) {
          authorName = userData.displayName;
        } else {
          authorName = email?.split("@")[0] || "Anonymous";
        }
      } catch (dbError) {
        console.log("Could not fetch user from database:", dbError.message);
        authorName = email?.split("@")[0] || "Anonymous";
      }
    }

    const reviewsRef = db.ref("reviews").child(movieId);
    const newReviewRef = reviewsRef.push();

    const review = {
      movieId,
      authorId: uid,
      authorName: authorName,
      rating: Number(rating),
      text: text || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await newReviewRef.set(review);

    res.status(201).send({ id: newReviewRef.key, ...review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).send(error.message);
  }
});

app.put("/reviews/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  const { movieId, rating, text } = req.body;
  const { uid } = req.user;

  if (!movieId) {
    return res.status(400).send("Missing movieId");
  }

  try {
    const reviewRef = db.ref("reviews").child(movieId).child(id);
    const snapshot = await reviewRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).send("Review not found");
    }

    const reviewData = snapshot.val();
    if (reviewData.authorId !== uid) {
      return res.status(403).send("User not authorized to edit this review");
    }

    await reviewRef.update({
      rating: Number(rating),
      text: text || "",
      updatedAt: Date.now(),
    });

    res.status(200).send({
      id,
      ...reviewData,
      rating: Number(rating),
      text,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).send(error.message);
  }
});

app.delete("/reviews/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  const { movieId } = req.query;
  const { uid } = req.user;

  if (!movieId) {
    return res.status(400).send("Missing movieId query parameter");
  }

  try {
    const reviewRef = db.ref("reviews").child(movieId).child(id);
    const snapshot = await reviewRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).send("Review not found");
    }

    const reviewData = snapshot.val();
    if (reviewData.authorId !== uid) {
      return res.status(403).send("User not authorized to delete this review");
    }

    await reviewRef.remove();
    res.status(200).send("Review deleted");
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).send(error.message);
  }
});

// User Profile Routes
app.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userRef = db.ref("users").child(userId);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).send("User profile not found");
    }

    res.status(200).send(snapshot.val());
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send(error.message);
  }
});

app.put("/profile", checkAuth, async (req, res) => {
  const { uid } = req.user;
  const { displayName, bio, photoURL } = req.body;

  try {
    // Check if displayName is being changed and if it's unique
    if (displayName && displayName.trim()) {
      const usersRef = db.ref("users");
      const snapshot = await usersRef
        .orderByChild("displayName")
        .equalTo(displayName.trim())
        .once("value");

      const existingUsers = snapshot.val();

      // If displayName exists and belongs to a different user
      if (existingUsers) {
        const userIds = Object.keys(existingUsers);
        if (userIds.length > 0 && !userIds.includes(uid)) {
          return res.status(409).send({
            error: "displayNameTaken",
            message:
              "This display name is already taken. Please choose another one.",
          });
        }
      }
    }

    const userRef = db.ref("users").child(uid);
    const updates = {
      displayName: displayName?.trim() || "",
      bio: bio || "",
      photoURL: photoURL || "",
      updatedAt: Date.now(),
    };

    await userRef.update(updates);

    res.status(200).send({ uid, ...updates });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send(error.message);
  }
});

exports.api = functions.https.onRequest(app);
