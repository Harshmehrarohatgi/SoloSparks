
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('solo_sparks_onboarded');
    const token = localStorage.getItem('jwt_token');
    
    if (hasOnboarded && token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full gradient-bg flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 float-animation">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            Solo Sparks
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Ignite Your Emotional Intelligence
          </p>
          <p className="text-lg text-muted-foreground">
            Discover, Reflect, and Grow Through Personalized Quests
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl sparkle-animation">
                ✨
              </div>
              <h3 className="font-semibold mb-2">Personalized Quests</h3>
              <p className="text-sm text-muted-foreground">
                Daily challenges tailored to your emotional growth journey
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                💭
              </div>
              <h3 className="font-semibold mb-2">Reflection Tools</h3>
              <p className="text-sm text-muted-foreground">
                Capture insights through text, photos, and voice recordings
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                📈
              </div>
              <h3 className="font-semibold mb-2">Growth Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your progress and celebrate milestones
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-lg font-semibold rounded-2xl hover:scale-105 transition-transform"
            onClick={() => navigate('/register')}
          >
            Start Your Journey
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary/80"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
