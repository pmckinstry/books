# Gemini Project Configuration: books

This document outlines the configuration for the "books" project, designed to be understood by Gemini.

## Project Overview

- **Project Name:** books
- **Description:** A web application for managing and discovering books.
- **Framework:** Next.js
- **Styling:** Tailwind CSS

## Key Technologies

- **Frontend:** React, Next.js
- **Backend:** Next.js API Routes
- **Database:** AWS DynamoDB, better-sqlite3
- **Testing:** Vitest, React Testing Library
- **Linting:** ESLint
- **Languages:** TypeScript

## Commands

- **Install Dependencies:** `npm install`
- **Run Development Server:** `npm run dev`
- **Run Tests:** `npm test`
- **Build for Production:** `npm run build`
- **Start Production Server:** `npm run start`
- **Lint Code:** `npm run lint`

## Project Structure

The project follows a standard Next.js structure:

- `src/app/`: Contains the application's pages and API routes.
- `src/components/`: Contains reusable React components.
- `src/lib/`: Contains shared library code, including database logic and authentication.
- `public/`: Contains static assets.
- `scripts/`: Contains various utility scripts for database management and migrations.
- `tests/`: Contains tests for the application.
