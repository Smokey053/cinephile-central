# Cinephile Central

Cinephile Central is a Movie & TV rview web app with Firebase integration.
The project includes a React frontend (Vite) and Firebase Cloud Functions for server-side review handling.

## Table of contents

- Project overview
- Features
- Architecture
- Prerequisites
- Quick start (local development)
- Environment / configuration
- Build & deployment
- Project structure
- Contributing
- License

## Project overview

This repository contains a full-stack application for browsing movies and TV shows using The Movie Database (TMDb) API, user authentication via Firebase, and a small backend (Firebase Functions) used to store and manage user reviews.

The frontend is located in `client/cinephile-central`. Server-side cloud functions live in `server/functions`.

## Features

- Browse, search, and filter movies & TV shows (TMDb)
- View movie / TV details, videos, and credits
- User authentication (Firebase)
- Add, edit and view reviews stored via Firebase (server functions)
- Community ratings aggregated from reviews

## Architecture

- Frontend: React + Vite (client/cinephile-central)
- Backend: Firebase Cloud Functions for API endpoints (server/functions)
- Database: Firebase Firestore / Realtime Database (used by the app)
- Third-party API: TMDb (The Movie Database)
