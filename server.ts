import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { CivicIssue, UserStats, CommunityForecast } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Middleware for parsing JSON
app.use(express.json());

// In-Memory Database
let issues: CivicIssue[] = [
  {
    id: "iss-101",
    title: "Dangerous Deep Pothole on Indiranagar 100 Feet Road",
    description: "An extremely deep pothole has formed in the middle lane of 100 Feet Road. During monsoon showers, it gets filled with water, making it a death trap for two-wheelers. Multiple bikers have already lost balance trying to dodge it.",
    category: "Pothole",
    severity: "High",
    status: "Verified",
    location: {
      lat: 12.9719,
      lng: 77.6412,
      address: "412, 100 Feet Road, Halasuru, Indiranagar, Bengaluru, Karnataka 560038",
      neighborhood: "100 Feet Road, Indiranagar"
    },
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    reportedBy: "arjun.k@bengaluru.org",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 24,
    verifiedBy: ["priya.nair@gmail.com", "rajesh.p@bengaluru.org", "civic_patrol@bengaluru.net"],
    aiAnalysis: {
      category: "Pothole",
      severity: "High",
      predictiveInsight: "High risk of two-wheeler skid hazards. Heavy monsoon forecast will accelerate asphalt base failure and expand the crater diameter by up to 50%.",
      actionPlan: "1. Secure area with barricades. 2. Excavate and saw-cut damaged asphalt. 3. Backfill dry aggregate aggregate base and compact. 4. Lay hot asphalt mix and steamroll.",
      estimatedCost: "₹15,000 - ₹25,000"
    },
    timeline: [
      { status: "Reported", label: "Issue Reported", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), note: "Reported by Arjun K. with photos." },
      { status: "Verified", label: "Community Verified", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: "Consensus reached (+24 verified support votes from local commuters)." }
    ],
    comments: [
      { id: "c1", user: "Priya Nair", text: "Almost fell off my scooter here last night! Extremely risky after sunset when streetlights flicker.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "c2", user: "BBMP Ward Portal (Auto)", text: "This issue has been flagged for municipal road maintenance dispatch following successful community verification.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isOfficial: true }
    ]
  },
  {
    id: "iss-102",
    title: "BWSSB Water Pipeline Leakage Flooding Roadway",
    description: "Drinking water is bubbling up rapidly from under the concrete slab and flooding the road near the junction. Wasting thousands of litres of clean municipal water and making the sidewalk slippery and muddy.",
    category: "Water Leakage",
    severity: "Critical",
    status: "In Progress",
    location: {
      lat: 12.9640,
      lng: 77.6290,
      address: "88, Inner Ring Road, near Domlur Flyover, Bengaluru, Karnataka 560071",
      neighborhood: "Domlur Layout"
    },
    imageUrl: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=800&q=80",
    reportedBy: "rahul.sharma@gmail.com",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 42,
    verifiedBy: ["arjun.k@bengaluru.org", "engineer_prasad@bwssb.gov.in"],
    aiAnalysis: {
      category: "Water Leakage",
      severity: "Critical",
      predictiveInsight: "Continuous sub-surface water leakage poses an immediate risk of hollow cavities and sinkholes. Severe drinking water wastage during summer months.",
      actionPlan: "1. Dispatch emergency BWSSB water utility response crew. 2. Close localized supply gate valve. 3. Jackhammer concrete slab. 4. Clamp/replace ruptured pipe section. 5. Lay cement and restore sidewalk.",
      estimatedCost: "₹45,000 - ₹90,000"
    },
    timeline: [
      { status: "Reported", label: "Issue Reported", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: "Reported by Rahul S." },
      { status: "Verified", label: "Community Verified", timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(), note: "Verified rapidly by neighboring shop owners." },
      { status: "Scheduled", label: "BWSSB Repair Scheduled", timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), note: "Maintenance Order #BWSSB-9092 generated." },
      { status: "In Progress", label: "Excavation Started", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: "BWSSB repair crew is on site with backhoe/excavator repairing the sub-surface pipeline." }
    ],
    comments: [
      { id: "c3", user: "Koramangala Café Owners", text: "Water supply in our block has gone completely dry. Glad the team is already on-site repairing it!", createdAt: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "c4", user: "BWSSB Supervisor", text: "Located 4-inch iron pipe rupture. Heavy excavation complete. Preparing to mount high-pressure repair collar.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), isOfficial: true }
    ]
  },
  {
    id: "iss-103",
    title: "Dead Streetlight & Pitch Dark Walkway at Metro Pillar 56",
    description: "The LED streetlamp at Metro Pillar 56 crosswalk is completely dead. This is an active corridor where commuters, seniors and women walk home in the evening. It is pitch black and autos speed through this curve.",
    category: "Streetlight",
    severity: "Medium",
    status: "Scheduled",
    location: {
      lat: 12.9780,
      lng: 77.6510,
      address: "Metro Pillar 56, 1st Cross Road, Defence Colony, Indiranagar, Bengaluru, Karnataka 560038",
      neighborhood: "Defence Colony, Indiranagar"
    },
    imageUrl: "https://images.unsplash.com/photo-1509024644558-2f0609b409e5?auto=format&fit=crop&w=800&q=80",
    reportedBy: "deepa.r@bengaluru.net",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 18,
    verifiedBy: ["arjun.k@bengaluru.org", "priya.nair@gmail.com"],
    aiAnalysis: {
      category: "Streetlight",
      severity: "Medium",
      predictiveInsight: "Increases risk of vehicle-pedestrian collisions by 60% during evening rush hours. Safe transit zone compromised.",
      actionPlan: "1. Inspect pillar distribution box wiring. 2. Replace blown photo-electric sensor / dead LED driver circuit. 3. Test sensor switch.",
      estimatedCost: "₹5,000 - ₹12,000"
    },
    timeline: [
      { status: "Reported", label: "Issue Reported", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "Verified", label: "Community Verified", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "Scheduled", label: "Scheduled for Repair", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: "Added to BESCOM utility contractor rotation for next Wednesday." }
    ],
    comments: [
      { id: "c5", user: "Deepa R.", text: "It's extremely scary walking home from the Indiranagar Metro Station after dark. Kindly fix this quickly!", createdAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "iss-104",
    title: "Illegal Garbage Dumping Corner Eshwara Layout",
    description: "Someone has dumped 10 large bags of commercial plastic trash, wet food garbage, and glass bottles right at the corner of Eshwara Layout. Stray animals are spreading it all over, causing an terrible stench.",
    category: "Waste Management",
    severity: "High",
    status: "Reported",
    location: {
      lat: 12.9590,
      lng: 77.6480,
      address: "Corner of 12th A Main & 2nd Cross Road, Eshwara Layout, Indiranagar, Bengaluru, Karnataka 560008",
      neighborhood: "Eshwara Layout, Indiranagar"
    },
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
    reportedBy: "clean_bengaluru@outlook.com",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    votes: 6,
    verifiedBy: ["rahul.sharma@gmail.com"],
    aiAnalysis: {
      category: "Waste Management",
      severity: "High",
      predictiveInsight: "Rotting debris will clog stormwater side drains during unexpected showers. Poses health risks and breeds mosquitoes in the residential zone.",
      actionPlan: "1. Tape off dumping area. 2. Dispatch BBMP solid waste management truck. 3. Clean up loose litter and disinfect the road surface. 4. Put up a 'Fine for Littering' sign.",
      estimatedCost: "₹3,500 - ₹7,000"
    },
    timeline: [
      { status: "Reported", label: "Issue Reported", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), note: "Reported near the corner park gate." }
    ],
    comments: [
      { id: "c6", user: "Eshwara Resident Group", text: "We can organize a weekend volunteer clean-up under 'Namma Clean Drive' if BBMP supports us with waste disposal bags!", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }
    ]
  }
];

// Leaderboard / Gamification
let userLeaderboard: UserStats[] = [
  { email: "arjun.k@bengaluru.org", points: 420, reportsSubmitted: 8, validationsMade: 18, commentsAdded: 12, resolvedHelpCount: 3 },
  { email: "rahul.sharma@gmail.com", points: 310, reportsSubmitted: 4, validationsMade: 12, commentsAdded: 6, resolvedHelpCount: 2 },
  { email: "priya.nair@gmail.com", points: 240, reportsSubmitted: 2, validationsMade: 15, commentsAdded: 8, resolvedHelpCount: 1 },
  { email: "clean_bengaluru@outlook.com", points: 195, reportsSubmitted: 5, validationsMade: 3, commentsAdded: 4, resolvedHelpCount: 2 },
  { email: "deepa.r@bengaluru.net", points: 130, reportsSubmitted: 1, validationsMade: 8, commentsAdded: 3, resolvedHelpCount: 0 }
];

// Helper to update user points
function awardPoints(email: string, points: number, actionType: "report" | "verify" | "comment" | "help") {
  let user = userLeaderboard.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      email,
      points: 0,
      reportsSubmitted: 0,
      validationsMade: 0,
      commentsAdded: 0,
      resolvedHelpCount: 0
    };
    userLeaderboard.push(user);
  }
  user.points += points;
  if (actionType === "report") user.reportsSubmitted += 1;
  if (actionType === "verify") user.validationsMade += 1;
  if (actionType === "comment") user.commentsAdded += 1;
  if (actionType === "help") user.resolvedHelpCount += 1;
}

// Helper to generate content with model fallbacks
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) {
    throw new Error("Gemini API is not initialized.");
  }

  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini API] Attempting generateContent with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });
      console.log(`[Gemini API] Generation successful with model: ${model}`);
      return response;
    } catch (err: any) {
      console.error(`[Gemini API] Error with model ${model}:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
}

// Rule-based fallback analyzer when Gemini API fails
function getSimulatedAnalyzeResponse(description: string) {
  const text = description.toLowerCase();
  
  let category: "Pothole" | "Water Leakage" | "Streetlight" | "Waste Management" | "Public Infrastructure" | "Other" = "Other";
  let suggestedTitle = "Reported Civic Concern";
  let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
  let predictiveInsight = "Without active remediation, this reported issue could cause increased localized inconvenience or minor safety hazards.";
  let actionPlan = "1. Dispatch ward inspector to verify reported site. 2. Categorize and create BBMP/BESCOM/BWSSB work order. 3. Resolve using standard municipal guidelines.";
  let estimatedCost = "₹10,000 - ₹25,000";

  if (text.includes("pothole") || text.includes("road") || text.includes("asphalt") || text.includes("crater") || text.includes("bump")) {
    category = "Pothole";
    suggestedTitle = "Hazardous Pothole reported on roadway";
    severity = text.includes("deep") || text.includes("huge") || text.includes("tire") ? "High" : "Medium";
    predictiveInsight = "High risk of two-wheeler skid hazards. Heavy monsoon showers will expand the cavity base and deteriorate asphalt foundations rapidly.";
    actionPlan = "1. Place safety cones and alerts.\n2. Excavate and saw-cut damaged asphalt.\n3. Backfill aggregates and compact thoroughly.\n4. Apply hot asphalt mix and steamroll to grade.";
    estimatedCost = "₹12,000 - ₹20,000";
  } else if (text.includes("water") || text.includes("leak") || text.includes("pipe") || text.includes("bubble") || text.includes("flood")) {
    category = "Water Leakage";
    suggestedTitle = "Water Leak / Pipe Rupture";
    severity = text.includes("flood") || text.includes("rapid") || text.includes("spraying") ? "Critical" : "High";
    predictiveInsight = "Sub-surface soil erosion poses a risk of cavity formation under sidewalk concrete slabs. Drinking water leakage impacts potable water supply.";
    actionPlan = "1. Dispatch emergency BWSSB utility crew.\n2. Close the nearby control valve.\n3. Jackhammer cement concrete sidewalk.\n4. Install repair clamp collar on pipe.\n5. Restore soil base and repave.";
    estimatedCost = "₹35,000 - ₹75,000";
  } else if (text.includes("light") || text.includes("dark") || text.includes("lamp") || text.includes("bulb") || text.includes("streetlamp")) {
    category = "Streetlight";
    suggestedTitle = "Inoperative Streetlight / Dark Crosswalk";
    severity = text.includes("crosswalk") || text.includes("pitch black") ? "High" : "Medium";
    predictiveInsight = "Severely compromises pedestrian safety and driver visibility during night hours, raising accident risk at crosswalks.";
    actionPlan = "1. Locate standard light pole.\n2. Open electrical service hatch.\n3. Test photosensor trigger and LED driver.\n4. Replace dead bulb/wiring connector.\n5. Confirm automatic dusk activation.";
    estimatedCost = "₹4,000 - ₹8,000";
  } else if (text.includes("trash") || text.includes("dump") || text.includes("waste") || text.includes("garbage") || text.includes("debris")) {
    category = "Waste Management";
    suggestedTitle = "Illegal Garbage Dumping on Public Path";
    severity = text.includes("toxic") || text.includes("chemical") || text.includes("glass") ? "High" : "Medium";
    predictiveInsight = "Piles left unattended may clog stormwater drains during monsoon showers, breeding mosquitoes and stray dog menaces.";
    actionPlan = "1. Place 'No Littering' warning board.\n2. Dispatch BBMP solid waste garbage truck.\n3. Sweep up debris and clean the spot.\n4. Sanitize with disinfectant powder.";
    estimatedCost = "₹3,000 - ₹6,000";
  } else if (text.includes("bridge") || text.includes("sidewalk") || text.includes("bench") || text.includes("concrete") || text.includes("structure")) {
    category = "Public Infrastructure";
    suggestedTitle = "Damaged Public Sidewalk or Structural Element";
    severity = "Medium";
    predictiveInsight = "Further weathering and pedestrian traffic will widen fractures, leading to severe tripping hazards.";
    actionPlan = "1. Place safety barriers around the defect.\n2. Jackhammer cracked or uneven concrete slabs.\n3. Level subgrade aggregates.\n4. Pour fresh cement concrete mix and finish.";
    estimatedCost = "₹15,000 - ₹30,000";
  }

  // Customize title slightly if more details are present
  if (text.includes("on ") || text.includes("near ") || text.includes("at ")) {
    const parts = description.match(/(?:on|near|at)\s+([A-Za-z0-9\s\.\,\-]+)/i);
    if (parts && parts[1] && parts[1].trim().length > 3) {
      const locationPart = parts[1].trim().split(/\s+/).slice(0, 3).join(" ");
      suggestedTitle += ` near ${locationPart}`;
    }
  }

  return {
    suggestedTitle,
    category,
    severity,
    predictiveInsight,
    actionPlan,
    estimatedCost,
    isSimulated: true
  };
}

// Dynamic rule-based fallback forecast generator when Gemini API fails
function getSimulatedForecast() {
  const activeIssues = issues.filter(i => i.status !== "Resolved");
  const activeCount = activeIssues.length;
  const resolvedCount = issues.filter(i => i.status === "Resolved").length;
  const highSeverityCount = activeIssues.filter(i => i.severity === "High" || i.severity === "Critical").length;

  // Calculate dynamic overall score
  let overallScore = 95;
  for (const issue of activeIssues) {
    if (issue.severity === "Critical") overallScore -= 10;
    else if (issue.severity === "High") overallScore -= 6;
    else if (issue.severity === "Medium") overallScore -= 3;
    else overallScore -= 1;
  }
  overallScore = Math.max(40, overallScore);

  // Generate dynamic summary
  let aiSummary = "";
  if (activeCount === 0) {
    aiSummary = "Bengaluru's civic infrastructure in this ward is in pristine condition. There are currently no active community concerns reported, reflecting superb local ward maintenance and rapid citizen resolution rates.";
  } else {
    aiSummary = `Bengaluru Civic Watch is actively tracking ${activeCount} community concern${activeCount > 1 ? 's' : ''} in the Indiranagar ward, with ${highSeverityCount} classified as highly urgent. While the community is highly engaged with ${resolvedCount} issues successfully resolved, immediate focus is required to prevent compound hazards in critical spots.`;
  }

  // Generate dynamic predictions based on active issues or general templates
  const predictions: any[] = [];

  // Pothole template
  const activePotholes = activeIssues.filter(i => i.category === "Pothole");
  if (activePotholes.length > 0) {
    const p = activePotholes[0];
    predictions.push({
      title: "Monsoon Pothole Expansion",
      riskLevel: p.severity === "Critical" || p.severity === "High" ? "High" : "Medium",
      probability: p.severity === "Critical" ? 90 : 75,
      recommendedPreemptiveAction: `Deploy localized cold-patch filling or hot asphalt resurfacing around ${p.location.address} to prevent two-wheeler skid accidents and traffic congestion.`,
      location: p.location.neighborhood
    });
  } else {
    predictions.push({
      title: "Seasonal Thermal Pavement Stress",
      riskLevel: "Low",
      probability: 35,
      recommendedPreemptiveAction: "Routine thermal asphalt crack sealing on high-volume municipal arterial avenues.",
      location: "Defence Colony, Indiranagar"
    });
  }

  // Water leakage template
  const activeWater = activeIssues.filter(i => i.category === "Water Leakage");
  if (activeWater.length > 0) {
    const w = activeWater[0];
    predictions.push({
      title: "Sub-surface Erosion & Sinking",
      riskLevel: "High",
      probability: 85,
      recommendedPreemptiveAction: `Fast-track emergency water pipe clamp repairs near ${w.location.address} to stop active BWSSB subgrade soil erosion and sidewalk cracking.`,
      location: w.location.neighborhood
    });
  } else {
    predictions.push({
      title: "Main Supply Pressure Fluctuations",
      riskLevel: "Low",
      probability: 25,
      recommendedPreemptiveAction: "Periodic verification of BWSSB supply pressure relief valves at major pump stations.",
      location: "100 Feet Road, Indiranagar"
    });
  }

  // Streetlight template
  const activeLight = activeIssues.filter(i => i.category === "Streetlight");
  if (activeLight.length > 0) {
    const l = activeLight[0];
    predictions.push({
      title: "Pedestrian Crosswalk Visibility Hazard",
      riskLevel: l.severity === "Critical" || l.severity === "High" ? "High" : "Medium",
      probability: l.severity === "Critical" ? 80 : 60,
      recommendedPreemptiveAction: `Deploy portable floodlights or fast-track BESCOM LED driver replacement at ${l.location.address} to ensure safe pedestrian crossings.`,
      location: l.location.neighborhood
    });
  } else {
    predictions.push({
      title: "Sensor Relay Automation Malfunction",
      riskLevel: "Low",
      probability: 30,
      recommendedPreemptiveAction: "Preventive replacement of astronomical timers and photocells in municipal lighting columns.",
      location: "Eshwara Layout, Indiranagar"
    });
  }

  // Ensure exactly 3 predictions
  while (predictions.length < 3) {
    predictions.push({
      title: "General Maintenance Backlog Delay",
      riskLevel: "Low",
      probability: 20,
      recommendedPreemptiveAction: "Review volunteer coordinates to handle neighborhood-level non-critical cleanups.",
      location: "Domlur Layout"
    });
  }

  return {
    updatedAt: new Date().toISOString(),
    overallScore,
    aiSummary,
    predictions: predictions.slice(0, 3),
    isSimulated: true
  };
}

// 1. GET /api/issues
app.get("/api/issues", (req, res) => {
  res.json(issues);
});

// 2. GET /api/leaderboard
app.get("/api/leaderboard", (req, res) => {
  res.json(userLeaderboard);
});

// 3. POST /api/issues/analyze (AI Pre-fill when reporting)
app.post("/api/issues/analyze", async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Description is required for AI analysis." });
  }

  if (!ai) {
    return res.json(getSimulatedAnalyzeResponse(description));
  }

  try {
    const prompt = `Analyze this civic issue description submitted by a citizen: "${description}"

Generate a structured analysis. Follow these rules:
1. suggestedTitle: Summarize the issue in a highly clear, descriptive 5-8 word title (e.g. 'Hazardous sinkhole expanding near crosswalk').
2. category: Categorize into one of these exact strings: 'Pothole', 'Water Leakage', 'Streetlight', 'Waste Management', 'Public Infrastructure', or 'Other'.
3. severity: Assess impact into one of these exact strings: 'Low', 'Medium', 'High', 'Critical'.
4. predictiveInsight: Describe what will happen to the surrounding infrastructure, environment, or citizen safety if this is left neglected for another 10 days. Be highly professional, specific, and scientifically logical.
5. actionPlan: Provide a step-by-step technical plan for the municipal repair crew or citizen volunteers to resolve the issue.
6. estimatedCost: Offer a realistic repair budget estimate in USD (e.g., '$400 - $800').`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Pothole", "Water Leakage", "Streetlight", "Waste Management", "Public Infrastructure", "Other"] },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            predictiveInsight: { type: Type.STRING },
            actionPlan: { type: Type.STRING },
            estimatedCost: { type: Type.STRING }
          },
          required: ["suggestedTitle", "category", "severity", "predictiveInsight", "actionPlan", "estimatedCost"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Analyze Error (falling back to rule-based simulation):", error);
    // Fallback gracefully on API errors (like 503 Service Unavailable) to the rule-based response
    res.json(getSimulatedAnalyzeResponse(description));
  }
});

// 4. POST /api/issues (Submit a new report)
app.post("/api/issues", (req, res) => {
  const { title, description, category, severity, location, imageUrl, reportedBy, aiAnalysis } = req.body;

  if (!title || !description || !location || !reportedBy) {
    return res.status(400).json({ error: "Missing required fields for reporting." });
  }

  const newIssue: CivicIssue = {
    id: `iss-${Date.now().toString().slice(-5)}`,
    title,
    description,
    category: category || "Other",
    severity: severity || "Medium",
    status: "Reported",
    location: {
      lat: Number(location.lat) || 12.9719,
      lng: Number(location.lng) || 77.6412,
      address: location.address || "100 Feet Road, Indiranagar, Bengaluru",
      neighborhood: location.neighborhood || "100 Feet Road, Indiranagar"
    },
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80",
    reportedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    votes: 1,
    verifiedBy: [reportedBy],
    aiAnalysis: aiAnalysis || undefined,
    timeline: [
      {
        status: "Reported",
        label: "Issue Reported",
        timestamp: new Date().toISOString(),
        note: `Initial report submitted by ${reportedBy}.`
      }
    ],
    comments: []
  };

  issues.unshift(newIssue);
  awardPoints(reportedBy, 50, "report"); // Award 50 points for submitting a validated report

  res.status(201).json(newIssue);
});

// 5. POST /api/issues/:id/verify (Verify/Vote an issue)
app.post("/api/issues/:id/verify", (req, res) => {
  const { id } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: "User email is required for verification." });
  }

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  if (issue.verifiedBy.includes(userEmail)) {
    return res.status(400).json({ error: "You have already verified this issue." });
  }

  issue.votes += 1;
  issue.verifiedBy.push(userEmail);
  issue.updatedAt = new Date().toISOString();

  // If votes cross a threshold (e.g., 5 votes), move status to 'Verified'
  if (issue.status === "Reported" && issue.votes >= 5) {
    issue.status = "Verified";
    issue.timeline.push({
      status: "Verified",
      label: "Community Verified",
      timestamp: new Date().toISOString(),
      note: `The community successfully verified this issue (+${issue.votes} supports). Passed to municipal dispatch.`
    });
  }

  awardPoints(userEmail, 15, "verify"); // Award 15 points for verification support
  res.json(issue);
});

// 6. POST /api/issues/:id/resolve (Advance/Simulate resolution step)
app.post("/api/issues/:id/resolve", (req, res) => {
  const { id } = req.params;
  const { userEmail, note, nextStatus } = req.body; // e.g., nextStatus: 'Scheduled' | 'In Progress' | 'Resolved'

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const statusFlow: { [key: string]: string } = {
    "Reported": "Verified",
    "Verified": "Scheduled",
    "Scheduled": "In Progress",
    "In Progress": "Resolved"
  };

  const statusLabel: { [key: string]: string } = {
    "Verified": "Community Verified",
    "Scheduled": "Maintenance Scheduled",
    "In Progress": "Work in Progress",
    "Resolved": "Issue Resolved"
  };

  const currentStatus = issue.status;
  const targetStatus = nextStatus || statusFlow[currentStatus];

  if (!targetStatus) {
    return res.status(400).json({ error: "Issue is already resolved or in terminal state." });
  }

  issue.status = targetStatus as any;
  issue.updatedAt = new Date().toISOString();
  issue.timeline.push({
    status: targetStatus,
    label: statusLabel[targetStatus] || `Status updated to ${targetStatus}`,
    timestamp: new Date().toISOString(),
    note: note || `Progress update submitted by municipal services/coordinator.`
  });

  if (userEmail) {
    awardPoints(userEmail, 30, "help"); // Award points for facilitating resolution
  }

  res.json(issue);
});

// 7. POST /api/issues/:id/comment (Add comment)
app.post("/api/issues/:id/comment", (req, res) => {
  const { id } = req.params;
  const { user, text, isOfficial } = req.body;

  if (!user || !text) {
    return res.status(400).json({ error: "User and text are required for comment." });
  }

  const issue = issues.find(i => i.id === id);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const newComment = {
    id: `c-${Date.now().toString().slice(-4)}`,
    user,
    text,
    createdAt: new Date().toISOString(),
    isOfficial: !!isOfficial
  };

  issue.comments.push(newComment);
  issue.updatedAt = new Date().toISOString();

  awardPoints(user, 10, "comment"); // Award 10 points for comment engagement

  res.status(201).json(newComment);
});

// 8. GET /api/predictive-insights (AI Community Infrastructure Health Forecast)
app.get("/api/predictive-insights", async (req, res) => {
  const activeCount = issues.filter(i => i.status !== "Resolved").length;
  const resolvedCount = issues.filter(i => i.status === "Resolved").length;
  const highSeverityCount = issues.filter(i => i.severity === "High" || i.severity === "Critical").length;

  if (!ai) {
    return res.json(getSimulatedForecast());
  }

  try {
    const issuesContext = issues.map(i => ({
      title: i.title,
      category: i.category,
      severity: i.severity,
      status: i.status,
      neighborhood: i.location.neighborhood
    }));

    const prompt = `You are an AI-powered Civic Infrastructure Engineer analyzing Bengaluru's issue reports:
Active issues count: ${activeCount}
Resolved issues count: ${resolvedCount}
High/Critical severity issues count: ${highSeverityCount}

Current active issues list: ${JSON.stringify(issuesContext)}

Analyze this data to generate a "Community Infrastructure Health Forecast":
1. overallScore: An integer from 0 to 100 indicating the current health index of the city's infrastructure (where 100 is flawless and 0 is emergency failure).
2. aiSummary: A high-level, encouraging yet professional 3-sentence summary of the city's situation. Note any systemic trends (e.g. wet weather compounding potholes, water main water loss, dark crossings).
3. predictions: List exactly 3 forecasted infrastructure failures, safety hazards, or deterioration hotspots that will emerge if immediate preventive actions are not taken.
   For each prediction:
   - title: Concise risk name.
   - riskLevel: 'Low', 'Medium', or 'High'.
   - probability: Integer percentage (0 to 100).
   - recommendedPreemptiveAction: Action municipal workers or community groups should take immediately to preempt the hazard.
   - location: The specific neighborhood of concern.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            aiSummary: { type: Type.STRING },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  probability: { type: Type.INTEGER },
                  recommendedPreemptiveAction: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ["title", "riskLevel", "probability", "recommendedPreemptiveAction", "location"]
              }
            }
          },
          required: ["overallScore", "aiSummary", "predictions"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      updatedAt: new Date().toISOString(),
      ...parsed
    });
  } catch (error: any) {
    console.error("Gemini Forecast Error (falling back to dynamic simulated forecast):", error);
    // Fallback gracefully to dynamic simulated forecast on any Gemini error (such as 503)
    res.json(getSimulatedForecast());
  }
});

// Configure Vite or Serve Static Production assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicPulse backend server running on http://localhost:${PORT}`);
  });
}

startServer();
