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
      <nav className="border-b border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-blue-900/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
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
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-blue-900 dark:text-blue-100 mb-8 leading-tight tracking-tight">
            Your Private Space for <span className="text-blue-600 dark:text-blue-300">Wellness & Reflection</span>
          </h2>
          <p className="text-lg text-blue-700 dark:text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            A compassionate AI companion that listens without judgment. Share your thoughts, track your mood, and discover wellness tools designed for your mental well-being.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Button size="lg" onClick={startChat} className="text-base px-10 py-3 font-semibold">
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Anonymous Chat
          </Button>
          {!isAuthenticated && (
            <Button size="lg" variant="outline" onClick={handleLogin} className="text-base px-10 py-3 font-semibold">
              Create Account
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 max-w-2xl mx-auto mb-20 shadow-md">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-3">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span><strong>Important:</strong> This AI is not a licensed therapist. For emergencies or serious mental health concerns, please contact emergency services or a mental health professional.</span>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-blue-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center text-blue-900 dark:text-blue-100 mb-16 tracking-tight">
            Features Designed for Your Wellness
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105 border border-blue-100 dark:border-blue-800">
              <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-300 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Real-Time Chat</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                Have meaningful conversations with an empathetic AI companion available 24/7.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105 border border-blue-100 dark:border-blue-800">
              <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-300 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Mood Tracking</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                Log your mood before and after sessions to visualize your wellness journey.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105 border border-blue-100 dark:border-blue-800">
              <Heart className="w-10 h-10 text-red-600 dark:text-red-300 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Wellness Tools</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                Access daily affirmations and guided breathing exercises for instant calm.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105 border border-blue-100 dark:border-blue-800">
              <Shield className="w-10 h-10 text-purple-600 dark:text-purple-300 mb-4" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Safe & Private</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                Your conversations are private. Crisis detection ensures your safety.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-8 tracking-tight">
              Why Choose Serenity?
            </h3>
            <ul className="space-y-5">
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
                  <span className="text-blue-700 dark:text-blue-200 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-2xl p-12 h-96 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-lg">
            <div className="text-center">
              <Heart className="w-28 h-28 text-blue-600 dark:text-blue-300 mx-auto mb-6 opacity-80" />
              <p className="text-lg text-blue-700 dark:text-blue-200 font-medium">
                A safe space for your thoughts and feelings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to Start Your Wellness Journey?
          </h3>
          <p className="text-blue-100 mb-10 text-lg leading-relaxed">
            Begin a conversation today. No judgment, just support.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={startChat}
            className="text-base px-12 py-3 font-semibold"
          >
            Start Chatting Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 dark:bg-blue-950 text-blue-100 py-12 border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p className="mb-3 text-blue-200">
            Serenity is an AI wellness companion, not a replacement for professional mental health care.
          </p>
          <p className="text-blue-200">
            If you're in crisis, please contact emergency services or a mental health professional immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
