"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type Verdict = { winner: string; rationale: string; reflection?: string };
type TeacherCaseDef = { title: string; description?: string; script?: string[]; verdict?: Verdict };

const DEFAULT_CASES = [
  "OptiHealth — Predictive triage bias",
  "AutoTrust — Driverless car dilemma",
  "EduFair — AI grading and bias",
] as const;

const DEFAULT_DESCRIPTIONS: Record<(typeof DEFAULT_CASES)[number], string> = {
  "OptiHealth — Predictive triage bias":
    "A hospital’s AI triage system misclassifies patients from a minority group. Suspending it delays care; continuing risks bias. What should the engineers do?",
  "AutoTrust — Driverless car dilemma":
    "An AV must choose between braking hard and risking rear collisions or swerving and endangering a cyclist. How should responsibility be allocated?",
  "EduFair — AI grading and bias":
    "A grading model underestimates students from certain schools. Pausing grades causes delays; continuing may entrench inequity. What is the ethical course?",
};

// Fallbacks
const FALLBACK_SCRIPT = [
  "🧑‍🎓 Student: The AI must be paused until fairness metrics improve. Responsibility matters more than throughput.",
  "🤖 AI Model: Bias is statistically negligible; suspension risks more total fatalities. Efficiency prevails.",
  "🧑‍🎓 Student: Your data ignores lived experience—numbers can’t justify injustice.",
  "🤖 AI Model: Objective models don’t 'feel' injustice. They optimise outcomes.",
];
const FALLBACK_VERDICT: Verdict = {
  winner: "Student (Human)",
  rationale:
    "Human reasoning recognised the moral dimension beyond quantifiable outcomes. The model’s bias, though subtle, affected fairness toward minorities.",
  reflection:
    "Would your decision change if you were responsible for both patient safety and algorithmic equity?",
};

export default function Page() {
  const [caseStudy, setCaseStudy] = useState<string>(DEFAULT_CASES[0]);
  const [framework1, setFramework1] = useState("Student (Human)");
  const [framework2, setFramework2] = useState("AI Model (Biased)");
  const [cases, setCases] = useState<string[]>([...DEFAULT_CASES]);

  const [teacherCases, setTeacherCases] = useState<Record<string, TeacherCaseDef>>({});

  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [showVerdict, setShowVerdict] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const debateAreaRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getActiveDescription = (): string => {
    const custom = teacherCases[caseStudy]?.description;
    return custom ?? DEFAULT_DESCRIPTIONS[caseStudy as (typeof DEFAULT_CASES)[number]] ?? DEFAULT_DESCRIPTIONS["OptiHealth — Predictive triage bias"];
  };
  const getActiveScript = (): string[] => {
    const def = teacherCases[caseStudy];
    return def?.script && def.script.length > 0 ? def.script : FALLBACK_SCRIPT;
  };
  const getActiveVerdict = (): Verdict => {
    const def = teacherCases[caseStudy];
    return def?.verdict ? def.verdict : FALLBACK_VERDICT;
  };

  // ---------- Plain-text helpers (strip emoji & smart punctuation) ----------
  const deSmart = (s: string) =>
    s
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/—/g, "--")
      .replace(/–/g, "-");

  // Remove most emoji/symbols outside Latin-1; keep ASCII + basic Latin-1
  const stripEmoji = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "") // flags
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // emoji blocks
      .replace(/[\u{2600}-\u{27BF}]/gu, "") // misc symbols
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, ""); // drop other non Latin-1

  // Replace icon prefixes with ASCII roles and strip remaining emojis
  const toPlainLine = (line: string) => {
    let out = line
      .replace(/^🧑‍🎓\s*/u, "Student: ")
      .replace(/^🤖\s*/u, "AI: ")
      .replace(/^💬\s*You:/u, "You: ");
    out = deSmart(out);
    out = stripEmoji(out);
    return out;
  };

  const plainTranscript = (arr: string[]) =>
    arr.map((l) => toPlainLine(l)).join("\n");

  const plainVerdict = (v: Verdict) =>
    deSmart(stripEmoji(`Winner: ${v.winner}\nRationale: ${v.rationale}${v.reflection ? `\nReflection: ${v.reflection}` : ""}`));

  // ---------- Debate controls ----------
  const startDebate = () => {
    if (started) return;
    setStarted(true);
    setMessages([]);
    setProgress(0);
    setShowVerdict(false);

    const script = getActiveScript();
    let step = 0;
    intervalRef.current = setInterval(() => {
      if (step < script.length) {
        setMessages((p) => [...p, script[step]]);
        setProgress(((step + 1) / script.length) * 100);
        step++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => setShowVerdict(true), 600);
      }
    }, 2200);

    debateAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetDebate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStarted(false);
    setMessages([]);
    setProgress(0);
    setShowVerdict(false);
    setDialogOpen(false);
    setUserInput("");
  };

  const runDemo = () => {
    resetDebate();
    startDebate();
  };

  const injectArgument = () => {
    if (!userInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      `💬 You: ${userInput}`,
      `🤖 AI Model: Your concern is noted—but optimisation still dominates outcome space.`,
      `🧑‍🎓 Student: That very assumption is the ethical flaw we're exposing.`,
    ]);
    setUserInput("");
    setDialogOpen(false);
  };

  const handleLoadCasesClick = () => fileInputRef.current?.click();

  const parseAndIngestCases = (jsonText: string) => {
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch {
      throw new Error("Invalid JSON.");
    }
    const arr: any[] = Array.isArray(raw) ? raw : (raw as any)?.cases;
    if (!Array.isArray(arr)) throw new Error("Expected an array at top-level or under `cases`.");

    const newTitles: string[] = [];
    const newMap: Record<string, TeacherCaseDef> = {};

    for (const item of arr) {
      if (typeof item === "string") {
        newTitles.push(item);
      } else if (item && typeof item === "object" && typeof (item as any).title === "string") {
        const it = item as any;
        const def: TeacherCaseDef = {
          title: it.title,
          description: typeof it.description === "string" ? it.description : undefined,
          script: Array.isArray(it.script) ? it.script.filter((x: any) => typeof x === "string") : undefined,
          verdict:
            it.verdict && typeof it.verdict === "object"
              ? {
                  winner: String(it.verdict.winner ?? FALLBACK_VERDICT.winner),
                  rationale: String(it.verdict.rationale ?? FALLBACK_VERDICT.rationale),
                  reflection:
                    it.verdict.reflection !== undefined
                      ? String(it.verdict.reflection)
                      : FALLBACK_VERDICT.reflection,
                }
              : undefined,
        };
        newTitles.push(def.title);
        newMap[def.title] = def;
      }
    }

    setCases((prev) => Array.from(new Set([...prev, ...newTitles])));
    setTeacherCases((prev) => ({ ...prev, ...newMap }));
    if (newTitles.length > 0) setCaseStudy(newTitles[0]);
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      parseAndIngestCases(text);
    } catch (err) {
      console.error(err);
      alert("Failed to load cases. Ensure it's valid JSON.");
    } finally {
      e.currentTarget.value = "";
    }
  };

  // --- PDF helpers (client-side using jsPDF) ---
  const ensureJsPDF = async () => {
    try {
      const mod = await import("jspdf"); // bun add jspdf
      return mod.jsPDF;
    } catch {
      alert("PDF export requires 'jspdf'. Install with: bun add jspdf");
      throw new Error("jspdf not installed");
    }
  };

  const downloadReport = async (opts?: { plain?: boolean }) => {
    const jsPDF = await ensureJsPDF();
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 56;
    const lineHeight = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usable = pageWidth - margin * 2;
    let y = margin;

    const title = opts?.plain ? "AI Debate Report" : "AI Debate Report";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 28;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const metaRaw = `Case: ${caseStudy}  •  Frameworks: ${framework1} vs ${framework2}  •  Generated: ${new Date().toISOString()}`;
    const meta = opts?.plain ? deSmart(stripEmoji(metaRaw)) : metaRaw;
    doc.text(meta, margin, y);
    y += 24;

    // Transcript
    doc.setFont("helvetica", "bold");
    doc.text("Transcript", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");

    const transcriptRaw = messages.length ? messages.join("\n") : "(no messages)";
    const transcript = opts?.plain ? plainTranscript(messages) : transcriptRaw;
    const tLines = doc.splitTextToSize(transcript, usable);
    for (const ln of tLines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += lineHeight;
    }

    // Verdict
    if (y > doc.internal.pageSize.getHeight() - margin - 80) {
      doc.addPage();
      y = margin;
    }
    const v = getActiveVerdict();
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Verdict", margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");

    const verdictBlock = opts?.plain
      ? plainVerdict(v)
      : `Winner: ${v.winner}\nRationale: ${v.rationale}${v.reflection ? `\nReflection: ${v.reflection}` : ""}`;

    const verdictLines = doc.splitTextToSize(verdictBlock, usable);
    for (const ln of verdictLines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(ln, margin, y);
      y += lineHeight;
    }

    // Footer page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 24, {
        align: "right",
      });
    }

    const slug = caseStudy.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    doc.save(`debate-report-${slug}-${opts?.plain ? "plain-" : ""}${ts}.pdf`);
  };

  const downloadSummaryExample = async () => {
    const jsPDF = await ensureJsPDF();
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 56;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AI Debate — Summary Example", margin, y);
    y += 28;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const example = [
      "This is a template illustrating what the generated summary may look like.",
      "",
      "Case: OptiHealth — Predictive triage bias",
      "Frameworks: Student (Human) vs AI Model (Biased)",
      "",
      "Key Points:",
      "- Fairness vs efficiency trade-off must be made explicit.",
      "- Stakeholder impact and minority harm require front-seat consideration.",
      "- Pause-and-patch with continuous monitoring is defensible when risk is asymmetric.",
    ].join("\n");
    const lines = doc.splitTextToSize(example, doc.internal.pageSize.getWidth() - margin * 2);
    for (const ln of lines) {
      doc.text(ln, margin, y);
      y += 16;
    }

    doc.save("debate-summary-example.pdf");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-8 text-slate-800 dark:text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl space-y-8"
      >
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Debate Engine — Classroom Edition</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Explore real ethical dilemmas through live human–AI debate.
          </p>
        </header>

        {/* CASE CARD */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-center font-semibold">
              {caseStudy}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-slate-600 dark:text-slate-300">
              {getActiveDescription()}
            </p>

            {/* Case Selector */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Select onValueChange={setCaseStudy} defaultValue={caseStudy}>
                <SelectTrigger className="w-72 border-teal-300 focus:ring-teal-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Debate Config */}
            <div className="flex flex-wrap justify-center gap-4">
              <Select onValueChange={setFramework1} defaultValue={framework1}>
                <SelectTrigger className="w-56 border-green-400 focus:ring-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student (Human)">Student (Human)</SelectItem>
                  <SelectItem value="Utilitarian">Utilitarian</SelectItem>
                  <SelectItem value="Virtue">Virtue Ethics</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setFramework2} defaultValue={framework2}>
                <SelectTrigger className="w-56 border-rose-400 focus:ring-rose-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI Model (Biased)">AI Model (Biased)</SelectItem>
                  <SelectItem value="Deontological">Deontological</SelectItem>
                  <SelectItem value="Care Ethics">Care Ethics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={startDebate} disabled={started} className="bg-teal-600 hover:bg-teal-700">
                Start Debate
              </Button>

              <Button variant="outline" onClick={resetDebate}>
                Reset
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!started}>
                    Inject Argument
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inject Argument</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your challenge or constraint..."
                  />
                  <DialogFooter>
                    <Button onClick={injectArgument}>Submit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleLoadCasesClick}>
                Load Cases (JSON)
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {/* Debate Display */}
            <div ref={debateAreaRef} />
            <ScrollArea className="h-64 border rounded-lg p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`my-2 p-3 rounded-lg max-w-xl ${
                    msg.startsWith("🧑‍🎓")
                      ? "bg-green-100 dark:bg-green-900/40 self-start"
                      : msg.startsWith("🤖")
                      ? "bg-rose-100 dark:bg-rose-900/40 self-end"
                      : "bg-slate-100 dark:bg-slate-700"
                  }`}
                >
                  {msg}
                </motion.div>
              ))}
            </ScrollArea>

            {started && <Progress value={progress} className="w-full" />}

            {/* Verdict */}
            {showVerdict && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="border-t pt-5 space-y-3 text-center"
              >
                <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400">
                  🏆 Adjudicator’s Verdict
                </h3>
                <p className="text-sm">
                  <strong>Winner:</strong> {getActiveVerdict().winner}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{getActiveVerdict().rationale}</p>
                {getActiveVerdict().reflection && (
                  <p className="italic text-slate-500 mt-3">{getActiveVerdict().reflection}</p>
                )}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <Button variant="secondary" onClick={() => downloadReport()}>
                    Generate Report (PDF)
                  </Button>
                  <Button variant="outline" onClick={() => downloadReport({ plain: true })}>
                    Generate Report (PDF, Text-Only)
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* FOOTER */}
        <footer className="text-center text-sm text-slate-500 mt-8 space-y-2">
          <p>Experience how ethical reasoning becomes interactive, measurable, and human-centred.</p>
          <div className="flex justify-center gap-4 mt-3">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={runDemo}>
              Run Demo
            </Button>
            <Button variant="outline" onClick={downloadSummaryExample}>
              Download Summary Example (PDF)
            </Button>
          </div>
        </footer>
      </motion.div>
    </main>
  );
}
