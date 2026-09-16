# CareerTrack

A dashboard for tracking internship and job applications, with an AI-powered
resume analyzer that compares your resume against a job description.

**Live demo:** [https://careertrack-raghuraj.netlify.app/]
**Backend API:** [https://careertrack-backend-l20o.onrender.com/]

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
git clone https://github.com/raghurajparmar61/CareerTrack.git
cd CareerTrack
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Copy the `.env.example` file (in the repo root) into the `Backend` folder and rename it to `.env`:

```bash
cp ../.env.example .env
```

Open `.env` and fill in your real values:

`MONGODB_URI=your_mongodb_connection_string`
`GEMINI_API_KEY=your_gemini_api_key`


Start the backend:

```bash
node server.js
```

You should see `MongoDB connected successfully!` and `CareerTrack server running on http://localhost:5001` in the terminal.

### 3. Frontend setup

The frontend is static — no build step. Open `Frontend/index.html` directly
in a browser, or serve the folder locally:

```bash
cd ../Frontend
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
