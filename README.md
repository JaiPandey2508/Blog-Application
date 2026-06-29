# Blogify — Full Stack MERN Blogging Platform

A full-stack blogging platform with a public-facing site for readers and a separate admin panel for content management. Admins can write posts using a rich text editor, generate draft content with AI assistance, manage publish status, and moderate reader comments before they go live.

**Live Demo:** _https://blog-application-jai-pandey.vercel.app_

---

## Features

**Public Site**

- Browse all published blog posts, filterable by category (Technology, Startup, Lifestyle, Finance)
- Full-text search across post titles and categories
- Individual blog post pages with rich text content
- Comment system — readers can submit comments on any post
- Social share links and newsletter signup UI

**Admin Panel**

- JWT-protected admin authentication
- Dashboard with live counts of total blogs, comments, and drafts
- Create posts with a Quill rich text editor and thumbnail upload
- AI-assisted content generation — generate a full draft from just a title, via OpenRouter (Gemini 2.0 Flash)
- Publish / unpublish toggle per post
- Comment moderation queue — new comments stay hidden from the public site until approved
- Delete posts (cascades to delete that post's comments) and delete individual comments

---

## Tech Stack

**Frontend**

- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Axios
- Quill (rich text editor)
- Moment.js (date formatting)
- Marked (Markdown → HTML, used for AI-generated content)
- React Hot Toast (notifications)
- Motion (UI animations)

**Backend**

- Node.js + Express 5
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for admin authentication
- Multer (multipart form / file upload handling)
- ImageKit (image hosting, CDN delivery, and on-the-fly optimization)
- OpenRouter API (AI content generation)

---

## Architecture Overview

```
Client (React SPA)
   │
   │  Axios requests, JWT in Authorization header
   ▼
Express REST API  ──►  Multer (parses uploaded image)
   │                         │
   │                         ▼
   │                    ImageKit (stores image, returns optimized URL)
   ▼
MongoDB (Mongoose models: Blog, Comment)
```

- The frontend is a single-page app. Global state (auth token, blog list, search input) is managed through React Context (`AppContext`) rather than prop-drilling or a separate state library.
- Admin authentication uses a single hardcoded admin identity (via environment variables) rather than a full user system — appropriate for a single-author blog, not designed for multi-user roles.
- Uploaded images are never stored in MongoDB or on the Node server's disk long-term. They're forwarded to ImageKit, which returns a CDN URL; only that URL string is saved to the database.
- New comments are saved with `isApproved: false` and are excluded from public queries until an admin approves them from the moderation panel.

---

## Project Structure

```
BlogApp-FullStackProject/
├── Backend/
│   ├── server.js              # Express app entry point
│   ├── configs/                # DB connection, ImageKit, AI client config
│   ├── models/                 # Mongoose schemas (Blog, Comment)
│   ├── controllers/             # Route logic (admin, blog)
│   ├── middlewares/             # JWT auth check, Multer upload config
│   └── routes/                  # API route definitions
│
└── Frontend/
    └── src/
        ├── context/             # AppContext — global state (auth, blogs, search)
        ├── pages/                # Home, Blog detail, Admin pages
        └── components/           # Navbar, BlogCard, BlogList, Admin subcomponents
```

---

## API Endpoints

**Public**
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blog/all` | Get all published blogs |
| GET | `/api/blog/:blogId` | Get a single blog by ID |
| POST | `/api/blog/comments` | Get approved comments for a blog |
| POST | `/api/blog/add-comment` | Submit a new comment (pending approval) |

**Admin (JWT-protected)**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login, returns JWT |
| GET | `/api/admin/dashboard` | Blog/comment/draft counts + recent posts |
| GET | `/api/admin/blogs` | Get all blogs (published + unpublished) |
| GET | `/api/admin/comments` | Get all comments (approved + pending) |
| POST | `/api/admin/approve-comment` | Approve a pending comment |
| POST | `/api/admin/delete-comment` | Delete a comment |
| POST | `/api/blog/add` | Create a new blog (multipart, includes image) |
| POST | `/api/blog/delete` | Delete a blog (and its comments) |
| POST | `/api/blog/toggle-publish` | Toggle a blog's published status |
| POST | `/api/blog/generate` | Generate blog content from a title via AI |

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB database (local or MongoDB Atlas)
- An ImageKit account (for image uploads)
- An OpenRouter API key (for AI content generation)

### 1. Clone the repository

```bash
git clone https://github.com/JaiPandey2508/Blog-Application
cd BlogApp-FullStackProject
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/`:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=3000
```

Run the backend:

```bash
npm run server   # nodemon, for development
# or
npm start         # plain node
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file inside `Frontend/`:

```
VITE_BACKEND_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`, with the admin panel at `http://localhost:5173/admin`.

---

## Deployment

Both the frontend and backend are deployed independently on **Vercel**:

- **Frontend:** [https://blog-application-jai-pandey.vercel.app](https://blog-application-jai-pandey.vercel.app)
- **Backend (API):** [https://blogify-server-delta-six.vercel.app](https://blogify-server-delta-six.vercel.app)
  Environment variables for both deployments (MongoDB URI, JWT secret, ImageKit keys, OpenRouter key, and `VITE_BACKEND_URL`) are configured through Vercel's project dashboard. The frontend's `VITE_BACKEND_URL` in production points at the deployed backend URL above instead of `localhost:3000`.

---

## Known Limitations

Documenting this honestly, since it's relevant for explaining design tradeoffs:

- Admin auth uses a single hardcoded credential pair rather than a user/role system — there's no token expiry or refresh mechanism.
- CORS is currently open to all origins (`app.use(cors())` with no whitelist) rather than restricted to the deployed frontend's domain.
- The newsletter signup form on the homepage is UI-only and not connected to any backend service.
- Public blog state (Context) and admin blog state (local to each admin page) are fetched independently and don't auto-sync — deleting a post from the admin panel won't update an already-loaded public homepage without a refresh.
