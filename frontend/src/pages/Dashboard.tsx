import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Map, Briefcase, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface ResumeAnalysis {
    id: string;
    target_role: string;
    analysis_json: {
        match_percentage?: number;
        current_skills?: string[];
        missing_skills?: string[];
    };
    created_at: string;
}

interface Roadmap {
    id: string;
    title: string;
    created_at: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [resumes, setResumes] = useState<ResumeAnalysis[]>([]);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                // Fetch user's resume analyses
                const { data: resumeData } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Fetch user's roadmaps
                const { data: roadmapData } = await supabase
                    .from('roadmaps')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                setResumes(resumeData || []);
                setRoadmaps(roadmapData || []);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    // Calculate stats from real data
    const avgMatchPercentage = resumes.length > 0
        ? Math.round(resumes.reduce((acc, r) => acc + (r.analysis_json?.match_percentage || 0), 0) / resumes.length)
        : 0;

    const uniqueRoles = new Set(resumes.map(r => r.target_role)).size;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userName}</h2>
                    <p className="text-muted-foreground mt-1">Here's an overview of your career progress.</p>
                </div>
                <Button asChild>
                    <Link to="/resume">
                        New Analysis <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Career Readiness</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgMatchPercentage}%</div>
                        <Progress value={avgMatchPercentage} className="mt-3" />
                        <p className="text-xs text-muted-foreground mt-2">
                            Based on your analyses
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resumes Analyzed</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resumes.length}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {uniqueRoles} roles targeted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Roadmaps Active</CardTitle>
                        <Map className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roadmaps.length}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Learning paths created
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Applied</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Coming soon
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Recommendations */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your recent analyses and roadmaps
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading...</div>
                        ) : resumes.length === 0 && roadmaps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No activity yet. Start by analyzing your resume!</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {resumes.slice(0, 3).map((resume) => (
                                    <div key={resume.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full flex items-center justify-center border text-blue-500 bg-blue-500/10">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Resume Analysis</p>
                                            <p className="text-sm text-muted-foreground">
                                                Analyzed for {resume.target_role} - {resume.analysis_json?.match_percentage || 0}% match
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            {new Date(resume.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                                {roadmaps.slice(0, 2).map((roadmap) => (
                                    <div key={roadmap.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full flex items-center justify-center border text-green-500 bg-green-500/10">
                                            <Map className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Roadmap Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                {roadmap.title}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            {new Date(roadmap.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Get started with your career journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <h4 className="text-sm font-semibold mb-1">Analyze Your Resume</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                Upload your resume to get AI-powered feedback and identify skill gaps.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link to="/resume">Start Analysis</Link>
                            </Button>
                        </div>
                        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <h4 className="text-sm font-semibold mb-1">Chat with AI Counselor</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                Get personalized career advice from our AI career counselor.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link to="/chat">Start Chat</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
