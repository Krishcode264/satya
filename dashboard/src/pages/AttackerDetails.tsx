import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AttacksByHourChart from "../components/AttacksByHourChart";
import AttacksByPageChart from "../components/AttacksByPageChart";
import axios from "axios";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document, Packer, Paragraph, TextRun } from "docx";

/* ---------------------- TYPES ---------------------- */

interface Attempt {
  _id: string;
  count: number;
  attack_type: string;
  route: string;
  sample_payload: string;
  ip: string;
  first_seen: string;
  last_seen: string;
}

interface LogEntry {
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  totalAttacks: number;
  xssAttack: number;
  sqlInjection: number;
  highRiskCount: number;
  attacksByHour: Record<string, number>;
  attacksByPage: Record<string, number>;
}

interface AttackerData {
  fingerprint: string;
  attempts: Attempt[];
  logs: LogEntry[];
  summary: Summary;
}

interface SummaryCardProps {
  label: string;
  value: number;
  index: number;
}

/* ---------------------- DOCX GENERATOR ---------------------- */

async function generateDocxReport(text: string) {
  const lines = text.split("\n");

  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: line.trim(),
            bold: line.trim().endsWith(":"),
            size: line.trim().endsWith(":") ? 32 : 24,
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Incident_Report.docx";
  link.click();
}

/* ---------------------- GEMINI REPORT GENERATOR ---------------------- */

async function generateReport(
  data: AttackerData,
  setIsGenerating: any,
  setProgress: any
) {
  try {
    setIsGenerating(true);
    setProgress(10);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

    setProgress(25);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Generate a professional INCIDENT REPORT in plain text. 
STRICT RULES:
- Do NOT use markdown.
- Do NOT use **bold**, *, #, or tables.
- Use plain text with headings ending with ':'.
- Use structured sections and clean paragraphs.

Sections Required:
Executive Summary:
Attacker Fingerprint & Identity Pattern:
Attack Behaviour Analysis:
Timeline of Events:
Payload & Exploit Analysis:
Risk Assessment:
MITRE ATT&CK Mapping:
Affected Routes & Endpoints:
IP Reputation Review:
Chart Interpretation:
Recommended Defensive Measures:
Final Conclusion:

DATA:
${JSON.stringify(data, null, 2)}
`;

    setProgress(40);

    const result = await model.generateContent(prompt);

    setProgress(65);

    const reportText = result.response.text();

    setProgress(85);

    await generateDocxReport(reportText);

    setProgress(100);
    setTimeout(() => setProgress(0), 1200);
  } catch (err) {
    console.error("Gemini Report Error:", err);
    alert("❌ Failed to generate report.");
    setProgress(0);
  } finally {
    setIsGenerating(false);
  }
}

/* ---------------------- MAIN COMPONENT ---------------------- */

export default function AttackerDetails() {
  const { fingerprint } = useParams<{ fingerprint: string }>();
  const [data, setData] = useState<AttackerData | null>(null);

  // Loading state & Progress bar
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const formatDate = (s?: string) =>
    s ? new Date(s).toLocaleString() : "N/A";

  useEffect(() => {
    if (!fingerprint) return;

    axios
      .get<AttackerData>(
        `${import.meta.env.VITE_API_URL}/api/report/attacker/${fingerprint}`
      )
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setData(null);
      });
  }, [fingerprint]);

  if (!data)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
          <div className="relative w-12 h-12 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 md:p-12">

      {/* Back Link */}
      <div className="mb-10">
        <Link
          to="/attackers"
          className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition"
        >
          <span className="group-hover:-translate-x-1 transition">←</span>
          Back to Threats
        </Link>

        <h1 className="text-5xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
          Attacker Analysis
        </h1>

        <p className="text-slate-400 text-sm mt-4">
          <span className="text-slate-500">Fingerprint:</span>{" "}
          <span className="font-mono text-blue-300">{data.fingerprint}</span>
        </p>
      </div>

      {/* Generate Button */}
      <button
        disabled={isGenerating}
        onClick={() => generateReport(data, setIsGenerating, setProgress)}
        className={`mt-4 px-6 py-3 rounded-lg font-bold transition-all shadow-lg 
          ${isGenerating
            ? "bg-slate-600 text-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-cyan-400 text-black hover:scale-105"
          }`}
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            Generating Report...
          </div>
        ) : (
          "📄 Download Detailed Report"
        )}
      </button>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10">
        <SummaryCard label="Total Attacks" value={data.summary.totalAttacks} index={0} />
        <SummaryCard label="XSS" value={data.summary.xssAttack} index={1} />
        <SummaryCard label="SQL Injection" value={data.summary.sqlInjection} index={2} />
        <SummaryCard label="High Risk" value={data.summary.highRiskCount} index={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-12">
        <ChartCard title="Attacks By Hour">
          <AttacksByHourChart data={data.summary.attacksByHour} />
        </ChartCard>

        <ChartCard title="Attacks By Page">
          <AttacksByPageChart data={data.summary.attacksByPage} />
        </ChartCard>
      </div>

      {/* Attempts */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
          Attack Attempts
        </h3>

        <div className="space-y-4">
          {data.attempts.map((a) => (
            <div
              key={a._id}
              className="p-5 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-blue-500/50 transition"
            >
              <AttemptInfo a={a} formatDate={formatDate} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------------- SMALL COMPONENTS ---------------------- */

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-700/50 rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold mb-6 text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
        {title}
      </h3>
      {children}
    </div>
  );
}

function AttemptInfo({ a, formatDate }: { a: Attempt; formatDate: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Info label="Attack Type" value={a.attack_type} />
      <Info label="Route" value={a.route} mono />
      <Info label="Count" value={a.count.toString()} mono />
      <Info label="IP" value={a.ip} mono />
      <Info label="Payload" value={a.sample_payload} mono />
      <Info label="First Seen" value={formatDate(a.first_seen)} />
      <Info label="Last Seen" value={formatDate(a.last_seen)} />
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase mb-1">{label}</p>
      <p className={`text-sm text-slate-300 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, index }: SummaryCardProps) {
  return (
    <div
      className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg shadow-md"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-xs text-slate-400 uppercase mb-3">{label}</p>
      <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
        {value}
      </p>
    </div>
  );
}
