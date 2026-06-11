import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  const startChat = () => {
    navigate("/chat");
  };

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Serenity</h1>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button onClick={startChat}>
                  Start Chat
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleLogin}>
                  Sign In
                </Button>
                <Button onClick={startChat}>
                  Start Chatting
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Your Private Space for <span className="text-indigo-600 dark:text-indigo-400">Wellness & Reflection</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            A compassionate AI companion that listens without judgment. Share your thoughts, track your mood, and discover wellness tools designed for your mental well-being.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" onClick={startChat} className="text-base px-8">
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Anonymous Chat
          </Button>
          {!isAuthenticated && (
            <Button size="lg" variant="outline" onClick={handleLogin} className="text-base px-8">
              Create Account
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto mb-16">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <Shield className="w-4 h-4 inline mr-2" />
            <strong>Important:</strong> This AI is not a licensed therapist. For emergencies or serious mental health concerns, please contact emergency services or a mental health professional.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Features Designed for Your Wellness
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MessageCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Real-Time Chat</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Have meaningful conversations with an empathetic AI companion available 24/7.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Mood Tracking</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Log your mood before and after sessions to visualize your wellness journey.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Heart className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Wellness Tools</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Access daily affirmations and guided breathing exercises for instant calm.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Safe & Private</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your conversations are private. Crisis detection ensures your safety.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
              Why Choose Serenity?
            </h3>
            <ul className="space-y-4">
              {[
                "Anonymous or authenticated sessions - your choice",
                "AI-generated session summaries with insights",
                "Mood trends to track your emotional journey",
                "Export summaries as PDF or text",
                "Multi-language support",
                "Dark mode for comfortable viewing",
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <Heart className="w-24 h-24 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 opacity-50" />
              <p className="text-slate-600 dark:text-slate-400">
                A safe space for your thoughts and feelings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 dark:bg-indigo-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Wellness Journey?
          </h3>
          <p className="text-indigo-100 mb-8 text-lg">
            Begin a conversation today. No judgment, just support.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={startChat}
            className="text-base px-8"
          >
            Start Chatting Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="mb-2">
            Serenity is an AI wellness companion, not a replacement for professional mental health care.
          </p>
          <p>
            If you're in crisis, please contact emergency services or a mental health professional immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
