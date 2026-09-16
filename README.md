# CareerTrack

A dashboard for tracking internship and job applications, with an AI-powered
resume analyzer that compares your resume against a job description.

**Live demo:** [add your deployed frontend link here]
**Backend API:** [add your deployed backend link here]

<!-- Add a screenshot once the UI is deployed, e.g.: -->
<!-- ![CareerTrack dashboard](./screenshot.png) -->

## Features

- Track applications through a five-stage pipeline: Applied → Online
  Assessment → Interview → Selected / Rejected
- Dashboard with response rate, interview rate, and offer rate
- "Still in play" view of everything currently in Assessment or Interview
- Search applications by company or position
- AI resume analyzer: paste a resume and a job description, get a match
  score, matching/missing skills, and improvement suggestions (powered by
  the Gemini API)

## Tech stack

**Frontend:** HTML, CSS, vanilla JavaScript
**Backend:** Node.js, Express
**Database:** MongoDB
**AI:** Google Gemini API (`@google/genai`)

## Running it locally

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Backend setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
node server.js
```

You should see `MongoDB connected successfully!` and `CareerTrack server
running on http://localhost:5001` in the terminal.

### 3. Frontend setup

The frontend is static — no build step. Just open `index.html` in a
browser, or serve it locally, e.g.:

```bash
npx serve .
```

## API reference

| Method | Endpoint                    | Description                        |
| ------ | ---------------------------- | ----------------------------------- |
| GET    | `/api/applications`          | List all applications               |
| POST   | `/api/applications`          | Add a new application               |
| PUT    | `/api/applications/:id`      | Update an application's status      |
| DELETE | `/api/applications/:id`      | Delete an application                |
| POST   | `/api/ai/analyze`            | Analyze a resume against a job description |

## Future improvements

- Rate limiting on the AI analyze endpoint
- Restrict CORS to the deployed frontend origin only
- User accounts / authentication for multi-user support
- Automated tests

## License

MIT
