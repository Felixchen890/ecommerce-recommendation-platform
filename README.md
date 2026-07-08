# E-commerce Recommendation & A/B Testing Platform

A full-stack e-commerce recommendation platform built with React, Node.js, GraphQL, MongoDB, and AWS Lambda-ready architecture. The project demonstrates personalized product recommendations, user behavior tracking, A/B testing, and analytics dashboards for measuring recommendation performance.

## Project Overview

This project simulates a data-driven e-commerce platform where users can browse products, receive recommendations, add items to cart, and complete a mock checkout flow. The system tracks user behavior events and uses them to power recommendation strategies and A/B testing analytics.

The main goal is to demonstrate a realistic full-stack engineering workflow:

* Product listing from MongoDB
* GraphQL API layer with Node.js and Apollo Server
* User behavior event tracking
* Recommendation algorithms
* A/B testing framework
* CTR and conversion funnel analytics
* Frontend dashboard for experiment monitoring

## Tech Stack

**Frontend**

* React.js
* Apollo Client
* GraphQL
* JavaScript
* HTML/CSS

**Backend**

* Node.js
* Express.js
* Apollo GraphQL Server
* Mongoose
* MongoDB Atlas

**Database**

* MongoDB Atlas
* Collections:

  * products
  * events

**Planned / Extension**

* AWS Lambda for recommendation service
* Redis caching for recommendation results
* Docker Compose for local development
* GitHub Actions for CI/CD

## Core Features

### 1. Product Catalog

The application loads product data from MongoDB through a GraphQL API and displays products in a responsive React frontend.

### 2. User Behavior Tracking

The system tracks key user actions as event records in MongoDB:

* `recommendation_impression`
* `click_recommendation`
* `view_product`
* `add_to_cart`
* `purchase`

This creates a full behavior funnel from recommendation exposure to purchase.

### 3. Recommendation System

The platform supports two recommendation strategies:

**Group A: Popularity-based recommendation**

Group A uses global product popularity and behavior event scores to recommend popular products.

**Group B: Personalized recommendation**

Group B uses the user's historical behavior, product categories, tags, and popularity scores to generate more personalized recommendations.

### 4. A/B Testing Framework

Users are assigned to an experiment group:

* Group A: popularity-based recommendations
* Group B: personalized category/tag recommendations

All user events are stored with an `experimentGroup` field, making it possible to compare recommendation performance across groups.

### 5. Analytics Dashboard

The frontend includes an A/B testing dashboard showing:

* Impressions
* Recommendation clicks
* CTR
* Product views
* Add-to-cart events
* Purchases

CTR is calculated as:

```text
CTR = recommendation_clicks / recommendation_impressions
```

### 6. Cart and Mock Checkout

Users can add products to cart and complete a mock checkout. These actions are tracked as `add_to_cart` and `purchase` events, allowing the system to measure the full conversion funnel.

## Example Simulated A/B Test Data

The project includes a simulated event data script to generate realistic A/B testing metrics.

Example:

```text
Group A:
200 recommendation impressions
10 recommendation clicks
CTR = 5%

Group B:
200 recommendation impressions
16 recommendation clicks
CTR = 8%
```

This simulated data is used for local testing and dashboard demonstration.

## GraphQL API Examples

### Get Products

```graphql
query {
  products {
    id
    name
    brand
    category
    price
    popularityScore
  }
}
```

### Get Recommendations

```graphql
query {
  recommendations(userId: "demo-user-1", experimentGroup: "B") {
    id
    name
    brand
    category
    price
    popularityScore
  }
}
```

### Track Event

```graphql
mutation {
  trackEvent(input: {
    userId: "demo-user-1"
    productId: "PRODUCT_ID"
    eventType: "click_recommendation"
    sessionId: "session-1"
    experimentGroup: "B"
  }) {
    id
    eventType
    experimentGroup
  }
}
```

### Get Analytics

```graphql
query {
  analytics {
    groups {
      group
      impressions
      clicks
      ctr
      views
      addToCart
      purchases
    }
  }
}
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ecommerce-recommendation-platform
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create backend environment file

Create a `.env` file inside the `backend` folder:

```env
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
```

### 4. Seed product data

```bash
npm run seed
```

### 5. Optional: seed simulated A/B testing events

```bash
npm run seed:events
```

### 6. Start backend server

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:4000/graphql
```

### 7. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 8. Start frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Current Status

Implemented:

* React product listing page
* MongoDB product model
* MongoDB event model
* GraphQL products query
* GraphQL recommendation query
* GraphQL event tracking mutation
* GraphQL analytics query
* A/B testing recommendation strategies
* Recommendation impression tracking
* Recommendation click tracking
* Add-to-cart tracking
* Purchase tracking
* A/B testing dashboard

Planned improvements:

* Move recommendation logic into a separate AWS Lambda service
* Add Redis caching for recommendation results
* Add product detail pages
* Add authentication and user accounts
* Add Docker Compose setup
* Add backend unit tests
* Add frontend component tests
* Add CI/CD with GitHub Actions

## Resume Summary

Built a full-stack e-commerce recommendation and A/B testing platform using React, Node.js, GraphQL, and MongoDB. Implemented user behavior tracking, popularity-based and personalized recommendation strategies, cart and checkout event tracking, and an analytics dashboard to compare CTR and conversion funnel metrics across experiment groups.
