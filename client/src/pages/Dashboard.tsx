import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, TrendingUp, Wind, Sparkles, LogOut, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const logoutMutation = trpc.auth.logout.useMutation();

  // tRPC queries - always called, even if not authenticated
  const sessionsQuery = trpc.sessions.list.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const moodTrendsQuery = trpc.mood.trends.useQuery(undefined, { enabled: isAuthenticated });
  const affirmationQuery = trpc.wellness.getAffirmation.useQuery({ language: "en" }, { enabled: isAuthenticated });
  const breathingExercisesQuery = trpc.wellness.getBreathingExercises.useQuery({ language: "en" }, { enabled: isAuthenticated });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please sign in to access your dashboard and view your session history.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="w-full"
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }



  const sessions = sessionsQuery.data || [];
  const moodTrends = moodTrendsQuery.data || [];
  const affirmation = affirmationQuery.data;
  const breathingExercises = breathingExercisesQuery.data || [];

  const filteredSessions = sessions.filter(
    (session) =>
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setLocation("/chat")}>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button variant="outline" onClick={() => setLocation("/sessions")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Sessions
            </Button>
            <Button variant="outline" onClick={() => setLocation("/wellness")}>
              <Wind className="w-4 h-4 mr-2" />
              Wellness
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {user?.name || "Friend"}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your wellness journey and revisit your therapy sessions.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">
              <MessageCircle className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="mood">
              <TrendingUp className="w-4 h-4 mr-2" />
              Mood Trends
            </TabsTrigger>
            <TabsTrigger value="wellness">
              <Wind className="w-4 h-4 mr-2" />
              Wellness
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Sparkles className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            {sessionsQuery.isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
              </Card>
            ) : filteredSessions.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No sessions yet. Start a new chat to begin your wellness journey.
                </p>
                <Button onClick={() => setLocation("/chat")}>Start a Chat</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/session/${session.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {session.title || "Untitled Session"}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === "ended"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {new Date(session.createdAt).toLocaleDateString()} at{" "}
                      {new Date(session.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {session.summary && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {session.summary.fullSummary}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mood Trends Tab */}
          <TabsContent value="mood" className="space-y-4">
            {moodTrendsQuery.isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">Loading mood data...</p>
              </Card>
            ) : moodTrends.length === 0 ? (
              <Card className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No mood data yet. Start a chat session to begin tracking your mood.
                </p>
              </Card>
            ) : (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Your Mood Journey
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    {moodTrends.some((d) => d.preMood) && (
                      <Line
                        type="monotone"
                        dataKey="preMood"
                        stroke="#f59e0b"
                        name="Before Session"
                        connectNulls
                      />
                    )}
                    {moodTrends.some((d) => d.postMood) && (
                      <Line
                        type="monotone"
                        dataKey="postMood"
                        stroke="#10b981"
                        name="After Session"
                        connectNulls
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Affirmation */}
              <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Daily Affirmation</h3>
                </div>
                {affirmationQuery.isLoading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading affirmation...</p>
                ) : affirmation ? (
                  <div className="space-y-3">
                    <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                      "{affirmation.text}"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => affirmationQuery.refetch()}
                    >
                      Get Another
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No affirmation available</p>
                )}
              </Card>

              {/* Breathing Exercises */}
              <Card className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50">
                <div className="flex items-start gap-3 mb-4">
                  <Wind className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Breathing Exercises</h3>
                </div>
                {breathingExercisesQuery.isLoading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading exercises...</p>
                ) : breathingExercises.length > 0 ? (
                  <div className="space-y-2">
                    {breathingExercises.slice(0, 3).map((exercise) => (
                      <Button
                        key={exercise.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setLocation(`/breathing/${exercise.id}`)}
                      >
                        {exercise.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No breathing exercises available
                  </p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user?.name || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user?.email || "Not set"}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
