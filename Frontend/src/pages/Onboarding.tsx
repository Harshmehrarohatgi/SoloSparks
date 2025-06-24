
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    personalityType: "",
    currentMood: "",
    goals: [] as string[],
    preferences: {
      reminderTime: "",
      questDifficulty: "",
    },
    emotionalNeeds: "",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      // POST to /api/onboarding
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('jwt_token', result.token || 'demo_token');
        localStorage.setItem('solo_sparks_onboarded', 'true');
        localStorage.setItem('user_profile', JSON.stringify(formData));
        
        toast({
          title: "Welcome to Solo Sparks! ✨",
          description: "Your personal growth journey begins now.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      // Demo mode - save locally
      console.log("Onboarding data:", formData);
      localStorage.setItem('jwt_token', 'demo_token');
      localStorage.setItem('solo_sparks_onboarded', 'true');
      localStorage.setItem('user_profile', JSON.stringify(formData));
      
      toast({
        title: "Welcome to Solo Sparks! ✨",
        description: "Your personal growth journey begins now.",
      });
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">What's your name?</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Your age"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label>What's your personality like?</Label>
            <RadioGroup
              value={formData.personalityType}
              onValueChange={(value) => setFormData({ ...formData, personalityType: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="introvert" id="introvert" />
                <Label htmlFor="introvert">Introverted - I prefer quiet time and deep conversations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="extrovert" id="extrovert" />
                <Label htmlFor="extrovert">Extroverted - I energize around people and social activities</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ambivert" id="ambivert" />
                <Label htmlFor="ambivert">Ambivert - I enjoy both social time and solitude</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Label>How are you feeling lately?</Label>
            <RadioGroup
              value={formData.currentMood}
              onValueChange={(value) => setFormData({ ...formData, currentMood: value })}
            >
              {[
                { value: "great", label: "😊 Great - Life feels good!" },
                { value: "okay", label: "😐 Okay - Some ups and downs" },
                { value: "struggling", label: "😔 Struggling - Could use some support" },
                { value: "stressed", label: "😰 Stressed - Feeling overwhelmed" },
                { value: "excited", label: "✨ Excited - Ready for growth!" },
              ].map((mood) => (
                <div key={mood.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={mood.value} id={mood.value} />
                  <Label htmlFor={mood.value}>{mood.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Label>What are your growth goals? (Select all that apply)</Label>
            <div className="space-y-2">
              {[
                "Better emotional awareness",
                "Improved relationships",
                "Stress management",
                "Self-confidence",
                "Mindfulness & presence",
                "Communication skills",
                "Work-life balance",
                "Personal creativity",
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.goals.includes(goal)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({ ...formData, goals: [...formData.goals, goal] });
                      } else {
                        setFormData({ 
                          ...formData, 
                          goals: formData.goals.filter(g => g !== goal) 
                        });
                      }
                    }}
                  />
                  <Label htmlFor={goal}>{goal}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>When would you like daily reminders?</Label>
              <RadioGroup
                value={formData.preferences.reminderTime}
                onValueChange={(value) => 
                  setFormData({ 
                    ...formData, 
                    preferences: { ...formData.preferences, reminderTime: value } 
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">Morning (8 AM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">Afternoon (2 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">Evening (7 PM)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="emotionalNeeds">Anything else you'd like us to know? (optional)</Label>
              <Textarea
                id="emotionalNeeds"
                value={formData.emotionalNeeds}
                onChange={(e) => setFormData({ ...formData, emotionalNeeds: e.target.value })}
                placeholder="Share anything that might help us personalize your experience..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg sparkle-animation"></div>
            <div>
              <CardTitle>Let's get to know you</CardTitle>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps} - This helps us personalize your journey
              </p>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={
                (currentStep === 1 && !formData.name) ||
                (currentStep === 2 && !formData.personalityType) ||
                (currentStep === 3 && !formData.currentMood) ||
                (currentStep === 4 && formData.goals.length === 0) ||
                (currentStep === 5 && !formData.preferences.reminderTime)
              }
            >
              {currentStep === totalSteps ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
