"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutGrid, Plus, ArrowLeft, Send, Loader2, Trash2, Sparkles,
  CheckCircle2, Circle, Code2, Copy, Check, GraduationCap, Clock,
  Target, X, BookOpen, Layers
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  Design tokens                                                          */
/* ---------------------------------------------------------------------- */
const T = {
  ink: "#16223F",
  inkSoft: "#1F2E52",
  line: "#4A7FB5",
  glow: "#8FC1E8",
  paper: "#F5F3EC",
  paperDark: "#E9E4D8",
  graphite: "#22262B",
  graphiteSoft: "#5A6270",
  amber: "#C97C22",
  amberSoft: "#EFD9B8",
  danger: "#B0453A",
};

/* ---------------------------------------------------------------------- */
/*  API helpers                                                            */
/* ---------------------------------------------------------------------- */
async function callGemini(system, messages) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system,
      messages,
    }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Gemini returned an invalid response (HTTP ${res.status}).`);
  }

  console.log("Gemini frontend response:", data);

  if (!res.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `Gemini request failed with status ${res.status}.`
    );
  }

  if (data?.content === undefined || data?.content === null) {
    throw new Error("Gemini returned an empty response.");
  }

  // Accept the response shapes used by the Gemini route.
  if (typeof data.content === "string") {
    return data.content;
  }

  if (Array.isArray(data.content)) {
    return data.content
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.text || item?.content || "";
      })
      .join("\n");
  }

  if (typeof data.content === "object") {
    return JSON.stringify(data.content);
  }

  return String(data.content);
}

function extractJSON(raw) {
  let cleaned = String(raw || "").trim();

  // Remove markdown code fences if the model adds them
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // --------------------------------------------------
  // IMPORTANT:
  // Check for an ARRAY first.
  //
  // Lesson generation returns:
  // [
  //   {...},
  //   {...}
  // ]
  // --------------------------------------------------

  const arrFirst = cleaned.indexOf("[");
  const arrLast = cleaned.lastIndexOf("]");

  if (
    arrFirst !== -1 &&
    arrLast !== -1 &&
    arrLast > arrFirst
  ) {
    const possibleArray =
      cleaned.slice(
        arrFirst,
        arrLast + 1
      );

    try {
      return JSON.parse(possibleArray);
    } catch (error) {
      console.error(
        "Failed to parse JSON array:",
        possibleArray,
        error
      );
    }
  }

  // --------------------------------------------------
  // Otherwise try an OBJECT
  // --------------------------------------------------

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (
    first !== -1 &&
    last !== -1 &&
    last > first
  ) {
    const possibleObject =
      cleaned.slice(
        first,
        last + 1
      );

    try {
      return JSON.parse(
        possibleObject
      );
    } catch (error) {
      console.error(
        "Failed to parse JSON object:",
        possibleObject,
        error
      );
    }
  }

  // --------------------------------------------------
  // Nothing could be parsed
  // --------------------------------------------------

  throw new Error(
    "The AI returned invalid JSON."
  );
}

async function callGeminiJSON(system, messages) {
  const raw = await callGemini(system, messages);
  return extractJSON(raw);
}

const RESOURCE_RULES = `Resource rules (must follow exactly):
- Only use real, publicly accessible platforms.
- YouTube: use a search results link in this exact form: https://www.youtube.com/results?search_query=<url-encoded topic>
- Documentation: only use real, well-known official documentation ROOT domains you are fully certain exist (e.g. https://developer.mozilla.org/, https://docs.python.org/3/, https://react.dev/, https://docs.oracle.com/en/java/). Do not invent deep paths.
- Practice: only use well-known homepages such as https://leetcode.com/, https://www.hackerrank.com/, https://www.kaggle.com/learn, https://exercism.org/
- Blog/Article: if you are not fully certain a specific article URL exists, use a Google search link instead: https://www.google.com/search?q=<url-encoded query>
- Never fabricate a specific deep URL you are not certain resolves.`;

/* ---------------------------------------------------------------------- */
/*  Storage helpers                                                        */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/*  Database helpers - Tushit Supabase via /api/courses                   */
/* ---------------------------------------------------------------------- */

async function loadCourses() {
  const response = await fetch("/api/courses", {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Failed to load courses."
    );
  }

  return data.courses || [];
}


async function savePlanRecord(plan) {
  const metadata = plan.course_metadata || {};

  const payload = {
    id: plan.id,

    title:
      metadata.title ||
      "Untitled Course",

    subject:
      metadata.subject ||
      "",

    course_metadata:
      metadata,

    target_audience:
      typeof metadata.target_audience === "object"
        ? JSON.stringify(metadata.target_audience)
        : metadata.target_audience || "",

    duration_and_frequency:
      metadata.duration
        ? `${metadata.duration}${metadata.session_frequency ? ` · ${metadata.session_frequency}` : ""}`
        : metadata.session_frequency || "",

    learning_goals:
      Array.isArray(metadata.learning_goals)
        ? metadata.learning_goals.join(", ")
        : metadata.learning_goals || "",

    modules:
      Array.isArray(plan.modules)
        ? plan.modules
        : [],

    refine_log:
      Array.isArray(plan.refineLog)
        ? plan.refineLog
        : [],

    status:
      "draft",
  };


  const response = await fetch("/api/courses", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(payload),
  });


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Failed to save course to Supabase."
    );
  }


  return data.course;
}


async function loadPlanRecord(id) {
  const response = await fetch(
    `/api/courses/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Failed to load course."
    );
  }

  const course = data.course || data;

  if (!course) {
    return null;
  }

  const metadata =
    course.course_metadata || {};


  return {
    id: course.id,

    course_metadata: metadata,

    modules:
      Array.isArray(course.modules)
        ? course.modules
        : [],

    refineLog:
      Array.isArray(course.refine_log)
        ? course.refine_log
        : [],

    createdAt:
      course.created_at
        ? new Date(course.created_at).getTime()
        : Date.now(),

    updatedAt:
      course.updated_at
        ? new Date(course.updated_at).getTime()
        : Date.now(),
  };
}


async function deletePlanRecord(id) {
  const response = await fetch(
    `/api/courses/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Failed to delete course."
    );
  }

  return true;
}

/* ---------------------------------------------------------------------- */
/*  Small UI atoms                                                         */
/* ---------------------------------------------------------------------- */
function Eyebrow({ children }) {
  return (
    <div className="cps-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: T.glow, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function DifficultyChip({ level }) {
  const map = {
    beginner: { bg: "rgba(143,193,232,0.25)", fg: T.ink },
    intermediate: { bg: T.amberSoft, fg: T.amber },
    advanced: { bg: T.ink, fg: "#fff" },
  };
  const s = map[level] || map.beginner;
  return (
    <span className="cps-mono" style={{ background: s.bg, color: s.fg, fontSize: 10.5, padding: "2px 8px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {level}
    </span>
  );
}

function IconBtn({ onClick, children, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center rounded transition-colors"
      style={{ width: 32, height: 32, color: danger ? T.danger : T.graphiteSoft, background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "rgba(176,69,58,0.1)" : "rgba(22,34,63,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/*  Dashboard                                                               */
/* ---------------------------------------------------------------------- */
function Dashboard({ plans, onOpen, onNew, onDelete }) {
  return (
    <div className="min-h-screen cps-root" style={{ background: T.paper }}>
      <div className="cps-blueprint" style={{ padding: "56px 24px 64px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <Eyebrow>Course Planning Studio</Eyebrow>
          <h1 className="cps-display" style={{ color: "#fff", fontSize: 42, fontWeight: 600, marginTop: 10, lineHeight: 1.1 }}>
            Draft a course like an architect drafts a building.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", marginTop: 14, maxWidth: 560, fontSize: 15, lineHeight: 1.6 }}>
            Talk through your subject, audience, and goals. The studio drafts modules,
            lessons, resources, and assessments as a structured plan you can revise line by line.
          </p>
          <button
            onClick={onNew}
            className="cps-mono"
            style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 8, background: T.amber, color: "#1A1204", padding: "12px 20px", borderRadius: 4, fontSize: 13, letterSpacing: "0.04em", fontWeight: 600 }}
          >
            <Plus size={16} /> NEW COURSE PLAN
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
          <Eyebrow>Sheets on file</Eyebrow>
          <span className="cps-mono" style={{ fontSize: 11, color: T.graphiteSoft }}>{plans.length} saved</span>
        </div>

        {plans.length === 0 ? (
          <div className="cps-graph" style={{ border: "1px dashed rgba(74,127,181,0.4)", borderRadius: 4, padding: "48px 24px", textAlign: "center" }}>
            <Layers size={22} style={{ margin: "0 auto 12px", color: T.line }} />
            <p style={{ color: T.graphiteSoft, fontSize: 14 }}>No plans yet. Start one, and it'll appear here for you to reopen anytime.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {plans.map((p, i) => (
              <div key={p.id} className="cps-sheet cps-fade-in" style={{ padding: "18px 18px 16px", borderRadius: 3, cursor: "pointer" }} onClick={() => onOpen(p.id)}>
                <div className="cps-mono" style={{ fontSize: 10.5, color: T.line, marginBottom: 8 }}>
                  SHEET NO. {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="cps-display" style={{ fontSize: 19, fontWeight: 600, color: T.ink, lineHeight: 1.25, minHeight: 48 }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: 12.5, color: T.graphiteSoft, marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span className="flex items-center gap-1.5"><GraduationCap size={13} /> {p.skillLevel || "—"}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {p.duration || "—"}</span>
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: 16, borderTop: "1px solid rgba(22,34,63,0.1)", paddingTop: 10 }}>
                  <span className="cps-mono" style={{ fontSize: 10, color: T.graphiteSoft }}>
                    updated {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                  <IconBtn danger title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}>
                    <Trash2 size={15} />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Intake                                                                  */
/* ---------------------------------------------------------------------- */
const FIELD_LABELS = [
  { key: "subject", label: "Subject" },
  { key: "target_audience", label: "Audience" },
  { key: "duration_and_frequency", label: "Duration & frequency" },
  { key: "learning_goals", label: "Learning goals" },
];

function IntakeView({ onBack, onGenerated }) {
  const [messages, setMessages] = useState([]); // {role, text}
  const [collected, setCollected] = useState({ subject: "", target_audience: "", duration_and_frequency: "", learning_goals: "" });
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [genPhase, setGenPhase] = useState(null); // status string during generation
  const scrollRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setMessages([{ role: "assistant", text: "Let's sketch out your course. What subject or topic are you planning to teach?" }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const SYSTEM = `You are a warm, expert curriculum design assistant helping a mentor plan a course, one short question at a time. Never ask about more than one missing field per turn.

Fields to collect:
- subject: the topic area of the course
- target_audience: age group, skill level, and prior knowledge of learners
- duration_and_frequency: overall course length and how often sessions happen
- learning_goals: what learners should be able to do by the end

Currently collected fields (JSON): ${JSON.stringify(collected)}

IMPORTANT RULES:
- Never mark ready_to_generate as true if even ONE field is empty.
- If learning_goals is empty, you MUST ask specifically about learning goals.
- Never assume learning goals from the subject, audience, or duration.
- Do not say the course is complete while any field is missing.
- "yes", "no", "okay", "fine", or "sure" do not fill a missing field unless the response actually contains the requested information.
- If exactly one field is missing, ask only about that field.
- ready_to_generate must be false whenever any field is missing.

Given the mentor's latest message, update your understanding and respond with ONLY a JSON object, no markdown fences, no commentary, in exactly this shape:
{
  "reply": "a warm, concise (1-3 sentence) reply. If fields are still missing, ask about exactly ONE missing field, in priority order subject > target_audience > duration_and_frequency > learning_goals. If all four are filled, give a brief 1-2 sentence summary and invite them to generate the plan.",
  "collected": {
    "subject": "string, keep previous value if still accurate, empty string if unknown",
    "target_audience": "string summary or empty string",
    "duration_and_frequency": "string or empty string",
    "learning_goals": "string or empty string"
  },
  "ready_to_generate": true only if all four fields are non-empty and reasonably specific, else false
}`;

  async function send(text) {
    if (!text.trim() || busy) return;
    const nextMsgs = [...messages, { role: "user", text }];
    setMessages(nextMsgs);
    setInput("");
    setBusy(true);
    try {
      const apiMessages = nextMsgs.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const result = await callGeminiJSON(SYSTEM, apiMessages);

      const merged = {
        ...collected,
        ...(result.collected || {}),
      };

      setCollected(merged);

      // Never trust the AI's ready_to_generate flag by itself.
      // The UI is ready only when all four required fields
      // actually contain meaningful values.
      const allFieldsComplete =
        Boolean(merged.subject?.trim()) &&
        Boolean(merged.target_audience?.trim()) &&
        Boolean(merged.duration_and_frequency?.trim()) &&
        Boolean(merged.learning_goals?.trim());

      setReady(allFieldsComplete);

      setMessages((cur) => [
        ...cur,
        {
          role: "assistant",
          text: result.reply,
        },
      ]);
    } catch (e) {
      setMessages((cur) => [...cur, { role: "assistant", text: "I hit a snag processing that — could you rephrase or try again?" }]);
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true);
    try {
      setGenPhase("Drafting the course outline…");
      const skeletonSystem = `You are an expert curriculum architect. Design a course outline based on the mentor's requirements below. Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "course_metadata": {
    "title": "String",
    "subject": "String",
    "target_audience": { "age_group": "String", "skill_level": "String", "prior_knowledge": ["String"] },
    "duration": "String",
    "session_frequency": "String",
    "learning_goals": ["String"]
  },
  "modules": [
    { "module_number": 1, "title": "String", "learning_objectives": ["String"], "prerequisites": ["String"],
      "module_assessment": { "type": "Quiz | Project | Coding Challenge", "description": "String" } }
  ]
}
Requirements:
- subject: ${collected.subject}
- audience: ${collected.target_audience}
- duration/frequency: ${collected.duration_and_frequency}
- learning goals: ${collected.learning_goals}
Produce 3 to 5 modules that progress logically in difficulty. Keep every string concise (objectives and prerequisites as short phrases). Do not include a "lessons" key yet.`;
      const skeleton = await callGeminiJSON(skeletonSystem, [{ role: "user", content: "Generate the course outline now." }]);

      const modules = [];
      for (let i = 0; i < skeleton.modules.length; i++) {
        const mod = skeleton.modules[i];
        setGenPhase(`Writing lessons for Module ${i + 1} of ${skeleton.modules.length}: ${mod.title}…`);
        const lessonSystem = `You are an expert curriculum architect writing the lessons for ONE module of a course. Respond with ONLY valid JSON (no markdown fences, no commentary): an array of 2 to 4 lesson objects, each matching exactly:
{
  "lesson_number": ${mod.module_number}.1,
  "title": "String",
  "difficulty_progression": "beginner | intermediate | advanced",
  "topics_covered": ["String"],
  "recommended_resources": [ { "type": "YouTube | Blog | Article | Documentation | Practice", "title": "String", "public_url": "String" } ]
}
Number lessons sequentially as ${mod.module_number}.1, ${mod.module_number}.2, etc. Give each lesson 2 recommended_resources of varied type. ${RESOURCE_RULES}

Course subject: ${collected.subject}
Audience: ${collected.target_audience}
Module title: ${mod.title}
Module objectives: ${JSON.stringify(mod.learning_objectives)}`;
        const lessons = await callGeminiJSON(lessonSystem, [{ role: "user", content: "Generate the lessons now." }]);
        modules.push({ ...mod, lessons: Array.isArray(lessons) ? lessons : lessons.lessons || [] });
      }

      const plan = {
        id: crypto.randomUUID(),
        course_metadata: skeleton.course_metadata,
        modules,
        refineLog: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onGenerated(plan);
    } catch (e) {
      setMessages((cur) => [...cur, { role: "assistant", text: "Something went wrong drafting the plan. Want to try generating again?" }]);
    } finally {
      setBusy(false);
      setGenPhase(null);
    }
  }

  return (
    <div className="min-h-screen cps-root" style={{ background: T.paper }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 24px 60px" }}>
        <button onClick={onBack} className="flex items-center gap-2" style={{ color: T.graphiteSoft, fontSize: 13, marginBottom: 18 }}>
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
          {/* Chat column */}
          <div className="cps-sheet" style={{ borderRadius: 4, display: "flex", flexDirection: "column", height: 560 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(22,34,63,0.1)" }}>
              <Eyebrow>Intake conversation</Eyebrow>
            </div>
            <div ref={scrollRef} className="cps-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} className="cps-fade-in" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                  <div style={{
                    background: m.role === "user" ? T.ink : "#fff",
                    color: m.role === "user" ? "#fff" : T.graphite,
                    border: m.role === "user" ? "none" : "1px solid rgba(22,34,63,0.12)",
                    borderRadius: 6, padding: "9px 13px", fontSize: 14, lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && !genPhase && (
                <div style={{ alignSelf: "flex-start", fontSize: 13, color: T.graphiteSoft }} className="cps-pulse flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> thinking…
                </div>
              )}
            </div>
            <div style={{ padding: 14, borderTop: "1px solid rgba(22,34,63,0.1)", display: "flex", gap: 8 }}>
              <input
                className="cps-input"
                style={{ flex: 1, borderRadius: 4, padding: "10px 12px", fontSize: 14 }}
                placeholder="Type your answer…"
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
              />
              <button onClick={() => send(input)} disabled={busy} style={{ background: T.ink, color: "#fff", borderRadius: 4, width: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Spec sheet column */}
          <div className="cps-sheet cps-graph" style={{ borderRadius: 4, padding: 20 }}>
            <Eyebrow>Spec sheet</Eyebrow>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {FIELD_LABELS.map((f) => {
                const val = collected[f.key];
                const filled = !!val;
                return (
                  <div key={f.key} className="cps-dim" style={{ paddingLeft: 12 }}>
                    <div className="flex items-center gap-2">
                      {filled ? <CheckCircle2 size={14} color={T.amber} /> : <Circle size={14} color={T.graphiteSoft} />}
                      <span className="cps-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: filled ? T.ink : T.graphiteSoft }}>{f.label}</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: filled ? T.graphite : T.graphiteSoft, marginTop: 4, fontStyle: filled ? "normal" : "italic" }}>
                      {filled ? val : "not yet specified"}
                    </p>
                  </div>
                );
              })}
            </div>

            {genPhase && (
              <div style={{ marginTop: 22, fontSize: 12.5, color: T.line }} className="flex items-center gap-2 cps-pulse">
                <Loader2 size={14} className="animate-spin" /> {genPhase}
              </div>
            )}

            {ready && !genPhase && (
              <button
                onClick={generate}
                disabled={busy}
                className="cps-mono"
                style={{ marginTop: 22, width: "100%", background: T.amber, color: "#1A1204", padding: "12px 16px", borderRadius: 4, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Sparkles size={15} /> GENERATE COURSE PLAN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Plan view                                                               */
/* ---------------------------------------------------------------------- */
function ModuleSheet({ mod }) {
  return (
    <div className="cps-sheet cps-fade-in" style={{ borderRadius: 4, padding: "20px 22px", marginBottom: 18 }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="cps-mono" style={{ fontSize: 11, color: T.line }}>MOD.{String(mod.module_number).padStart(2, "0")}</div>
          <h3 className="cps-display" style={{ fontSize: 21, fontWeight: 600, color: T.ink, marginTop: 4 }}>{mod.title}</h3>
        </div>
        {mod.module_assessment && (
          <div className="cps-stamp">{mod.module_assessment.type}</div>
        )}
      </div>

      {mod.learning_objectives?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <span className="cps-mono" style={{ fontSize: 10.5, color: T.graphiteSoft, textTransform: "uppercase" }}>Objectives</span>
          <ul style={{ marginTop: 4, paddingLeft: 18, fontSize: 13.5, color: T.graphite, lineHeight: 1.6 }}>
            {mod.learning_objectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}
      {mod.prerequisites?.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: T.graphiteSoft }}>
          <span className="cps-mono" style={{ fontSize: 10.5, textTransform: "uppercase" }}>Prerequisites: </span>
          {mod.prerequisites.join(", ")}
        </div>
      )}

      <div style={{ marginTop: 16, borderTop: "1px dashed rgba(74,127,181,0.4)", paddingTop: 14 }}>
        {mod.lessons?.map((les) => (
          <div key={les.lesson_number} className="cps-dim" style={{ paddingLeft: 14, marginBottom: 14 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="cps-mono" style={{ fontSize: 12, color: T.amber }}>{les.lesson_number}</span>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: T.graphite }}>{les.title}</span>
              <DifficultyChip level={les.difficulty_progression} />
            </div>
            {les.topics_covered?.length > 0 && (
              <p style={{ fontSize: 13, color: T.graphiteSoft, marginTop: 4 }}>{les.topics_covered.join(" · ")}</p>
            )}
            {les.recommended_resources?.length > 0 && (
              <div className="flex flex-wrap gap-2" style={{ marginTop: 6 }}>
                {les.recommended_resources.map((r, i) => (
                  <a key={i} href={r.public_url} target="_blank" rel="noreferrer" className="cps-mono"
                     style={{ fontSize: 10.5, background: "rgba(74,127,181,0.1)", color: T.line, padding: "3px 8px", borderRadius: 3, textDecoration: "none" }}>
                    {r.type}: {r.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {mod.module_assessment?.description && (
        <p style={{ marginTop: 10, fontSize: 12.5, color: T.graphiteSoft, fontStyle: "italic" }}>{mod.module_assessment.description}</p>
      )}
    </div>
  );
}

function PlanView({ plan, setPlan, onBack, onSaved }) {
  const [refineLog, setRefineLog] = useState(plan.refineLog || []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [refineLog, busy]);

  async function persist(nextPlan) {
    const record = { ...nextPlan, updatedAt: Date.now() };
    setPlan(record);
    await savePlanRecord(record);
    const index = await loadIndex();
    const meta = {
      id: record.id,
      title: record.course_metadata.title,
      skillLevel: record.course_metadata.target_audience?.skill_level,
      duration: record.course_metadata.duration,
      updatedAt: record.updatedAt,
    };
    const without = index.filter((p) => p.id !== record.id);
    await saveIndex([meta, ...without]);
    onSaved && onSaved();
  }

  // auto-save on first mount / whenever plan reference changes upstream
  useEffect(() => { persist(plan); /* eslint-disable-next-line */ }, []);

  async function regenerateModule(moduleNumber, instruction) {
    const target = plan.modules.find((m) => m.module_number === moduleNumber);
    const system = `You are an expert curriculum architect revising ONE module of an existing course based on the mentor's instruction. Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly:
{ "module_number": ${moduleNumber}, "title": "String", "learning_objectives": ["String"], "prerequisites": ["String"],
  "lessons": [ { "lesson_number": ${moduleNumber}.1, "title": "String", "difficulty_progression": "beginner | intermediate | advanced", "topics_covered": ["String"], "recommended_resources": [ { "type": "YouTube | Blog | Article | Documentation | Practice", "title": "String", "public_url": "String" } ] } ],
  "module_assessment": { "type": "Quiz | Project | Coding Challenge", "description": "String" } }
Keep 2 to 4 lessons, 2 resources per lesson. ${RESOURCE_RULES}

Course subject: ${plan.course_metadata.subject}
Audience: ${JSON.stringify(plan.course_metadata.target_audience)}
Current module: ${JSON.stringify(target)}
Mentor's instruction: "${instruction}"`;
    const updated = await callGeminiJSON(system, [{ role: "user", content: "Revise the module now." }]);
    const modules = plan.modules.map((m) => (m.module_number === moduleNumber ? updated : m));
    return { ...plan, modules };
  }

  async function send(text) {
    if (!text.trim() || busy) return;
    const log = [...refineLog, { role: "user", text }];
    setRefineLog(log);
    setInput("");
    setBusy(true);
    try {
      const moduleSummaries = plan.modules.map((m) => ({ module_number: m.module_number, title: m.title, lesson_count: m.lessons?.length || 0 }));
      const classifySystem = `You are an expert curriculum architect. The mentor is revising an existing course plan and just gave an instruction. Decide what to do. Respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "action": "update_metadata" | "update_module" | "add_module" | "remove_module" | "reply_only",
  "module_number": number or null,
  "reply": "a short (1-2 sentence) confirmation message for the mentor, written as if the change is already being made",
  "metadata_patch": { } 
}
Use "metadata_patch" only when action is "update_metadata": include only the course_metadata fields that should change, matching the schema (title, subject, target_audience, duration, session_frequency, learning_goals).
Use "update_module" for edits like "make module 2 simpler" or "add more resources to module 3".
Use "add_module" when the mentor wants a new module inserted (set module_number to the next sequential number: ${plan.modules.length + 1}).
Use "remove_module" to delete a module.
Use "reply_only" if the instruction is just a question or comment needing no plan change.

Current course metadata: ${JSON.stringify(plan.course_metadata)}
Current modules (summary): ${JSON.stringify(moduleSummaries)}
Mentor's instruction: "${text}"`;
      const decision = await callGeminiJSON(classifySystem, [{ role: "user", content: "Decide the action now." }]);
      setRefineLog((cur) => [...cur, { role: "assistant", text: decision.reply }]);

      let nextPlan = plan;
      if (decision.action === "update_metadata" && decision.metadata_patch) {
        setStatus("Updating course details…");
        nextPlan = { ...plan, course_metadata: { ...plan.course_metadata, ...decision.metadata_patch } };
      } else if (decision.action === "update_module" && decision.module_number) {
        setStatus(`Revising Module ${decision.module_number}…`);
        nextPlan = await regenerateModule(decision.module_number, text);
      } else if (decision.action === "remove_module" && decision.module_number) {
        const remaining = plan.modules.filter((m) => m.module_number !== decision.module_number)
          .map((m, i) => ({ ...m, module_number: i + 1 }));
        nextPlan = { ...plan, modules: remaining };
      }

      if (decision.action === "add_module") {
        setStatus("Drafting a new module…");
        const num = plan.modules.length + 1;
        const system = `You are an expert curriculum architect adding a NEW module to an existing course based on the mentor's instruction. Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly:
{ "module_number": ${num}, "title": "String", "learning_objectives": ["String"], "prerequisites": ["String"],
  "lessons": [ { "lesson_number": ${num}.1, "title": "String", "difficulty_progression": "beginner | intermediate | advanced", "topics_covered": ["String"], "recommended_resources": [ { "type": "YouTube | Blog | Article | Documentation | Practice", "title": "String", "public_url": "String" } ] } ],
  "module_assessment": { "type": "Quiz | Project | Coding Challenge", "description": "String" } }
Keep 2 to 4 lessons, 2 resources per lesson. ${RESOURCE_RULES}
Course subject: ${plan.course_metadata.subject}
Existing module titles: ${plan.modules.map((m) => m.title).join(", ")}
Mentor's instruction: "${text}"`;
        const newModule = await callGeminiJSON(system, [{ role: "user", content: "Create the module now." }]);
        nextPlan = { ...plan, modules: [...plan.modules, newModule] };
      }

      const withLog = { ...nextPlan, refineLog: [...log, { role: "assistant", text: decision.reply }] };
      await persist(withLog);
    } catch (e) {
      setRefineLog((cur) => [...cur, { role: "assistant", text: "I couldn't complete that revision — could you try rephrasing it?" }]);
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  const meta = plan.course_metadata;

  return (
    <div className="min-h-screen cps-root" style={{ background: T.paper }}>
      <div className="cps-blueprint" style={{ padding: "22px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <button onClick={onBack} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 12 }}>
            <ArrowLeft size={15} /> Dashboard
          </button>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <Eyebrow>{meta.subject}</Eyebrow>
              <h1 className="cps-display" style={{ color: "#fff", fontSize: 30, fontWeight: 600, marginTop: 4 }}>{meta.title}</h1>
              <div className="flex flex-wrap gap-4" style={{ marginTop: 10, fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>
                <span className="flex items-center gap-1.5"><GraduationCap size={13} /> {meta.target_audience?.skill_level} · {meta.target_audience?.age_group}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} /> {meta.duration} · {meta.session_frequency}</span>
                <span className="flex items-center gap-1.5"><Target size={13} /> {meta.learning_goals?.length} goals</span>
              </div>
            </div>
            <button onClick={() => setShowJSON((s) => !s)} className="cps-mono flex items-center gap-2" style={{ background: showJSON ? T.amber : "rgba(255,255,255,0.12)", color: showJSON ? "#1A1204" : "#fff", padding: "9px 14px", borderRadius: 4, fontSize: 12 }}>
              <Code2 size={14} /> {showJSON ? "HIDE JSON" : "VIEW JSON"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 70px" }}>
        {showJSON ? (
          <div className="cps-sheet" style={{ borderRadius: 4, padding: 18, position: "relative" }}>
            <button
              onClick={() => { navigator.clipboard.writeText(JSON.stringify({ course_metadata: meta, modules: plan.modules }, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              style={{ position: "absolute", top: 14, right: 14, color: T.line, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
              className="cps-mono"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "copied" : "copy"}
            </button>
            <pre className="cps-mono cps-scroll" style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 640, overflowY: "auto" }}>
{JSON.stringify({ course_metadata: meta, modules: plan.modules }, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "start" }}>
            <div>
              {plan.modules.map((m) => <ModuleSheet key={m.module_number} mod={m} />)}
            </div>

            <div className="cps-sheet" style={{ borderRadius: 4, position: "sticky", top: 20, display: "flex", flexDirection: "column", height: 560 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(22,34,63,0.1)" }}>
                <Eyebrow>Refine this plan</Eyebrow>
                <p style={{ fontSize: 12, color: T.graphiteSoft, marginTop: 4 }}>e.g. "Make Module 2 simpler" or "Add a capstone project"</p>
              </div>
              <div ref={scrollRef} className="cps-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                {refineLog.length === 0 && (
                  <p style={{ fontSize: 13, color: T.graphiteSoft, fontStyle: "italic" }}>No revisions yet. Try a command below.</p>
                )}
                {refineLog.map((m, i) => (
                  <div key={i} className="cps-fade-in" style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}>
                    <div style={{
                      background: m.role === "user" ? T.ink : "#fff",
                      color: m.role === "user" ? "#fff" : T.graphite,
                      border: m.role === "user" ? "none" : "1px solid rgba(22,34,63,0.12)",
                      borderRadius: 6, padding: "8px 12px", fontSize: 13.5, lineHeight: 1.5,
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="cps-pulse flex items-center gap-2" style={{ fontSize: 12.5, color: T.line }}>
                    <Loader2 size={13} className="animate-spin" /> {status || "working…"}
                  </div>
                )}
              </div>
              <div style={{ padding: 14, borderTop: "1px solid rgba(22,34,63,0.1)", display: "flex", gap: 8 }}>
                <input
                  className="cps-input"
                  style={{ flex: 1, borderRadius: 4, padding: "9px 11px", fontSize: 13.5 }}
                  placeholder="Describe a change…"
                  value={input}
                  disabled={busy}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
                />
                <button onClick={() => send(input)} disabled={busy} style={{ background: T.ink, color: "#fff", borderRadius: 4, width: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Root App                                                                */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | intake | plan
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

async function refreshIndex() {
  try {
    const courses = await loadCourses();

    const index = courses.map((course) => ({
      id: course.id,

      title:
        course.title ||
        course.course_metadata?.title ||
        "Untitled Course",

      skillLevel:
        course.course_metadata
          ?.target_audience
          ?.skill_level || "",

      duration:
        course.course_metadata?.duration || "",

      updatedAt:
        course.updated_at
          ? new Date(course.updated_at).getTime()
          : Date.now(),
    }));

    setPlans(
      index.sort(
        (a, b) => b.updatedAt - a.updatedAt
      )
    );

  } catch (error) {

    console.error(
      "Failed to load courses:",
      error
    );

    setPlans([]);
  }
}

  useEffect(() => {
    (async () => { await refreshIndex(); setLoadingList(false); })();
  }, []);

  async function openPlan(id) {
    const rec = await loadPlanRecord(id);
    if (rec) { setCurrentPlan(rec); setView("plan"); }
  }

  async function deletePlan(id) {
    await deletePlanRecord(id);
    const idx = await loadIndex();
    const next = idx.filter((p) => p.id !== id);
    await saveIndex(next);
    setPlans(next.sort((a, b) => b.updatedAt - a.updatedAt));
  }

 async function handleGenerated(plan) {
  try {

    const record = {
      ...plan,
      updatedAt: Date.now(),
    };

    console.log(
      "Saving generated course to Supabase:",
      record
    );

    const savedCourse =
      await savePlanRecord(record);

    console.log(
      "Course saved successfully:",
      savedCourse
    );


    setCurrentPlan(record);

    await refreshIndex();

    setView("plan");

  } catch (error) {

    console.error(
      "Failed to save generated plan:",
      error
    );

    alert(
      `The course was generated, but it could not be saved.\n\n${
        error instanceof Error
          ? error.message
          : "Unknown database error"
      }`
    );
  }
 }

  return (
    <div className="cps-root">
      {view === "dashboard" && (
        loadingList
          ? <div className="min-h-screen flex items-center justify-center" style={{ background: T.ink, color: "#fff" }}><Loader2 className="animate-spin" /></div>
          : <Dashboard plans={plans} onOpen={openPlan} onNew={() => setView("intake")} onDelete={deletePlan} />
      )}
      {view === "intake" && (
        <IntakeView onBack={() => setView("dashboard")} onGenerated={handleGenerated} />
      )}
      {view === "plan" && currentPlan && (
        <PlanView plan={currentPlan} setPlan={setCurrentPlan} onBack={async () => { await refreshIndex(); setView("dashboard"); }} onSaved={refreshIndex} />
      )}
    </div>
  );
}