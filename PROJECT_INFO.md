# 🚗 VehicleVault — Smart Car Comparison & Recommendation System

---

## WHAT IS THIS PROJECT?

VehicleVault is a full-stack web application that helps people make smarter decisions before buying a car. Instead of visiting multiple websites to compare prices, features, and specifications, users can do everything in one place — search vehicles, compare them side by side, get AI-powered recommendations, read real reviews, and save their favorites.

**The core problem it solves:** Buying a car is one of the biggest financial decisions a person makes. Information is scattered across dozens of websites. VehicleVault centralizes everything and adds intelligent comparison tools that no single dealership website offers.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| Image Storage | Cloudinary |
| HTTP Client | Axios |
| Password Hashing | bcryptjs |
| File Upload | Multer + multer-storage-cloudinary |

---

## PROJECT STRUCTURE

```
Vehicle-Vault/
├── Backend/                    ← Node.js + Express API server
│   ├── app.js                  ← Entry point, all middleware and routes
│   ├── seed.js                 ← Database seeder (46 vehicles, 196 accessories)
│   ├── add-second-images.js    ← Utility to add second images to vehicles
│   ├── .env                    ← Environment variables (not committed)
│   └── src/
│       ├── config/             ← DB, CORS, Cloudinary, Cron, Logger setup
│       ├── controllers/        ← Business logic for each feature
│       ├── middleware/         ← Auth, Admin guard, Error handler
│       ├── models/             ← MongoDB schemas (8 collections)
│       ├── routes/             ← Express route definitions (8 route files)
│       └── utils/              ← Token generator, file upload handler
│
└── Frontend/                   ← React + Vite application
    ├── src/
    │   ├── api/                ← Axios client with interceptors
    │   ├── components/         ← Reusable UI components
    │   ├── pages/              ← One file per page/screen
    │   └── state/              ← AuthContext (global auth state)
    ├── tailwind.config.js      ← Custom design system
    └── vite.config.js          ← Dev proxy to backend
```

---

## HOW TO RUN IT

### Prerequisites
- Node.js installed
- MongoDB running locally (or MongoDB Atlas URI)

### Step 1 — Backend
```bash
cd Vehicle-Vault/Backend
npm install
# Make sure .env has MONGO_URI, JWT_SECRET, CLOUDINARY credentials
npm run dev
# Server starts at http://localhost:5000
```

### Step 2 — Seed the Database
```bash
# Still in Backend folder
node seed.js
# Inserts 46 vehicles and 196 accessories
```

### Step 3 — Frontend
```bash
cd Vehicle-Vault/Frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

### Step 4 — Create Admin Account
```
1. Register at /register with any email
2. Open MongoDB Compass or shell
3. Run: db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})
4. Log out and log back in — you now have admin access
```

---

## THE 8 DATABASE COLLECTIONS

### 1. Users
Stores all registered users including admins.
- Fields: name, email, password (hashed), role (user/admin), isBlocked, resetPasswordToken, resetPasswordExpire, created_at
- Security: passwords are hashed with bcrypt (10 rounds), never stored in plain text
- Unique index on email

### 2. Vehicles
The main catalog of cars.
- Fields: name, brand, price, fuel_type, mileage, engine, transmission, features (array), specifications (object), images (array of URLs)
- Indexes on brand, fuel_type, transmission, price, mileage for fast filtering
- Text index on name + brand + engine for full-text search

### 3. Comparisons
Saved comparison results.
- Fields: user_id, vehicles (array of 2-3 vehicle IDs), result (differences, similarities, advantages, disadvantages, summary)
- Every time a user compares vehicles, the result is saved here permanently

### 4. Reviews
User ratings and feedback for vehicles.
- Fields: user_id, vehicle_id, rating (1-5), comment
- Unique compound index on user_id + vehicle_id — one review per user per vehicle

### 5. Favorites
Vehicles saved by users.
- Fields: user_id, vehicle_id, created_at
- Unique compound index prevents duplicate favorites

### 6. Notifications
Admin announcements visible to all users.
- Fields: title, message, created_at

### 7. Accessories
Products recommended for specific vehicles.
- Fields: vehicle_id, name, price, description
- 196 accessories seeded across all 46 vehicles

### 8. AdminLogs
Audit trail of every admin action.
- Fields: admin_id, action (text description), created_at
- Every create/update/delete/block action is logged automatically

---

## ALL API ENDPOINTS

### Authentication (/api/auth)
- POST /register — Create new account
- POST /login — Login, get JWT token
- POST /forgot-password — Generate password reset token
- PUT /reset-password/:token — Reset password using token
- POST /reset-password-simple — Reset password using just email + new password
- GET /profile — Get logged-in user's profile + stats + recent activity
- PUT /profile — Update name or change password
- DELETE /profile — Delete account and all associated data

### Vehicles (/api/vehicles)
- GET / — List all vehicles with filters and pagination
- GET /autocomplete?q= — Search suggestions for the autocomplete dropdown
- GET /:id — Get single vehicle details
- GET /:id/recommendations — Get similar vehicles and accessories
- GET /:id/ai-recommendations — Get AI-scored recommendations with reasons
- POST / — Create vehicle (Admin only, supports image upload)
- PUT /:id — Update vehicle (Admin only)
- DELETE /:id — Delete vehicle (Admin only)

### Comparisons (/api/compare)
- POST / — Compare 2-3 vehicles, saves result to database
- GET /:id — Retrieve a saved comparison by ID

### Reviews (/api/reviews)
- POST / — Submit a review (one per user per vehicle)
- GET /:vehicleId — Get all reviews for a vehicle
- DELETE /:id — Delete a review (owner or admin)

### Favorites (/api/favorites)
- POST / — Add vehicle to favorites
- GET / — Get current user's favorites (with vehicle details populated)
- GET /user/:userId — Get a specific user's favorites (admin or self)
- DELETE /:id — Remove from favorites

### Notifications (/api/notifications)
- GET / — Get all notifications (public)
- POST / — Create notification (Admin only)
- DELETE /:id — Delete notification (Admin only)

### Accessories (/api/accessories)
- POST / — Create accessory (Admin only)
- GET /:vehicleId — Get accessories for a specific vehicle
- DELETE /:id — Delete accessory (Admin only)

### Admin (/api/admin)
- GET /analytics — Platform-wide statistics (9 counters)
- GET /users — All users list (passwords excluded)
- GET /logs — Paginated admin action logs
- PUT /block/:id — Block a user
- PUT /unblock/:id — Unblock a user
- DELETE /users/:id — Delete a user

---

## KEY FEATURES EXPLAINED

### 1. Vehicle Search and Filtering
Users can filter vehicles by brand, fuel type, transmission, price range, and mileage range. There is also a full-text search that searches across vehicle name, brand, and engine description simultaneously. All filters work together — you can search for "Toyota" with fuel type "Petrol" and price under 4,000,000 at the same time.

**How it works technically:** The backend builds a MongoDB filter object dynamically based on which query parameters are present. Brand, fuel type, and transmission use case-insensitive regex matching. Price and mileage use MongoDB range operators ($gte, $lte). The full-text search uses $or with regex across three fields.

### 2. Search Autocomplete
As the user types in the search box, suggestions appear within 250 milliseconds showing matching brands and vehicles with images, prices, and fuel type badges.

**Additional features:**
- Recent searches are saved in the browser (localStorage) and shown when the search box is clicked
- Popular brands (Toyota, Honda, Suzuki, Hyundai, Kia) are shown as quick-click pills
- Keyboard navigation works — arrow keys to move, Enter to select, Escape to close
- Brand suggestions show how many vehicles are available for that brand

### 3. Vehicle Comparison Engine
Users select 2 or 3 vehicles from the catalog and click Compare. The system generates a detailed report showing:
- Which specifications are different between the vehicles (highlighted in amber)
- Which specifications are identical (shown normally)
- Advantages — e.g., "Toyota Corolla has the lowest price (Rs. 3,200,000)"
- Disadvantages — e.g., "Honda Civic has the highest mileage"
- A natural language summary of the comparison
- Best value winner badge (lowest price + highest mileage scoring)

**How it works technically:** The backend receives an array of vehicle IDs, fetches all vehicles, then iterates over 9 comparison keys (name, brand, price, fuel_type, mileage, engine, transmission, features, specifications). For each key, it uses JSON.stringify deep equality to determine if all vehicles have the same value. Differences and similarities are stored separately. The comparison result is saved to the database so it can be retrieved later.

### 4. AI-Powered Recommendations
On every vehicle detail page, an AI recommendation panel shows the top 8 most similar vehicles with a match score from 0-100%.

**The scoring algorithm uses 8 criteria:**
1. Same brand — 25 points
2. Same fuel type — 20 points
3. Same transmission — 15 points
4. Price proximity (within 5% = 20pts, within 10% = 15pts, within 20% = 10pts, within 40% = 5pts)
5. Mileage proximity (within 1 km/l = 10pts, within 2 = 7pts, within 4 = 4pts)
6. Feature overlap (4+ shared features = 10pts, 2+ = 6pts, 1 = 3pts)
7. Better value bonus — if the recommended vehicle has higher mileage AND lower price = 5pts
8. Same seating capacity = 5pts

The raw score (max 110) is normalized to a 0-100% scale. Users can filter recommendations by fuel type, sort by score/price/mileage, and add vehicles to a compare tray directly from the recommendations panel.

### 5. User Profile System
Every logged-in user has a profile page showing:
- Their account information (name, email, role, join date)
- Live statistics: how many comparisons made, favorites saved, reviews written
- Recent activity: last 4 favorites with vehicle thumbnails, last 4 reviews with ratings, last 3 comparisons showing which vehicles were compared
- Ability to update their name
- Ability to change their password (requires current password verification)
- Account deletion with password confirmation (deletes all their data)

### 6. Admin Dashboard
The admin has a 6-tab control panel:

**Analytics tab** — Shows 9 live counters: total users, admins, blocked users, vehicles, reviews, favorites, comparisons, notifications, accessories. Each counter has a color-coded icon.

**Users tab** — Full table of all users with their role, status (active/blocked), and action buttons. Admins can block, unblock, or delete any non-admin user. The system prevents admins from blocking or deleting themselves.

**Vehicles tab** — Inventory list with thumbnails. Admin can add new vehicles (with image URL input or file upload to Cloudinary), edit existing vehicles in a modal, or delete them.

**Accessories tab** — Select a vehicle from a dropdown, view its existing accessories, add new ones with name/price/description, or delete them.

**Notifications tab** — Post announcements that all users see on the Notifications page. Can delete old notifications.

**Logs tab** — Every admin action is recorded with the admin's name, email, action description, and timestamp. This creates a full audit trail.

### 7. Favorites System
Users can save vehicles they like by clicking the heart button on any vehicle card or detail page. The favorites page shows all saved vehicles with their details. Users can remove favorites individually. The system prevents saving the same vehicle twice.

### 8. Reviews and Ratings
Users can submit a star rating (1-5) and optional comment for any vehicle. Each user can only review each vehicle once. Reviews are displayed on the vehicle detail page with the reviewer's name, rating, and comment. The average rating is shown as a star display with the review count.

### 9. Notifications
Admins can post announcements that appear on the public Notifications page. Each notification shows its title, message, and how long ago it was posted (e.g., "2h ago", "3d ago").

### 10. Password Reset
Two methods are available:
- Token-based: User requests a reset, gets a token (in development this is returned in the API response since no email service is configured), uses the token to set a new password within 15 minutes
- Simple method: User enters their email and new password directly — the system verifies the email exists and updates the password immediately

---

## SECURITY IMPLEMENTATION

**Password Security:** All passwords are hashed using bcrypt with 10 salt rounds before storing. The original password is never saved anywhere.

**JWT Authentication:** After login, the server generates a JSON Web Token containing the user's ID and role. This token is sent with every API request in the Authorization header. The server verifies the token on every protected route.

**Role-Based Access:** Two roles exist — "user" and "admin". Admin routes are protected by a middleware that checks the role in the JWT. Regular users cannot access admin endpoints even if they have a valid token.

**Blocked User Check:** Every time a protected route is accessed, the middleware checks if the user's account has been blocked. Blocked users get a 403 error even with a valid token.

**Input Validation:** All user inputs are validated — email format, password length, required fields, valid MongoDB ObjectIDs. Special regex characters in search queries are escaped to prevent ReDoS attacks.

**Security Headers:** Helmet.js sets 11 security-related HTTP headers on every response.

**CORS:** Only specific origins are allowed to make requests to the API (localhost:5173 in development, configurable via environment variable for production).

**Auto-Logout:** If the server returns a 401 (unauthorized) response, the frontend automatically clears the stored token and redirects to the login page.

---

## FRONTEND DESIGN SYSTEM

The entire UI is built with a custom design system on top of Tailwind CSS. Custom utility classes are defined for:

- Buttons: btn-primary (indigo), btn-secondary (white border), btn-danger (red), btn-success (green), btn-ghost (transparent), with size variants btn-sm and btn-lg
- Cards: card (white with shadow), card-hover (lifts on hover), card-glass (frosted glass effect)
- Inputs: input (with focus ring), label
- Badges: badge-brand (indigo), badge-green, badge-red, badge-amber, badge-slate
- Alerts: alert-error, alert-success, alert-warning, alert-info
- Animations: fade-in, slide-up, slide-down, scale-in, pulse-soft

The color palette uses indigo as the primary brand color with a full 50-950 scale. The background uses a custom "surface" color scale for subtle depth.

Login and Register pages use a full-screen hero gradient background with glassmorphism cards (frosted glass effect with backdrop blur).

---

## DATA FLOW EXAMPLES

### How a comparison works step by step:
1. User is on the Vehicles page and clicks "+ Compare" on Toyota Corolla — it gets added to a selection list
2. User clicks "+ Compare" on Honda Civic — now 2 vehicles are selected
3. A sticky bar appears at the top: "2 vehicles ready to compare"
4. User clicks "Compare Now" — navigates to the Compare page with the IDs passed as state
5. The Compare page detects the pre-selected IDs and automatically runs the comparison
6. A POST request goes to /api/compare with {vehicleIds: ["id1", "id2"]}
7. The backend fetches both vehicles, computes differences and similarities, generates advantages/disadvantages, creates a summary, saves the result to the database, and returns the full comparison with populated vehicle objects
8. The frontend renders the comparison table, pros/cons cards, summary, and recommendations

### How AI recommendations work step by step:
1. User opens a vehicle detail page (e.g., Toyota Corolla)
2. The AIRecommendations component makes a GET request to /api/vehicles/:id/ai-recommendations
3. The backend fetches all other vehicles in the database
4. For each vehicle, it calculates a score based on 8 criteria (brand match, fuel type, price proximity, mileage proximity, feature overlap, transmission, value bonus, seating)
5. All vehicles are sorted by score, top 8 are returned with their scores and reasons
6. The frontend renders each recommendation with a circular score ring, reason pills, and action buttons
7. User can click "📊 Score" to see a breakdown bar chart showing exactly how points were earned
8. User can click "⚖️ Compare" to add that vehicle to a compare tray and navigate to the comparison page

---

## WHAT MAKES THIS PROJECT STAND OUT

1. **AI Scoring Engine** — Not just "similar vehicles" but a quantified match score with transparent reasoning. Users can see exactly why a vehicle was recommended.

2. **Complete Admin System** — Full CRUD for vehicles, user management with block/unblock, notification broadcasting, accessory management, and a complete audit log of every admin action.

3. **Search Autocomplete** — Live suggestions with images, prices, fuel type badges, recent search history, and popular brand shortcuts. Keyboard navigable.

4. **Comparison Report** — Goes beyond a simple table. Generates natural language advantages/disadvantages, identifies the best value winner, shows feature overlap, and saves the result permanently.

5. **Profile Activity Feed** — Users can see their recent favorites, reviews, and comparisons with vehicle thumbnails — not just counts.

6. **Security Depth** — bcrypt hashing, JWT with role embedding, blocked user checks on every request, regex injection prevention, Helmet security headers, CORS whitelist, auto-logout on token expiry.

7. **Error Resilience** — Uses Promise.allSettled instead of Promise.all for multi-request pages, so if one API call fails the rest of the page still loads. Partial failures show a warning toast instead of a blank page.

8. **46 Real Vehicles** — Seeded with real car data across 15 brands (Toyota, Honda, Suzuki, Hyundai, Kia, MG, BMW, Mercedes-Benz, Audi, Nissan, Mitsubishi, Isuzu, Haval, Changan, Proton) covering Petrol, Diesel, Electric, and Hybrid fuel types from Rs. 1.4M to Rs. 28M.

---

## ENVIRONMENT VARIABLES NEEDED

**Backend (.env):**
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/vehicle_vault
JWT_SECRET=any_long_random_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

---

## QUICK REFERENCE — PAGES AND WHAT THEY DO

| Page | URL | Who Can Access | What It Does |
|---|---|---|---|
| Home | / | Everyone | Landing page with hero, features, how-it-works |
| Vehicles | /vehicles | Everyone | Browse, search, filter, select for comparison |
| Vehicle Detail | /vehicles/:id | Everyone | Full specs, gallery, reviews, AI recommendations |
| Compare | /compare | Logged-in users | Side-by-side comparison report |
| Favorites | /favorites | Logged-in users | Saved vehicles list |
| Notifications | /notifications | Everyone | Admin announcements |
| Profile | /profile | Logged-in users | Account settings, activity history |
| Admin Dashboard | /admin | Admin only | Full platform management |
| Login | /login | Public | Sign in |
| Register | /register | Public | Create account |
| Reset Password | /reset-password | Public | Change forgotten password |

---

*Built with the MERN Stack — MongoDB, Express.js, React.js, Node.js*
