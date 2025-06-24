
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { TrendingUp, Calendar, Trophy, Target, Star } from "lucide-react";

const Progress = () => {
  const milestones = [
    {
      id: "1",
      title: "First Reflection",
      description: "Completed your first reflection entry",
      date: "2024-01-10",
      completed: true,
      icon: "📝",
    },
    {
      id: "2",
      title: "Week Warrior",
      description: "Completed all daily quests for a full week",
      date: "2024-01-14",
      completed: true,
      icon: "🏆",
    },
    {
      id: "3",
      title: "Mindful Moment",
      description: "Logged your mood 7 days in a row",
      date: "2024-01-15",
      completed: true,
      icon: "🧘",
    },
    {
      id: "4",
      title: "Self-Discovery Explorer",
      description: "Complete 25 total quests",
      progress: 18,
      total: 25,
      completed: false,
      icon: "🗺️",
    },
    {
      id: "5",
      title: "Reflection Master",
      description: "Create 10 different reflection entries",
      progress: 6,
      total: 10,
      completed: false,
      icon: "✨",
    },
  ];

  const weeklyProgress = [
    { day: "Mon", quests: 3, mood: "happy" },
    { day: "Tue", quests: 2, mood: "calm" },
    { day: "Wed", quests: 4, mood: "excited" },
    { day: "Thu", quests: 1, mood: "tired" },
    { day: "Fri", quests: 3, mood: "happy" },
    { day: "Sat", quests: 2, mood: "calm" },
    { day: "Sun", quests: 1, mood: "thoughtful" },
  ];

  const totalQuests = weeklyProgress.reduce((sum, day) => sum + day.quests, 0);
  const streakDays = 7; // Demo streak

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Growth Tracker</h1>
        <p className="text-muted-foreground">
          Visualize your emotional intelligence journey and celebrate your progress
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card growth-gradient text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6" />
              <span className="text-2xl font-bold">{totalQuests}</span>
            </div>
            <p className="text-sm opacity-90">Quests Completed This Week</p>
          </CardContent>
        </Card>

        <Card className="glass-card spark-gradient text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-6 w-6" />
              <span className="text-2xl font-bold">{streakDays}</span>
            </div>
            <p className="text-sm opacity-90">Day Growth Streak</p>
          </CardContent>
        </Card>

        <Card className="glass-card quest-gradient text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-sm opacity-90">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium">{day.day}</span>
                    </div>
                    <div>
                      <p className="font-medium">{day.quests} quests completed</p>
                      <p className="text-sm text-muted-foreground capitalize">Mood: {day.mood}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: day.quests }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Milestones & Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`p-4 rounded-lg border transition-all ${
                    milestone.completed 
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                      : "bg-accent/20 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{milestone.icon}</div>
                      <div>
                        <h4 className={`font-medium ${milestone.completed ? "text-green-700 dark:text-green-300" : ""}`}>
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    {milestone.completed ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                  
                  {!milestone.completed && milestone.progress && milestone.total && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{milestone.progress}/{milestone.total}</span>
                      </div>
                      <ProgressBar value={(milestone.progress / milestone.total) * 100} />
                    </div>
                  )}
                  
                  {milestone.completed && milestone.date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned on {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
