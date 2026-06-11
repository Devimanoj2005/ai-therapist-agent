import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface SessionDetailProps {
  params: {
    id: string;
  };
}

export default function SessionDetail({ params }: SessionDetailProps) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Fetch session details
  const { data: session, isLoading } = trpc.sessions.get.useQuery(
    { sessionId: params.id },
    { enabled: isAuthenticated }
  );

  const deleteSession = trpc.sessions.delete.useMutation();
  const exportSession = trpc.export.exportSession.useMutation();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession.mutateAsync({ sessionId: params.id });
      toast.success("Session deleted");
      navigate("/sessions");
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportSession.mutateAsync({
        sessionId: params.id,
        format: "text",
      });
      // Create a text file and download it
      const element = document.createElement("a");
      const file = new Blob([result.summary.content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `session-${params.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Session exported");
    } catch (error) {
      toast.error("Failed to export session");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
        <div className="container max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/sessions")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
          <Card className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-300">Session not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/sessions")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
            <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {session.session.title || "Untitled Session"}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {new Date(session.session.createdAt).toLocaleDateString()} at{" "}
                {new Date(session.session.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exportSession.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteSession.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Session Summary */}
        {session.summary && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Session Summary
            </h2>
            <div className="space-y-4">
              {session.summary.keyTopics && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Key Topics</h3>
                  <p className="text-slate-600 dark:text-slate-300">{session.summary.keyTopics}</p>
                </div>
              )}
              {session.summary.emotionalInsights && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Emotional Insights
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {session.summary.emotionalInsights}
                  </p>
                </div>
              )}
              {session.summary.suggestedNextSteps && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Suggested Next Steps
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {session.summary.suggestedNextSteps}
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Full Summary</h3>
                <div className="text-slate-600 dark:text-slate-300">
                  <Streamdown>{session.summary.fullSummary}</Streamdown>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Session Status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Session Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
              <p className="font-semibold text-slate-900 dark:text-white capitalize">
                {session.session.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Language</p>
              <p className="font-semibold text-slate-900 dark:text-white">{session.session.language}</p>
            </div>
            {session.session.endedAt && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ended At</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(session.session.endedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
