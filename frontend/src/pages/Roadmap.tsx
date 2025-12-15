import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, ExternalLink, AlertCircle, RefreshCw, Loader2, Trophy, TrendingUp, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface WeekPlan {
    topic: string;
    resources: string[];
}

interface RoadmapData {
    [key: string]: WeekPlan;
}

const Roadmap = () => {
    const { user } = useAuth();
    const [roadmapData, setRoadmapData] = useState<RoadmapData>({});
    const [roadmapId, setRoadmapId] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("Learning Roadmap");
    const [loading, setLoading] = useState(true);
    const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [source, setSource] = useState<string>("none");

    // Fetch roadmap - prioritize chat session (includes chat modifications)
    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!user) return;

            try {
                // First try to get from chat session (includes chat modifications)
                const sessionResponse = await axios.get(`${import.meta.env.VITE_API_URL}/chat/roadmap/${user.id}`);

                if (sessionResponse.data.roadmap && Object.keys(sessionResponse.data.roadmap).length > 0) {
                    setRoadmapData(sessionResponse.data.roadmap);
                    setTitle(sessionResponse.data.goal || "Learning Roadmap");
                    setSource(sessionResponse.data.source);

                    if (sessionResponse.data.id) {
                        setRoadmapId(sessionResponse.data.id);
                    }
                    if (sessionResponse.data.completed_weeks) {
                        setCompletedWeeks(sessionResponse.data.completed_weeks);
                    }
                } else {
                    // Fallback to database
                    const dbResponse = await axios.get(`${import.meta.env.VITE_API_URL}/roadmap/latest/${user.id}`);
                    if (dbResponse.data.roadmap) {
                        setRoadmapData(dbResponse.data.roadmap.roadmap_json || {});
                        setTitle(dbResponse.data.roadmap.title || "Learning Roadmap");
                        setRoadmapId(dbResponse.data.roadmap.id);
                        setCompletedWeeks(dbResponse.data.roadmap.completed_weeks || []);
                        setSource("database");
                    }
                }
            } catch (err) {
                console.error("Error fetching roadmap:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [user]);

    // Refresh roadmap (to pick up chat changes)
    const refreshRoadmap = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/roadmap/${user.id}`);
            if (response.data.roadmap && Object.keys(response.data.roadmap).length > 0) {
                setRoadmapData(response.data.roadmap);
                setTitle(response.data.goal || "Learning Roadmap");
                setSource(response.data.source);
            }
        } catch (err) {
            console.error("Error refreshing roadmap:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteWeek = async (weekNum: number) => {
        if (!roadmapId) return;

        const newCompleted = completedWeeks.includes(weekNum)
            ? completedWeeks.filter(w => w !== weekNum)
            : [...completedWeeks, weekNum].sort((a, b) => a - b);

        setCompletedWeeks(newCompleted);

        const totalWeeks = Object.keys(roadmapData).filter(k => k.startsWith('Week')).length;
        const progress = Math.round((newCompleted.length / totalWeeks) * 100);

        setSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/roadmap/progress`, {
                roadmap_id: roadmapId,
                progress: progress,
                completed_weeks: newCompleted
            });
        } catch (err) {
            console.error("Error saving progress:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-pulse text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-medium">Loading your roadmap...</h3>
                </div>
            </div>
        );
    }

    if (!roadmapData || Object.keys(roadmapData).length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Learning Roadmap</h2>
                    <p className="text-muted-foreground mt-1">Your personalized learning path</p>
                </div>
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="text-center max-w-md">
                        <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No Roadmap Yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Upload your resume to auto-generate a personalized learning roadmap, or create one through chat!
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button asChild>
                                <Link to="/resume">Analyze Resume</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/chat">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Create in Chat
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Parse weeks
    const weeks = Object.entries(roadmapData)
        .filter(([key]) => key.startsWith('Week'))
        .map(([key, value], index) => ({
            week: index + 1,
            topic: value.topic || key,
            resources: value.resources || []
        }));

    const totalWeeks = weeks.length;
    const progress = Math.round((completedWeeks.length / totalWeeks) * 100);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Learning Roadmap</h2>
                    <p className="text-muted-foreground mt-1">{title}</p>
                    {source === "session" && (
                        <p className="text-xs text-primary mt-1">✨ Includes chat modifications</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={refreshRoadmap}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-sm font-medium">{progress}% Complete</div>
                            <div className="text-xs text-muted-foreground">{completedWeeks.length}/{totalWeeks} weeks</div>
                        </div>
                    </div>
                    {progress === 100 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
                            <Trophy className="h-5 w-5" />
                            <span className="font-medium">Completed!</span>
                        </div>
                    )}
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
            </div>

            {/* Tip for modifying via chat */}
            <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                    <p className="text-sm font-medium">💡 Modify your roadmap through chat!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Say things like "Add Python to my roadmap" or "Focus my roadmap on React" in the AI chat.
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-muted ml-4 md:ml-8 space-y-10 pb-8">
                {weeks.map((week, index) => {
                    const isCompleted = completedWeeks.includes(week.week);
                    const isNext = !completedWeeks.includes(week.week) &&
                        (completedWeeks.length === 0 ? index === 0 : completedWeeks.includes(week.week - 1));

                    return (
                        <div key={index} className="relative pl-8 md:pl-12">
                            {/* Timeline Dot */}
                            <div
                                className={cn(
                                    "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 transition-all bg-background",
                                    isCompleted ? "border-green-500 bg-green-500" :
                                        isNext ? "border-primary ring-4 ring-primary/20" : "border-muted"
                                )}
                            >
                                {isCompleted && <CheckCircle2 className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                            </div>

                            <Card className={cn("transition-all", isNext ? "border-primary/50 shadow-lg" : isCompleted ? "opacity-80" : "opacity-60")}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Week {week.week}: {week.topic}</CardTitle>
                                            <CardDescription>Focus on mastering this topic</CardDescription>
                                        </div>
                                        {isCompleted && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                                                Completed
                                            </span>
                                        )}
                                        {isNext && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            Resources
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {week.resources.map((resource, i) => (
                                                <a
                                                    key={i}
                                                    href="#"
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                                                >
                                                    {resource}
                                                    <ExternalLink className="h-3 w-3 opacity-50" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {roadmapId && (
                                        <Button
                                            size="sm"
                                            variant={isCompleted ? "outline" : "default"}
                                            onClick={() => handleCompleteWeek(week.week)}
                                        >
                                            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Roadmap;
