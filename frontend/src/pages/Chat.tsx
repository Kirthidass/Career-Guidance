import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Sparkles } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I'm your AI Career Counselor. I can help you review your career goals, suggest improvements for your resume, or conduct mock interviews. If you've already uploaded your resume, I'll use it to give you personalized advice. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasResumeContext, setHasResumeContext] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            if (!user) return;
            try {
                // First load context into AI memory
                await axios.post(`${import.meta.env.VITE_API_URL}/chat/load-context/${user.id}`);
                setHasResumeContext(true);
            } catch (error) {
                console.error("Error loading context:", error);
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/history/${user.id}`);
                if (response.data.messages && response.data.messages.length > 0) {
                    const historyMessages: Message[] = response.data.messages.map((msg: { role: string; content: string }) => ({
                        role: msg.role as "user" | "assistant",
                        content: msg.content
                    }));
                    setMessages([messages[0], ...historyMessages]);
                }
            } catch (error) {
                console.error("Error loading chat history:", error);
            }
        };
        loadHistory();
    }, [user]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat/message`, {
                user_id: user.id,
                message: input
            });

            const aiMessage: Message = {
                role: "assistant",
                content: response.data.response
            };
            setMessages(prev => [...prev, aiMessage]);
            setHasResumeContext(response.data.context_used);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Context indicator */}
            {hasResumeContext && (
                <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-primary/10 text-primary text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Using your resume for personalized advice</span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex gap-4 max-w-[80%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                            msg.role === "user" ? "bg-primary/10 border-primary/20" : "bg-muted border-border"
                        )}>
                            {msg.role === "user" ? (
                                <User className="h-5 w-5 text-primary" />
                            ) : (
                                <Bot className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>

                        <div className={cn(
                            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                            msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-foreground rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-4 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                            <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="mt-6">
                {/* Quick Actions */}
                {messages.length === 1 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {[
                            "Improve my resume",
                            "Interview preparation",
                            "Career path advice",
                            "Skill recommendations"
                        ].map((action) => (
                            <button
                                key={action}
                                onClick={() => setInput(action)}
                                className="whitespace-nowrap px-4 py-2 rounded-full border bg-background hover:bg-accent text-sm transition-colors"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="pr-12 resize-none py-3 min-h-[50px] max-h-[150px]"
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    AI can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
};

export default Chat;
