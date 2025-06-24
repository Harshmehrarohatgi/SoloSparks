
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Lock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: "profile_boost" | "content" | "feature";
  icon: string;
  available: boolean;
  redeemed: boolean;
}

const Rewards = () => {
  const { toast } = useToast();
  const [currentPoints] = useState(250); // From SparkPointsCard
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: "1",
      title: "Golden Profile Badge",
      description: "Show off your dedication with a special golden badge on your profile",
      cost: 100,
      type: "profile_boost",
      icon: "🏆",
      available: true,
      redeemed: false,
    },
    {
      id: "2",
      title: "Advanced Reflection Templates",
      description: "Unlock premium guided reflection templates for deeper insights",
      cost: 150,
      type: "content",
      icon: "📚",
      available: true,
      redeemed: false,
    },
    {
      id: "3",
      title: "Mood Analytics Dashboard",
      description: "Get detailed insights into your mood patterns and trends",
      cost: 200,
      type: "feature",
      icon: "📊",
      available: true,
      redeemed: false,
    },
    {
      id: "4",
      title: "Custom Quest Creator",
      description: "Create your own personalized quests and challenges",
      cost: 300,
      type: "feature",
      icon: "🎯",
      available: false,
      redeemed: false,
    },
    {
      id: "5",
      title: "Mindfulness Master Badge",
      description: "Exclusive badge for completing 50 mindfulness-focused quests",
      cost: 500,
      type: "profile_boost",
      icon: "🧘",
      available: false,
      redeemed: false,
    },
    {
      id: "6",
      title: "Personal Growth Playlist",
      description: "Curated collection of guided meditations and affirmations",
      cost: 75,
      type: "content",
      icon: "🎵",
      available: true,
      redeemed: true,
    },
  ]);

  const handleRedeem = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.cost > currentPoints || reward.redeemed || !reward.available) {
      return;
    }

    try {
      // POST to /api/rewards/redeem
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ rewardId }),
      });

      if (response.ok) {
        setRewards(prev => prev.map(r => 
          r.id === rewardId ? { ...r, redeemed: true } : r
        ));
        
        toast({
          title: "Reward Redeemed! ✨",
          description: `You've unlocked: ${reward.title}`,
        });
      }
    } catch (error) {
      console.log("Redeeming reward:", rewardId);
      setRewards(prev => prev.map(r => 
        r.id === rewardId ? { ...r, redeemed: true } : r
      ));
      
      toast({
        title: "Reward Redeemed! ✨",
        description: `You've unlocked: ${reward.title}`,
      });
    }
  };

  const getRewardStatus = (reward: Reward) => {
    if (reward.redeemed) return "redeemed";
    if (!reward.available) return "locked";
    if (reward.cost > currentPoints) return "insufficient";
    return "available";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "redeemed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "locked": return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      case "insufficient": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const availableRewards = rewards.filter(r => r.available && !r.redeemed);
  const redeemedRewards = rewards.filter(r => r.redeemed);
  const lockedRewards = rewards.filter(r => !r.available);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Rewards Store</h1>
        <p className="text-muted-foreground mb-4">
          Redeem your Spark Points for exclusive rewards and features
        </p>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full">
          <Star className="h-5 w-5" />
          <span className="font-semibold">{currentPoints} Spark Points</span>
        </div>
      </div>

      <div className="space-y-8">
        {availableRewards.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Gift className="h-6 w-6" />
              Available Rewards
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRewards.map((reward) => {
                const status = getRewardStatus(reward);
                return (
                  <Card key={reward.id} className="glass-card hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{reward.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{reward.title}</CardTitle>
                            <Badge className={getStatusColor(status)}>
                              {status === "insufficient" ? "Need more points" : "Available"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-primary font-semibold">
                            <Star className="h-4 w-4" />
                            {reward.cost}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {reward.description}
                      </p>
                      <Button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={reward.cost > currentPoints}
                        className="w-full"
                      >
                        {reward.cost > currentPoints ? "Insufficient Points" : "Redeem Now"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {redeemedRewards.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              Your Rewards
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {redeemedRewards.map((reward) => (
                <Card key={reward.id} className="glass-card border-green-200 dark:border-green-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{reward.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{reward.title}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Redeemed
                          </Badge>
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {lockedRewards.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-muted-foreground" />
              Coming Soon
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedRewards.map((reward) => (
                <Card key={reward.id} className="glass-card opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl grayscale">{reward.icon}</div>
                        <div>
                          <CardTitle className="text-lg text-muted-foreground">{reward.title}</CardTitle>
                          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Locked
                          </Badge>
                        </div>
                      </div>
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Rewards;
