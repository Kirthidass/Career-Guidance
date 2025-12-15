import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, XCircle, Loader2, ArrowRight, Award, History, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface AnalysisResult {
    ats_score: number;
    skills_you_have: string[];
    skills_you_need: string[];
}

interface ResumeHistory {
    id: string;
    target_role: string;
    ats_score: number;
    analysis_json: AnalysisResult;
    created_at: string;
}

const ResumeAnalysis = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [targetRole, setTargetRole] = useState("");
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [history, setHistory] = useState<ResumeHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Fetch resume history
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/resume/history/${user.id}`);
                setHistory(response.data.history || []);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [user, analysis]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !targetRole || !user) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("target_role", targetRole);
        formData.append("user_id", user.id);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/resume/analyze`, formData);
            setAnalysis(response.data);
        } catch (err) {
            console.error("Error analyzing resume:", err);
            setError("Failed to analyze resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRoadmap = () => {
        if (analysis && analysis.skills_you_need.length > 0) {
            sessionStorage.setItem('roadmap_skills', JSON.stringify(analysis.skills_you_need));
            sessionStorage.setItem('roadmap_goal', targetRole);
            navigate('/roadmap');
        }
    };

    const loadHistoryItem = (item: ResumeHistory) => {
        setAnalysis(item.analysis_json);
        setTargetRole(item.target_role);
    };

    const getATSColor = (score: number) => {
        if (score >= 80) return "text-green-500 border-green-500";
        if (score >= 60) return "text-yellow-500 border-yellow-500";
        return "text-red-500 border-red-500";
    };

    const getATSLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Needs Work";
        return "Poor";
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Resume Analysis</h2>
                <p className="text-muted-foreground mt-1">Upload your resume for AI-powered ATS score and skill analysis.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* History Sidebar */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Resume History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loadingHistory ? (
                                <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground text-sm">No previous analyses</div>
                            ) : (
                                history.slice(0, 5).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => loadHistoryItem(item)}
                                        className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm truncate">{item.target_role}</span>
                                            <span className={cn("text-xs font-bold", getATSColor(item.ats_score).split(' ')[0])}>
                                                {item.ats_score}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(item.created_at)}
                                        </div>
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Upload Section */}
                <div className="lg:col-span-4">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Upload Resume</CardTitle>
                            <CardDescription>Select a PDF file to analyze</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Job Role</label>
                                <Input
                                    placeholder="e.g. Full Stack Developer"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                />
                            </div>

                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                                    file ? "bg-accent/50" : ""
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleChange}
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <p className="text-sm font-medium">{file.name}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">Drag & drop or click</p>
                                        <p className="text-xs text-muted-foreground">PDF files only</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
                            )}

                            <Button className="w-full" onClick={handleAnalyze} disabled={!file || !targetRole || loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                                ) : (
                                    "Analyze Resume"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-5">
                    {analysis ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Results</CardTitle>
                                <CardDescription>AI-powered analysis for {targetRole}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* ATS Score */}
                                <div className="flex flex-col items-center py-4">
                                    <div className={cn(
                                        "relative h-28 w-28 flex items-center justify-center rounded-full border-4",
                                        getATSColor(analysis.ats_score)
                                    )}>
                                        <div className="text-center">
                                            <Award className={cn("h-5 w-5 mx-auto mb-1", getATSColor(analysis.ats_score).split(' ')[0])} />
                                            <span className={cn("text-3xl font-bold", getATSColor(analysis.ats_score).split(' ')[0])}>
                                                {analysis.ats_score}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-2 font-medium">ATS Score</p>
                                    <p className={cn("text-sm", getATSColor(analysis.ats_score).split(' ')[0])}>
                                        {getATSLabel(analysis.ats_score)}
                                    </p>
                                </div>

                                {/* Skills */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <CheckCircle className="h-4 w-4" />
                                            <h4 className="font-semibold text-sm">Skills You Have</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {analysis.skills_you_have.map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs border border-green-500/20">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-orange-500">
                                            <XCircle className="h-4 w-4" />
                                            <h4 className="font-semibold text-sm">Skills You Need</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {analysis.skills_you_need.map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs border border-orange-500/20">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Generate Roadmap */}
                                <div className="pt-4 border-t">
                                    <Button className="w-full" onClick={handleGenerateRoadmap} disabled={analysis.skills_you_need.length === 0}>
                                        Build Learning Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10">
                            <div className="text-center max-w-xs px-4">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <h3 className="font-semibold mb-1">No Analysis Yet</h3>
                                <p className="text-sm">Upload a resume to see ATS score and skill analysis.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalysis;
