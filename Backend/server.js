const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// ========================================
// Required environment variables
// ========================================
// Fail fast with a clear message instead of a confusing crash
// further down (e.g. inside MongoClient or the AI client) if
// .env is missing or incomplete.
// ========================================

const requiredEnvVars = ["MONGODB_URI", "GEMINI_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variable(s): ${missingEnvVars.join(", ")}. ` +
        "Check that your .env file exists and matches .env.example."
    );
    process.exit(1);
}

const app = express();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const PORT = process.env.PORT || 5001;

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());


// Database variables
let db;
let applicationsCollection;


// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "CareerTrack backend is running!"
    });
});


// GET all applications
app.get("/api/applications", async (req, res) => {
    try {
        const applications = await applicationsCollection
            .find({})
            .sort({ date: -1 })
            .toArray();

        res.json(applications);

    } catch (error) {

        console.error("Error fetching applications:", error);

        res.status(500).json({
            message: "Failed to fetch applications"
        });

    }
});


// ========================================
// POST a new application
// ========================================

app.post("/api/applications", async (req, res) => {

    try {

        const { company, position, jobUrl, date, status, notes } = req.body;

        const VALID_STATUSES = [
            "Applied",
            "Online Assessment",
            "Interview",
            "Selected",
            "Rejected"
        ];

        if (!company || typeof company !== "string" || !company.trim()) {
            return res.status(400).json({
                message: "Company is required"
            });
        }

        if (!position || typeof position !== "string" || !position.trim()) {
            return res.status(400).json({
                message: "Position is required"
            });
        }

        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${VALID_STATUSES.join(", ")}`
            });
        }

        const application = {
            company: company.trim(),
            position: position.trim(),
            jobUrl,
            date,
            status,
            notes
        };

        const result = await applicationsCollection.insertOne(application);

        res.status(201).json({
            message: "Application added successfully!",
            application: {
                _id: result.insertedId,
                ...application
            }
        });

    } catch (error) {

        console.error("Error adding application:", error);

        res.status(500).json({
            message: "Failed to add application"
        });

    }
});


// ========================================
// DELETE an application
// ========================================

app.delete("/api/applications/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const result = await applicationsCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {

            return res.status(404).json({
                message: "Application not found"
            });

        }

        res.json({
            message: "Application deleted successfully!"
        });

    } catch (error) {

        console.error("Error deleting application:", error);

        res.status(500).json({
            message: "Failed to delete application"
        });

    }
});

// ========================================
// UPDATE application status
// ========================================

app.put("/api/applications/:id", async (req, res) => {

    try {

        const id = req.params.id;
        const newStatus = req.body.status;

        const result = await applicationsCollection.updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    status: newStatus
                }
            }
        );


        if (result.matchedCount === 0) {

            return res.status(404).json({
                message: "Application not found"
            });

        }


        res.json({
            message: "Application status updated successfully!"
        });


    } catch (error) {

        console.error("Error updating application:", error);

        res.status(500).json({
            message: "Failed to update application"
        });

    }
});
// ========================================
// AI Resume Analyzer
// ========================================

app.post("/api/ai/analyze", async (req, res) => {
    try {
        const { resume, jobDescription } = req.body;

        if (!resume || !jobDescription) {
            return res.status(400).json({
                message: "Resume and job description are required"
            });
        }
        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
        
            input: `
        You are a professional technical recruiter helping a college student analyze their resume against a job description.
        
        Analyze the resume and job description below.
        
        Return the result in exactly this JSON format:
        
        {
            "matchScore": 0,
            "matchingSkills": [],
            "missingSkills": [],
            "suggestions": []
        }
        
        Rules:
        - matchScore must be a number from 0 to 100.
        - matchingSkills should contain skills present in both the resume and job description.
        - missingSkills should contain important skills from the job description that are missing from the resume.
        - suggestions should contain practical improvements the student can make.
        - Keep suggestions concise and useful.
        - Return ONLY valid JSON.
        
        RESUME:
        ${resume}
        
        JOB DESCRIPTION:
        ${jobDescription}
            `,
        
            response_format: {
                type: "text",
                mime_type: "application/json",
                schema: {
                    type: "object",
                    properties: {
                        matchScore: {
                            type: "number"
                        },
                        matchingSkills: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        },
                        missingSkills: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        },
                        suggestions: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        }
                    },
                    required: [
                        "matchScore",
                        "matchingSkills",
                        "missingSkills",
                        "suggestions"
                    ]
                }
            }
        });
        
        const result = JSON.parse(interaction.output_text);

        res.json(result);

    } catch (error) {
        console.error("AI analysis error:", error);

        res.status(500).json({
            message: "Failed to analyze resume"
        });
    }
});

// Start Server
async function startServer() {

    try {

        await client.connect();

        console.log("MongoDB connected successfully!");

        // Select database
        db = client.db("CareerTrack");

        // Select collection
        applicationsCollection = db.collection("applications");

        console.log("CareerTrack database ready!");

        app.listen(PORT, () => {
            console.log(
                `CareerTrack server running on http://localhost:${PORT}`
            );
        });

    } catch (error) {

        console.error("MongoDB connection failed:", error);

    }
}


startServer();