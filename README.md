# MarketMitra

### Sell Smarter. Earn Better.

**MarketMitra** is a farmer-focused market intelligence platform designed to help farmers make better selling decisions by comparing crop prices, market distance, transportation costs, weather conditions, and available government schemes — all in one place.

> **Mitra AI — Agriculture Intelligence, built for better decisions.**

---

## What is MarketMitra?

Farmers often have to compare information from multiple places before deciding where and when to sell their crops.

MarketMitra brings those important signals together into one simple interface.

Select a crop, enter the quantity, and compare markets based on:

- Current market prices
- Distance from the farmer
- Estimated transportation cost
- Expected net value
- Market conditions
- Weather conditions
- Price trends
- Government schemes

The goal is simple:

**Give farmers clearer information before they sell.**

---

## Core Features

### Market Intelligence

Compare available markets and understand how different prices and transportation costs affect the final value of a sale.

### Market Comparison

View important market information side-by-side:

| Information | Description |
|---|---|
| Market | Mandi / APMC market |
| Price | Current available crop price |
| Distance | Approximate distance |
| Transport | Estimated transportation cost |
| Net Value | Estimated value after transport |

### Mitra AI

**Mitra AI stands for Agriculture Intelligence.**

It helps organize agricultural information into easier-to-understand insights and assists users in interpreting market and crop information.

### Weather Intelligence

Get relevant weather information for the farmer's location, including:

- Current conditions
- Rain alerts
- Weather-based agricultural information

### Price Trends

Explore historical and available price trends to understand how market prices have changed over time.

### Government Schemes

Discover agricultural government schemes with information such as:

- Scheme details
- Eligibility
- Benefits
- Application information

### Mitra Link

A farmer-to-farmer resource-sharing section where users can find or share agricultural resources and equipment.

### Multilingual Experience

MarketMitra is designed for a multilingual agricultural audience with support for:

- English
- Marathi
- Hindi

---

## Product Experience

MarketMitra follows a clean, mobile-first design philosophy.

### Design Principles

- Premium and minimal interface
- Fast navigation
- Clear information hierarchy
- Accessible typography
- Rounded modern components
- Subtle motion and transitions
- Responsive layouts
- Light and dark visual experiences
- Farmer-friendly information presentation

The interface is intentionally designed to avoid unnecessary complexity.

**Important information should be understandable at a glance.**

---

## Application Structure

```text
MarketMitra
│
├── Home
│   ├── Market Overview
│   ├── Weather
│   ├── Quick Actions
│   └── Agriculture Intelligence
│
├── Market
│   ├── Crop Selection
│   ├── Market Comparison
│   ├── Price Information
│   └── Market Details
│
├── Diagnose
│   └── Crop Health Intelligence
│
├── Weather
│   ├── Current Conditions
│   └── Weather Alerts
│
├── Schemes
│   └── Government Schemes
│
├── Mitra Link
│   └── Resource Sharing
│
├── Profile
│   ├── Farmer Information
│   ├── Saved Crops
│   └── Preferences
│
└── Admin
    ├── Users
    ├── Platform Monitoring
    ├── Feature Controls
    └── System Status
```

---

## Data & Reliability

MarketMitra is designed around **real agricultural information rather than fabricated market results**.

Market information can be sourced and cross-checked using official agricultural datasets and market sources.

The application distinguishes between different data states, including:

```text
LIVE
UPDATED TODAY
RECENT
STALE
UNAVAILABLE
```

When reliable information is unavailable, MarketMitra should clearly communicate that instead of presenting invented values.

---

## Technology

MarketMitra is built using a modern web application stack.

```text
Frontend
├── React
├── TypeScript
├── TanStack Start
└── TanStack Router

Backend & Data
├── Supabase
├── PostgreSQL
└── Edge Functions

Development
├── Git
├── GitHub
└── Vercel
```

The architecture is designed to support a scalable application while keeping the user experience fast and lightweight.

---

## Project Structure

```text
src/
├── components/
├── lib/
├── routes/
├── styles/
└── integrations/

public/
└── assets/
```

---

## Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm
- Git

### Clone the repository

```bash
git clone <repository-url>
cd marketmitra-app
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

## Admin Control Center

The private `/admin` route reads operational data from Supabase and existing provider logs. User and control operations require the `admin` role and are rechecked server-side. Service-role access is limited to server functions.

Before deploying these admin additions, apply `supabase/migrations/20260929120000_admin_control_center.sql` to the project database. It adds admin-only user metrics/list RPCs, scheduled system notices, and structured application error logs. The user-facing app reads only active, scheduled notices through row-level security.

Analytics events remain anonymous by design, so individual route/session events are not attributed to users. Existing account sign-ins, profiles, conversation metadata, diagnoses, and user-linked provider failures are shown only where those records exist. Chat message content and phone numbers are not exposed in the admin UI.

The application will be available locally at:

```text
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file for your local environment and configure the required project credentials.

Example:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Additional server-side variables may be required for specific MarketMitra services.

**Never commit secrets, private API keys, service-role keys, or credentials to GitHub.**

---

## Product Modules

| Module | Purpose |
|---|---|
| Market | Compare agricultural markets |
| Mitra AI | Agriculture intelligence |
| Diagnose | Crop health assistance |
| Weather | Weather information |
| Schemes | Government scheme discovery |
| Mitra Link | Resource sharing |
| Profile | Farmer preferences and history |
| Admin | Platform management |

---

## Vision

MarketMitra is being built around a simple idea:

> **Agricultural information should be easier to access, understand, and act upon.**

Instead of forcing farmers to search across multiple sources, MarketMitra aims to bring useful agricultural intelligence into one practical platform.

**Better information. Better decisions. Better selling.**

---

## Status

**MarketMitra is actively under development.**

The platform is continuously being improved across:

- Market intelligence
- Data reliability
- Weather information
- Crop diagnosis
- Agriculture intelligence
- Farmer experience
- Performance
- Accessibility
- Platform administration

---

## Brand

**MarketMitra**

**Tagline:** *Sell Smarter. Earn Better.*

**Mitra AI:** *Agriculture Intelligence*

Built with a focus on technology that is practical, understandable, and useful for farmers.

---

## License

This project is currently maintained as a private product/project.

All rights reserved unless otherwise specified.

---

### MarketMitra

**Agriculture Intelligence for Better Decisions.**

*Sell Smarter. Earn Better.*
