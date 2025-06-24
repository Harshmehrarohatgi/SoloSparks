import { useState, useEffect } from "react";
import { SparkPointsCard } from "@/components/dashboard/SparkPointsCard";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { QuestFilters } from "@/components/dashboard/QuestFilters";
import { useToast } from "@/hooks/use-toast";
import { questService, Quest } from "@/services/questService";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "daily" | "weekly">("all");
  const [sparkPoints, setSparkPoints] = useState({
    totalPoints: 0,
    recentQuests: 0,
    level: 1,
    badges: ["First Login"],
  });

  useEffect(() => {
    fetchQuests();
  }, []);

  useEffect(() => {
    filterQuests();
  }, [quests, activeFilter]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await questService.fetchQuests();
      
      setQuests(data.quests);
      setSparkPoints(prev => ({
        ...prev,
        totalPoints: data.totalPoints,
        recentQuests: data.completedToday,
        level: calculateLevel(data.totalPoints),
      }));
    } catch (error) {
      console.error("Error fetching quests:", error);
      toast({
        title: "Could not load quests",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points: number): number => {
    // Simple level calculation: 1 level per 100 points
    return Math.floor(points / 100) + 1;
  };

  const filterQuests = () => {
    if (activeFilter === "all") {
      setFilteredQuests(quests);
    } else {
      setFilteredQuests(quests.filter(q => q.frequency === activeFilter || q.type === activeFilter));
    }
  };

  const handleAssignQuest = async (questId: string) => {
    try {
      const result = await questService.assignQuest(questId);
      
      if (result.success) {
        // Mark the quest as completed in the UI
        setQuests(prev => prev.map(q => 
          q._id === questId || q.id === questId 
            ? { ...q, completed: true } 
            : q
        ));
        
        // Calculate points based on quest type
        const quest = quests.find(q => q._id === questId || q.id === questId);
        if (quest) {
          const pointsEarned = quest.points || getPointsForQuestType(quest.frequency || quest.type || "daily");
          
          // Update total points
          setSparkPoints(prev => {
            const newPoints = prev.totalPoints + pointsEarned;
            return {
              ...prev,
              totalPoints: newPoints,
              recentQuests: prev.recentQuests + 1,
              level: calculateLevel(newPoints),
            };
          });
          
          toast({
            title: "Quest Assigned! ✨",
            description: `You'll earn ${pointsEarned} points when you complete this quest!`,
          });
        }
      }
    } catch (error) {
      console.error("Error assigning quest:", error);
      toast({
        title: "Error",
        description: "Failed to assign quest. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function for point calculation
  const getPointsForQuestType = (type: string): number => {
    switch (type.toLowerCase()) {
      case 'daily': return 10;
      case 'weekly': return 20;
      case 'monthly': return 50;
      default: return 5;
    }
  };

  // Get user name from local storage
  const userName = localStorage.getItem('user_name') || 'Adventurer';
  
  // Filter quests by frequency
  const dailyQuests = filteredQuests.filter(q => q.frequency === "daily" || q.type === "daily");
  const weeklyQuests = filteredQuests.filter(q => q.frequency === "weekly" || q.type === "weekly");
  const monthlyQuests = filteredQuests.filter(q => q.frequency === "monthly" || q.type === "monthly");
  
  // Calculate completion stats
  const completedCount = quests.filter(q => q.completed).length;
  const totalCount = quests.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! ✨</h1>
        <p className="text-muted-foreground">
          Ready to continue your emotional growth journey?
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Progress: {completedCount}/{totalCount} quests completed
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SparkPointsCard data={sparkPoints} />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <QuestFilters 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            questCounts={{
              all: quests.length,
              daily: quests.filter(q => q.frequency === "daily" || q.type === "daily").length,
              weekly: quests.filter(q => q.frequency === "weekly" || q.type === "weekly").length,
            }}
          />

          {activeFilter === "all" || activeFilter === "daily" ? (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4" id="quests">
                {activeFilter === "all" ? "Today's Quests" : "Daily Quests"}
              </h2>
              <div className="grid gap-4">
                {dailyQuests.length > 0 ? (
                  dailyQuests.map((quest) => (
                    <QuestCard
                      key={quest._id || quest.id}
                      quest={quest}
                      onAssign={() => handleAssignQuest(quest._id || quest.id || '')}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No daily quests available
                  </div>
                )}
              </div>
            </div>
          ) : null}
          
          {activeFilter === "all" || activeFilter === "weekly" ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                {activeFilter === "all" ? "Weekly Challenges" : "Weekly Quests"}
              </h2>
              <div className="grid gap-4">
                {weeklyQuests.length > 0 ? (
                  weeklyQuests.map((quest) => (
                    <QuestCard
                      key={quest._id || quest.id}
                      quest={quest}
                      onAssign={() => handleAssignQuest(quest._id || quest.id || '')}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No weekly quests available
                  </div>
                )}
              </div>
            </div>
          ) : null}
          
          {/* Add monthly quests section if needed */}
          {monthlyQuests.length > 0 && (activeFilter === "all") && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">
                Monthly Growth Challenges
              </h2>
              <div className="grid gap-4">
                {monthlyQuests.map((quest) => (
                  <QuestCard
                    key={quest._id || quest.id}
                    quest={quest}
                    onAssign={() => handleAssignQuest(quest._id || quest.id || '')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
