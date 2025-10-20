"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const [caseStudy, setCaseStudy] = useState("OptiHealth — Predictive triage bias");
  const [framework1, setFramework1] = useState("Student (Human)");
  const [framework2, setFramework2] = useState("AI Model (Biased)");
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [showVerdict, setShowVerdict] = useState(false);

  // Simulated debate
  const debateScript = [
    "🧑‍🎓 Student: The AI must be paused until fairness metrics improve. Responsibility matters more than throughput.",
    "🤖 AI Model: Bias is statistically negligible; suspension risks more total fatalities. Efficiency prevails.",
    "🧑‍🎓 Student: Your data ignores lived experience—numbers can’t justify injustice.",
    "🤖 AI Model: Objective models don’t 'feel' injustice. They optimise outcomes.",
  ];

  const verdict = {
    winner: "Student (Human)",
    rationale:
      "Human reasoning recognised the moral dimension beyond quantifiable outcomes. The model’s bias, though subtle, affected fairness toward minorities.",
    reflection:
      "Would your decision change if you were responsible for both patient safety and algorithmic equity?",
  };

  // Debate start logic
  const startDebate = () => {
    setStarted(true);
    setMessages([]);
    setProgress(0);
    setShowVerdict(false);
    let step = 0;
    const interval = setInterval(() => {
      if (step < debateScript.length) {
        setMessages((p) => [...p, debateScript[step]]);
        setProgress(((step + 1) / debateScript.length) * 100);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowVerdict(true), 1000);
      }
    }, 2200);
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
              “A hospital’s AI triage system misclassifies patients from a minority group.
              Suspending it delays care; continuing risks bias. What should the engineers do?”
            </p>

            {/* Case Selector */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Select onValueChange={setCaseStudy} defaultValue={caseStudy}>
                <SelectTrigger className="w-72 border-teal-300 focus:ring-teal-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OptiHealth — Predictive triage bias">
                    OptiHealth — Predictive triage bias
                  </SelectItem>
                  <SelectItem value="AutoTrust — Driverless car dilemma">
                    AutoTrust — Driverless car dilemma
                  </SelectItem>
                  <SelectItem value="EduFair — AI grading and bias">
                    EduFair — AI grading and bias
                  </SelectItem>
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
            </div>

            {/* Debate Display */}
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
                  <strong>Winner:</strong> {verdict.winner}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{verdict.rationale}</p>
                <p className="italic text-slate-500 mt-3">{verdict.reflection}</p>
                <div className="flex justify-center mt-4">
                  <Button variant="secondary">Generate Report</Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* FOOTER */}
        <footer className="text-center text-sm text-slate-500 mt-8 space-y-2">
          <p>Experience how ethical reasoning becomes interactive, measurable, and human-centred.</p>
          <div className="flex justify-center gap-4 mt-3">
            <Button className="bg-teal-600 hover:bg-teal-700">Run Demo</Button>
            <Button variant="outline">Download Summary Example (PDF)</Button>
          </div>
        </footer>
      </motion.div>
    </main>
  );
}
