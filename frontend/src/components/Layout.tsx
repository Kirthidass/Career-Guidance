import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    FileText,
    MessageSquare,
    Mic,
    Settings,
    Bell,
    User,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Pathfinder', href: '/chat', icon: MessageSquare },
        { name: 'Resume Analysis', href: '/resume', icon: FileText },
        { name: 'My Roadmap', href: '/roadmap', icon: Map },
        { name: 'Mock Interview', href: '/interview', icon: Mic },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Get user name from metadata or email
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Map className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        AI Career Compass
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <div className="text-xs font-semibold text-slate-500 mb-4 px-2">MENU</div>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
                        <Settings className="h-5 w-5" />
                        Settings
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                {/* Header */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8">
                    <h1 className="text-xl font-semibold text-foreground">
                        {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
                    </h1>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-foreground">{userName}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
