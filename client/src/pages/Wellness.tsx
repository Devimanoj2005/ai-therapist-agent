import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Wind, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Wellness() {
  const [language, setLanguage] = useState("en");
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathingCount, setBreathingCount] = useState(4);

  // Fetch affirmation
  const { data: affirmation, refetch: refetchAffirmation } = trpc.wellness.getAffirmation.useQuery(
    { language },
    { enabled: true }
  );

  // Fetch breathing exercises
  const { data: exercises } = trpc.wellness.getBreathingExercises.useQuery(
    { language },
    { enabled: true }
  );

  // Breathing exercise animation
  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setBreathingCount((prev) => {
        if (prev <= 1) {
          if (breathingPhase === "inhale") {
            setBreathingPhase("hold");
            return 4;
          } else if (breathingPhase === "hold") {
            setBreathingPhase("exhale");
            return 4;
          } else {
            setBreathingPhase("inhale");
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing, breathingPhase]);

  const getPhaseText = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
    }
  };

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case "inhale":
        return "bg-blue-500";
      case "hold":
        return "bg-purple-500";
      case "exhale":
        return "bg-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Wellness Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Take care of your mental health with guided exercises and daily affirmations
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="affirmations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="affirmations" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Daily Affirmations</span>
              <span className="sm:hidden">Affirmations</span>
            </TabsTrigger>
            <TabsTrigger value="breathing" className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span className="hidden sm:inline">Breathing Exercises</span>
              <span className="sm:hidden">Breathing</span>
            </TabsTrigger>
          </TabsList>

          {/* Affirmations Tab */}
          <TabsContent value="affirmations" className="space-y-4">
            <Card className="p-8 text-center">
              {affirmation ? (
                <div className="space-y-6">
                  <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 leading-relaxed">
                    "{affirmation.text}"
                  </div>
                  <Button
                    onClick={() => refetchAffirmation()}
                    variant="outline"
                    className="mx-auto flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Get Another Affirmation
                  </Button>
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-300">Loading affirmation...</p>
              )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Tip</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Repeat this affirmation three times daily for best results
                </p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Mindfulness</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Take a moment to truly absorb the meaning of these words
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Breathing Exercises Tab */}
          <TabsContent value="breathing" className="space-y-4">
            {!isBreathing ? (
              <div className="space-y-4">
                <Card className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Guided Breathing Exercise
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    A simple 4-4-4 breathing technique to help you relax and reduce anxiety
                  </p>
                  <Button
                    onClick={() => setIsBreathing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
                  >
                    Start Breathing Exercise
                  </Button>
                </Card>

                {exercises && exercises.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Other Breathing Techniques
                    </h4>
                    {exercises.map((exercise, idx) => (
                      <Card key={idx} className="p-4">
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-2">
                          {exercise.name}
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {exercise.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center space-y-8">
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    {getPhaseText()}
                  </p>
                  <div
                    className={`w-32 h-32 mx-auto rounded-full ${getPhaseColor()} animate-breathe transition-all duration-1000 flex items-center justify-center`}
                  >
                    <span className="text-white text-2xl font-bold">{breathingCount}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300">
                    Breathing in for 4 seconds, holding for 4 seconds, and exhaling for 4 seconds
                  </p>
                  <Button
                    onClick={() => {
                      setIsBreathing(false);
                      setBreathingPhase("inhale");
                      setBreathingCount(4);
                    }}
                    variant="outline"
                  >
                    Stop Exercise
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Language Selector */}
        <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </div>
    </div>
  );
}
