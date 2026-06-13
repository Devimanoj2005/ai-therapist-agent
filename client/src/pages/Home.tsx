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
    <div className="min-h-screen bg-blue-50 dark:bg-blue-950">
      {/* Navigation */}
      <nav className="border-b border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-blue-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h1 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Serenity</h1>
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
          <h2 className="text-5xl md:text-6xl font-bold text-blue-900 dark:text-blue-100 mb-6 leading-tight">
            Your Private Space for <span className="text-blue-500 dark:text-blue-400">Wellness & Reflection</span>
          </h2>
          <p className="text-xl text-blue-700 dark:text-blue-200 max-w-2xl mx-auto mb-8">
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
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <Shield className="w-4 h-4 inline mr-2" />
            <strong>Important:</strong> This AI is not a licensed therapist. For emergencies or serious mental health concerns, please contact emergency services or a mental health professional.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-blue-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-blue-900 dark:text-blue-100 mb-12">
            Features Designed for Your Wellness
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Real-Time Chat</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Have meaningful conversations with an empathetic AI companion available 24/7.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Mood Tracking</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Log your mood before and after sessions to visualize your wellness journey.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Heart className="w-8 h-8 text-red-500 dark:text-red-400 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Wellness Tools</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Access daily affirmations and guided breathing exercises for instant calm.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Shield className="w-8 h-8 text-purple-500 dark:text-purple-400 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Safe & Private</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
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
            <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-6">
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
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  </div>
                  <span className="text-blue-700 dark:text-blue-200">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-8 h-96 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <Heart className="w-24 h-24 text-blue-600 dark:text-blue-300 mx-auto mb-4 opacity-70" />
              <p className="text-blue-700 dark:text-blue-200">
                A safe space for your thoughts and feelings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Wellness Journey?
          </h3>
          <p className="text-blue-100 mb-8 text-lg">
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
      <footer className="bg-blue-900 dark:bg-blue-950 text-blue-100 py-8 border-t border-blue-800">
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
