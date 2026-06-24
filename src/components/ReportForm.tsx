import React, { useState, useEffect } from "react";
import { CivicIssue } from "../types";
import { MapPin, Sparkles, Brain, Image as ImageIcon, Send, ArrowRight, Loader2, Info } from "lucide-react";
import { motion } from "motion/react";

interface ReportFormProps {
  onAddIssue: (issueData: any) => void;
  clickedCoords: { lat: number; lng: number; address: string; neighborhood: string } | null;
  currentUserEmail: string;
}

// Sample mock visual issue options to let users click & report beautifully
const mockVisuals = [
  { id: "v1", label: "Pothole", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80" },
  { id: "v2", label: "Water Leakage", url: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&w=800&q=80" },
  { id: "v3", label: "Broken Streetlight", url: "https://images.unsplash.com/photo-1509024644558-2f0609b409e5?auto=format&fit=crop&w=800&q=80" },
  { id: "v4", label: "Illegal Dump", url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80" }
];

export default function ReportForm({
  onAddIssue,
  clickedCoords,
  currentUserEmail
}: ReportFormProps) {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<any>("Other");
  const [severity, setSeverity] = useState<any>("Medium");
  const [lat, setLat] = useState(12.9719);
  const [lng, setLng] = useState(77.6412);
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("100 Feet Road, Indiranagar");
  const [imageUrl, setImageUrl] = useState(mockVisuals[0].url);

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync coords if user clicked on map
  useEffect(() => {
    if (clickedCoords) {
      setLat(Number(clickedCoords.lat.toFixed(5)));
      setLng(Number(clickedCoords.lng.toFixed(5)));
      setAddress(clickedCoords.address);
      setNeighborhood(clickedCoords.neighborhood);
    }
  }, [clickedCoords]);

  // Handle AI Pre-fill analysis
  const handleAIAnalyze = async () => {
    if (!description.trim()) {
      setErrorMsg("Please enter a short description first so the AI can analyze the details.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/issues/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });

      const data = await response.json();
      if (response.ok) {
        setTitle(data.suggestedTitle || "Automated Assessment");
        setCategory(data.category || "Other");
        setSeverity(data.severity || "Medium");

        // Set the mock visual associated with category if found
        const matchingVisual = mockVisuals.find(v => v.label.toLowerCase() === (data.category || "").toLowerCase());
        if (matchingVisual) {
          setImageUrl(matchingVisual.url);
        }

        setAiAnalysisResult({
          category: data.category,
          severity: data.severity,
          predictiveInsight: data.predictiveInsight,
          actionPlan: data.actionPlan,
          estimatedCost: data.estimatedCost
        });
      } else {
        setErrorMsg(data.error || "Failed to analyze description.");
      }
    } catch (err) {
      setErrorMsg("Error communicating with AI analysis microservice.");
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Please fill out both Title and Description.");
      return;
    }

    const payload = {
      title,
      description,
      category,
      severity,
      location: {
        lat,
        lng,
        address: address || `No. ${Math.floor(10 + Math.random() * 150)}, 100 Feet Road, Indiranagar`,
        neighborhood
      },
      imageUrl,
      reportedBy: currentUserEmail,
      aiAnalysis: aiAnalysisResult || undefined
    };

    onAddIssue(payload);

    // Reset Form
    setDescription("");
    setTitle("");
    setCategory("Other");
    setSeverity("Medium");
    setAiAnalysisResult(null);
    setErrorMsg("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <div>
          <h2 className="text-base font-bold text-slate-900">File a Civic Concern</h2>
          <p className="text-slate-500 text-xs mt-0.5">Use AI auto-fill to instantly categorize and extract technical hazard action plans.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 mb-4 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Step 1: Description & AI Analysis (Intelligent Automation) */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block">1. DESCRIBE THE CONCERN *</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              placeholder="e.g., There is a huge drinking water pipe leak near Indiranagar metro station. Fresh BWSSB water is flooding the roadway, making it a severe skid hazard for motorbikes..."
              className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={analyzing}
              className="absolute right-3 bottom-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-blue-200 disabled:bg-blue-400"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-3.5 w-3.5" />
                  Scan with Civic AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Output feedback alert */}
        {aiAnalysisResult && (
          <div className="bg-blue-50 text-blue-950 rounded-xl p-4 border border-blue-100 space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Civic AI Pre-fill Successful!</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Gemini analyzed your text and pre-filled the title, category, and severity. It also formulated a 10-day preventive risk warning and repair plan.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">REPORT TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Concise issue title"
              className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Pothole">Pothole</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Streetlight">Streetlight</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Infrastructure">Public Infrastructure</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Coordinates and Location - Loaded dynamically from click map */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-600 animate-bounce" />
              2. ASSIGN CIVIC GEOLOCATION
            </span>
            <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2.5 py-0.5 rounded-full">
              Click map above to pick custom spot
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">LATITUDE</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">LONGITUDE</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">NEIGHBORHOOD</label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="100 Feet Road, Indiranagar">100 Feet Road, Indiranagar</option>
                <option value="Defence Colony, Indiranagar">Defence Colony, Indiranagar</option>
                <option value="Eshwara Layout, Indiranagar">Eshwara Layout, Indiranagar</option>
                <option value="Domlur Layout">Domlur Layout</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block">MAPPED STREET ADDRESS</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Click on the map to auto-fill address"
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Step 3: Severity & Visual Attachment selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Severity selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">3. ASSESS SEVERITY</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical Priority</option>
            </select>
          </div>

          {/* Visual Reference attachments */}
          <div className="col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700 block flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              4. ATTACH EVIDENCE PHOTO
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {mockVisuals.map((visual) => {
                const isSelected = imageUrl === visual.url;
                return (
                  <button
                    key={visual.id}
                    type="button"
                    onClick={() => setImageUrl(visual.url)}
                    className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-[10px] shrink-0 transition-all font-semibold ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 overflow-hidden shrink-0">
                      <img src={visual.url} className="w-full h-full object-cover" />
                    </span>
                    {visual.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Submitting as authenticated citizen: <strong>{currentUserEmail}</strong></span>
          </span>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-1 text-xs"
          >
            Submit Report <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
