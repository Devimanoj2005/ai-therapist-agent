import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Send, Loader2, LogOut, Heart, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CRISIS_RESOURCES = {
  US: {
    title: "National Suicide Prevention Lifeline",
    number: "988",
    url: "https://suicidepreventionlifeline.org",
  },
  UK: {
    title: "Samaritans",
    number: "116 123",
    url: "https://www.samaritans.org.uk",
  },
  INTERNATIONAL: {
    title: "International Association for Suicide Prevention",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
  },
};

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [moodLogId, setMoodLogId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preMood, setPreMood] = useState<number | null>(null);
  const [showMoodPrompt, setShowMoodPrompt] = useState(true);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisType, setCrisisType] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  // tRPC mutations
  const startSessionMutation = trpc.chat.startSession.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const endSessionMutation = trpc.chat.endSession.useMutation();

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await startSessionMutation.mutateAsync({ language: "en" });
        setSessionId(result.sessionId);
        setMoodLogId(result.moodLogId);
      } catch (error) {
        toast.error("Failed to start session");
        console.error(error);
      }
    };

    initSession();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMoodSubmit = (mood: number) => {
    setPreMood(mood);
    setShowMoodPrompt(false);

    // Add a system message
    setMessages([
      {
        id: "system-mood",
        role: "assistant",
        content: `Thank you for sharing your mood. I'm here to listen and support you. What's on your mind today?`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId,
        message: inputValue,
        moodLogId: moodLogId || undefined,
        preMood: preMood || undefined,
      });

      if (response.isCrisis && response.crisisType) {
        setCrisisType(response.crisisType);
        setShowCrisisAlert(true);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const result = await endSessionMutation.mutateAsync({
        sessionId,
        postMood: undefined, // User can set this in a dialog
        moodLogId: moodLogId || undefined,
      });

      setSessionSummary(result.summary);
      setSessionEnded(true);
    } catch (error) {
      toast.error("Failed to end session");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="font-semibold text-slate-900 dark:text-white">Serenity</h1>
        </div>
        <div className="flex gap-2">
          {isAuthenticated && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleEndSession} disabled={isLoading || sessionEnded}>
            End Session
          </Button>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          <strong>Disclaimer:</strong> I'm an AI companion, not a licensed therapist. For emergencies, please contact emergency services.
        </p>
      </div>

      {/* Crisis Alert */}
      {showCrisisAlert && (
        <Alert className="m-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-900 dark:text-red-200">
            <strong>We're concerned about your safety.</strong> If you're having thoughts of self-harm or suicide, please reach out to emergency services or a crisis helpline immediately.
            <div className="mt-3 space-y-2">
              <p className="font-semibold">Crisis Resources:</p>
              <ul className="space-y-1 text-sm">
                <li>🇺🇸 <strong>US:</strong> National Suicide Prevention Lifeline: <a href="tel:988" className="underline font-semibold">988</a></li>
                <li>🇬🇧 <strong>UK:</strong> Samaritans: <a href="tel:116123" className="underline font-semibold">116 123</a></li>
                <li><a href={CRISIS_RESOURCES.INTERNATIONAL.url} target="_blank" rel="noopener noreferrer" className="underline">International Crisis Resources</a></li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {showMoodPrompt && !sessionEnded && (
          <Card className="p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">How are you feeling right now?</h3>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                <Button
                  key={mood}
                  variant={preMood === mood ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMoodSubmit(mood)}
                  className="w-10"
                >
                  {mood}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-indigo-600 dark:bg-indigo-700 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none"
              }`}
            >
              {msg.role === "assistant" ? (
                <Streamdown>{msg.content}</Streamdown>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-lg rounded-bl-none">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        )}

        {sessionEnded && sessionSummary && (
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Session Summary</h3>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">Summary</p>
                <p>{sessionSummary.summary}</p>
              </div>
              {sessionSummary.keyTopics && (
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">Key Topics</p>
                  <p>{sessionSummary.keyTopics}</p>
                </div>
              )}
              {sessionSummary.emotionalInsights && (
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">Emotional Insights</p>
                  <p>{sessionSummary.emotionalInsights}</p>
                </div>
              )}
              {sessionSummary.suggestedNextSteps && (
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">Suggested Next Steps</p>
                  <p>{sessionSummary.suggestedNextSteps}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!sessionEnded && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Share your thoughts..."
              disabled={isLoading || !sessionId}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !sessionId || !inputValue.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {sessionEnded && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 text-center">
          <Button onClick={() => setLocation("/")} className="mr-2">
            Back to Home
          </Button>
          {isAuthenticated && (
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              View Dashboard
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
