// ========================================
// CareerTrack - Frontend JavaScript
// ========================================

// ========================================
// API Configuration
// ========================================
// Locally this points at your local backend. Once you deploy the
// backend (Render, Railway, etc.), replace the URL below with your
// real deployed backend URL — everything else in this file already
// builds on top of these two constants, so that's the only edit
// needed.
// ========================================

const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API_BASE = isLocal
    ? "http://localhost:5001"
    : "https://REPLACE-WITH-YOUR-DEPLOYED-BACKEND-URL.onrender.com";

const API_URL = `${API_BASE}/api/applications`;


// ========================================
// Status values
// ========================================

const STATUS = {
    applied: "Applied",
    onlineAssessment: "Online Assessment",
    interview: "Interview",
    selected: "Selected",
    rejected: "Rejected"
};


// ========================================
// Applications
// ========================================

let applications = [];


// ========================================
// Get HTML Elements
// ========================================

const form = document.getElementById("application-form");
const tableBody = document.getElementById("applications-body");
const emptyState = document.getElementById("empty-state");


// Statistics elements
const statTotal = document.getElementById("stat-total");
const statApplied = document.getElementById("stat-applied");
const statOA = document.getElementById("stat-oa");
const statInterview = document.getElementById("stat-interview");
const statSelected = document.getElementById("stat-selected");
const statRejected = document.getElementById("stat-rejected");


// ========================================
// Progress Panel Elements
// ========================================

const rateResponse = document.getElementById("rate-response");
const meterResponse = document.getElementById("meter-response");

const rateInterview = document.getElementById("rate-interview");
const meterInterview = document.getElementById("meter-interview");

const rateOffer = document.getElementById("rate-offer");
const meterOffer = document.getElementById("meter-offer");

const inPlayList = document.getElementById("in-play-list");
const inPlayEmpty = document.getElementById("in-play-empty");


// ========================================
// Ratio Bar Elements
// ========================================
// index.html gives these elements classes, not ids
// (e.g. class="ratio-seg seg-applied"), so they must
// be selected with querySelector + a class selector,
// not getElementById.
// ========================================

const segApplied = document.querySelector(".seg-applied");
const segOA = document.querySelector(".seg-oa");
const segInterview = document.querySelector(".seg-interview");
const segSelected = document.querySelector(".seg-selected");
const segRejected = document.querySelector(".seg-rejected");


// ========================================
// Load Applications From MongoDB
// ========================================

async function loadApplications() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch applications");
        }

        applications = await response.json();

        renderApplications();
        updateStatistics();
        updateProgress();
        updateRatioBar();

    } catch (error) {

        console.error("Error loading applications:", error);

    }
}


// ========================================
// Update Dashboard Statistics
// ========================================

function updateStatistics() {

    statTotal.textContent = applications.length;

    statApplied.textContent =
        applications.filter(app => app.status === STATUS.applied).length;

    statOA.textContent =
        applications.filter(app => app.status === STATUS.onlineAssessment).length;

    statInterview.textContent =
        applications.filter(app => app.status === STATUS.interview).length;

    statSelected.textContent =
        applications.filter(app => app.status === STATUS.selected).length;

    statRejected.textContent =
        applications.filter(app => app.status === STATUS.rejected).length;
}


// ========================================
// Update Progress Panel
// ========================================

function updateProgress() {

    const total = applications.length;

    // If there are no applications
    if (total === 0) {

        rateResponse.textContent = "0%";
        meterResponse.style.width = "0%";

        rateInterview.textContent = "0%";
        meterInterview.style.width = "0%";

        rateOffer.textContent = "0%";
        meterOffer.style.width = "0%";

        updateStillInPlay();

        return;
    }


    // ========================================
    // Heard Back
    // ========================================
    // Applications that moved beyond "Applied"
    //
    // OA + Interview + Selected + Rejected
    // ========================================

    const heardBack = applications.filter(function (app) {

        return (
            app.status === STATUS.onlineAssessment ||
            app.status === STATUS.interview ||
            app.status === STATUS.selected ||
            app.status === STATUS.rejected
        );

    }).length;


    const responseRate = Math.round(
        (heardBack / total) * 100
    );


    rateResponse.textContent = `${responseRate}%`;
    meterResponse.style.width = `${responseRate}%`;


    // ========================================
    // Reached Interview
    // ========================================

    const interviews = applications.filter(function (app) {

        return (
            app.status === STATUS.interview ||
            app.status === STATUS.selected
        );

    }).length;


    const interviewRate = Math.round(
        (interviews / total) * 100
    );


    rateInterview.textContent = `${interviewRate}%`;
    meterInterview.style.width = `${interviewRate}%`;


    // ========================================
    // Offers
    // ========================================

    const selected = applications.filter(function (app) {

        return app.status === STATUS.selected;

    }).length;


    const offerRate = Math.round(
        (selected / total) * 100
    );


    rateOffer.textContent = `${offerRate}%`;
    meterOffer.style.width = `${offerRate}%`;


    // Update Still In Play
    updateStillInPlay();
}


// ========================================
// Still In Play
// ========================================

function updateStillInPlay() {

    inPlayList.innerHTML = "";

    const stillInPlay = applications.filter(function (app) {

        return (
            app.status === STATUS.applied ||
            app.status === STATUS.onlineAssessment ||
            app.status === STATUS.interview
        );

    });


    // No applications still active
    if (stillInPlay.length === 0) {

        inPlayEmpty.hidden = false;

        return;
    }


    inPlayEmpty.hidden = true;


    stillInPlay.forEach(function (application) {

        const item = document.createElement("li");


        // Company + position, styled as the CSS expects
        const company = document.createElement("span");

        company.className = "in-play-company";

        company.textContent =
            `${application.company} — ${application.position}`;


        // Status chip, coloured to match the rest of the app
        const stage = document.createElement("span");

        stage.className =
            "in-play-stage " + getStatusClass(application.status);

        stage.textContent = application.status;


        item.appendChild(company);
        item.appendChild(stage);

        inPlayList.appendChild(item);

    });
}


// ========================================
// Update Pipeline Ratio Bar
// ========================================

function updateRatioBar() {

    const total = applications.length;


    // No applications
    if (total === 0) {

        segApplied.style.width = "0%";
        segOA.style.width = "0%";
        segInterview.style.width = "0%";
        segSelected.style.width = "0%";
        segRejected.style.width = "0%";

        return;
    }


    const applied = applications.filter(
        app => app.status === STATUS.applied
    ).length;

    const oa = applications.filter(
        app => app.status === STATUS.onlineAssessment
    ).length;

    const interview = applications.filter(
        app => app.status === STATUS.interview
    ).length;

    const selected = applications.filter(
        app => app.status === STATUS.selected
    ).length;

    const rejected = applications.filter(
        app => app.status === STATUS.rejected
    ).length;


    // Convert counts into percentages
    segApplied.style.width = `${(applied / total) * 100}%`;

    segOA.style.width = `${(oa / total) * 100}%`;

    segInterview.style.width = `${(interview / total) * 100}%`;

    segSelected.style.width = `${(selected / total) * 100}%`;

    segRejected.style.width = `${(rejected / total) * 100}%`;
}


// ========================================
// Get CSS Class For Status
// ========================================

function getStatusClass(status) {

    if (status === STATUS.applied) {
        return "status-applied";
    }

    if (status === STATUS.onlineAssessment) {
        return "status-oa";
    }

    if (status === STATUS.interview) {
        return "status-interview";
    }

    if (status === STATUS.selected) {
        return "status-selected";
    }

    if (status === STATUS.rejected) {
        return "status-rejected";
    }

    return "";
}


// ========================================
// Format Date For Display
// ========================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const parsed = new Date(value);

    if (isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ========================================
// Display Applications
// ========================================

function renderApplications(list) {

    // Use the full list unless a filtered list is passed in
    const items = list || applications;

    tableBody.innerHTML = "";


    // If there are no applications
    if (items.length === 0) {

        emptyState.hidden = false;
        return;
    }


    emptyState.hidden = true;


    // Create table row for every application
    items.forEach(function (application) {

        const row = document.createElement("tr");


        // ========================================
        // Company
        // ========================================

        const companyCell = document.createElement("td");

        const companyLink = document.createElement("a");

        companyLink.textContent = application.company;

        companyLink.className = "company-link";


        if (application.jobUrl) {

            companyLink.href = application.jobUrl;

            companyLink.target = "_blank";

            companyLink.rel = "noopener noreferrer";
        }


        companyCell.appendChild(companyLink);


        // ========================================
        // Position
        // ========================================

        const positionCell = document.createElement("td");

        positionCell.textContent = application.position;


        // ========================================
        // Date
        // ========================================

        const dateCell = document.createElement("td");

        dateCell.className = "date-cell";

        dateCell.textContent = formatDate(application.date);


        // ========================================
        // Status
        // ========================================

        const statusCell = document.createElement("td");

        const statusSelect = document.createElement("select");

        statusSelect.className =
            "status-select " + getStatusClass(application.status);


        // Status options
        const statusOptions = [
            STATUS.applied,
            STATUS.onlineAssessment,
            STATUS.interview,
            STATUS.selected,
            STATUS.rejected
        ];


        statusOptions.forEach(function (status) {

            const option = document.createElement("option");

            option.value = status;

            option.textContent = status;


            if (status === application.status) {
                option.selected = true;
            }


            statusSelect.appendChild(option);

        });


        statusSelect.addEventListener("change", function () {

            // Recolour badge immediately
            statusSelect.className =
                "status-select " + getStatusClass(statusSelect.value);


            updateApplicationStatus(
                application._id,
                statusSelect.value
            );

        });


        statusCell.appendChild(statusSelect);


        // ========================================
        // Delete Button
        // ========================================

        const actionCell = document.createElement("td");

        actionCell.className = "col-action";


        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "btn-delete";


        deleteButton.addEventListener("click", function () {

            deleteApplication(application._id);

        });


        actionCell.appendChild(deleteButton);


        // ========================================
        // Add cells to row
        // ========================================

        row.appendChild(companyCell);

        row.appendChild(positionCell);

        row.appendChild(dateCell);

        row.appendChild(statusCell);

        row.appendChild(actionCell);


        // Add row to table
        tableBody.appendChild(row);

    });
}


// ========================================
// Delete Application
// ========================================

async function deleteApplication(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });


        if (!response.ok) {
            throw new Error("Failed to delete application");
        }


        // Remove application from frontend array
        applications = applications.filter(
            application => application._id !== id
        );


        // Refresh table
        applySearch();


        // Refresh dashboard
        updateStatistics();

        updateProgress();

        updateRatioBar();


    } catch (error) {

        console.error("Error deleting application:", error);

        alert("Failed to delete application. Please try again.");

    }
}


// ========================================
// Update Application Status
// ========================================

async function updateApplicationStatus(id, newStatus) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: newStatus
            })
        });


        if (!response.ok) {
            throw new Error("Failed to update application status");
        }


        // Update local application data
        applications = applications.map(function (application) {

            if (application._id === id) {

                return {
                    ...application,
                    status: newStatus
                };

            }

            return application;

        });


        // Refresh dashboard
        updateStatistics();

        updateProgress();

        updateRatioBar();


    } catch (error) {

        console.error("Error updating application status:", error);

        alert("Failed to update application status. Please try again.");

    }
}


// ========================================
// Add New Application
// ========================================

form.addEventListener("submit", async function (event) {

    // Prevent page refresh
    event.preventDefault();


    // Get form data
    const formData = new FormData(form);


    // Create application object
    const newApplication = {

        company: formData.get("company"),

        position: formData.get("position"),

        jobUrl: formData.get("jobUrl"),

        date: formData.get("date"),

        status: formData.get("status"),

        notes: formData.get("notes")
    };


    try {

        // Send application to backend
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newApplication)
        });


        if (!response.ok) {
            throw new Error("Failed to add application");
        }


        // Get response from backend
        const data = await response.json();


        // Add MongoDB application to frontend array
        applications.push(data.application);


        // Refresh table
        applySearch();


        // Refresh dashboard
        updateStatistics();

        updateProgress();

        updateRatioBar();


        // Clear form
        form.reset();


    } catch (error) {

        console.error("Error adding application:", error);

        alert("Failed to add application. Please try again.");

    }
});


// ========================================
// Search Applications
// ========================================

const searchInput = document.getElementById("search-input");


function applySearch() {

    const searchText = searchInput.value.toLowerCase().trim();


    if (!searchText) {

        emptyState.textContent =
            "Nothing here yet. Add your first application from the form on the left.";

        renderApplications();

        return;
    }


    const filteredApplications = applications.filter(function (application) {

        return (
            application.company.toLowerCase().includes(searchText) ||
            application.position.toLowerCase().includes(searchText)
        );

    });


    emptyState.textContent =
        "No applications match that search. Try a different company or position.";


    renderApplications(filteredApplications);
}


searchInput.addEventListener("input", applySearch);


// ========================================
// AI Resume Analyzer
// ========================================

const analyzeButton = document.getElementById("analyze-btn");

const resumeInput = document.getElementById("resume");

const jobDescriptionInput =
    document.getElementById("job-description");

const aiResult =
    document.getElementById("ai-result");

const scoreRing =
    document.getElementById("score-ring");

const matchScore =
    document.getElementById("match-score");

const matchingSkills =
    document.getElementById("matching-skills");

const missingSkills =
    document.getElementById("missing-skills");

const suggestions =
    document.getElementById("suggestions");


analyzeButton.addEventListener("click", async function () {

    const resume = resumeInput.value.trim();

    const jobDescription =
        jobDescriptionInput.value.trim();


    // Check if fields are empty
    if (!resume || !jobDescription) {

        alert(
            "Please enter both your resume and job description."
        );

        return;
    }


    // Change button while AI is working
    analyzeButton.textContent = "Analyzing...";

    analyzeButton.disabled = true;


    try {

        const response = await fetch(
            `${API_BASE}/api/ai/analyze`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    resume: resume,
                    jobDescription: jobDescription
                })
            }
        );


        if (!response.ok) {
            throw new Error("AI analysis failed");
        }


        const data = await response.json();


        // ========================================
        // Show Match Score
        // ========================================

        matchScore.textContent = data.matchScore;


        // ========================================
        // Clear Previous Results
        // ========================================

        matchingSkills.innerHTML = "";

        missingSkills.innerHTML = "";

        suggestions.innerHTML = "";


        // ========================================
        // Matching Skills
        // ========================================

        data.matchingSkills.forEach(function (skill) {

            const li = document.createElement("li");

            li.textContent = skill;

            matchingSkills.appendChild(li);

        });


        // ========================================
        // Missing Skills
        // ========================================

        data.missingSkills.forEach(function (skill) {

            const li = document.createElement("li");

            li.textContent = skill;

            missingSkills.appendChild(li);

        });


        // ========================================
        // Suggestions
        // ========================================

        data.suggestions.forEach(function (suggestion) {

            const li = document.createElement("li");

            li.textContent = suggestion;

            suggestions.appendChild(li);

        });


        // ========================================
        // Show Result Section
        // ========================================

        aiResult.hidden = false;


        // Fill score ring
        scoreRing.style.setProperty("--score", 0);


        requestAnimationFrame(function () {

            scoreRing.style.setProperty(
                "--score",
                Number(data.matchScore) || 0
            );

        });


    } catch (error) {

        console.error("AI analysis error:", error);

        alert(
            "AI analysis failed. Please make sure the backend server is running."
        );

    } finally {

        analyzeButton.textContent = "Analyze resume";

        analyzeButton.disabled = false;

    }
});


// ========================================
// Initial Page Load
// ========================================

loadApplications();