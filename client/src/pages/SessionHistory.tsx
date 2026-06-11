import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Download, Trash2, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SessionHistory() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "mood-improvement">("recent");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch sessions
  const { data: sessions, isLoading, refetch } = trpc.sessions.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    let filtered = sessions.filter((session) => {
      const query = searchQuery.toLowerCase();
      const summaryText = typeof session.summary === "string" ? session.summary : session.summary?.fullSummary || "";
      return (
        session.title?.toLowerCase().includes(query) ||
        summaryText.toLowerCase().includes(query)
      );
    })

    // Sort
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "mood-improvement") {
      // Sort by session date as fallback
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [sessions, searchQuery, sortBy]);

  const deleteSession = trpc.sessions.delete.useMutation();
  const handleDelete = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync({ sessionId });
      toast.success("Session deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  const exportSession = trpc.export.exportSession.useMutation();
  const handleExport = async (sessionId: string) => {
    try {
      const result = await exportSession.mutateAsync({
        sessionId,
        format: "text",
      });
      // Create a text file and download it
      const element = document.createElement("a");
      const file = new Blob([result.summary.content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `session-${sessionId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Session exported");
    } catch (error) {
      toast.error("Failed to export session");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Your Sessions
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            View and manage your therapy session history
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="mood-improvement">Best Mood Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {sessions?.length === 0
                ? "You haven't started any sessions yet"
                : "No sessions match your search"}
            </p>
            {sessions?.length === 0 && (
              <Button onClick={() => navigate("/chat")} className="bg-indigo-600 hover:bg-indigo-700">
                Start Your First Session
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/session/${session.id}`)}>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate hover:text-indigo-600 dark:hover:text-indigo-400">
                      {session.title || "Untitled Session"}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {typeof session.summary === "string"
                        ? session.summary
                        : session.summary?.fullSummary || "No summary available"}
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>
                        {new Date(session.createdAt).toLocaleDateString()} at{" "}
                        {new Date(session.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="capitalize">{session.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(session.id);
                      }}
                      className="text-slate-600 hover:text-indigo-600"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(session.id);
                      }}
                      className="text-slate-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
