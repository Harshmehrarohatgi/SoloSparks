
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Target } from "lucide-react";

interface SparkPointsData {
  totalPoints: number;
  recentQuests: number;
  level: number;
  badges: string[];
}

interface SparkPointsCardProps {
  data: SparkPointsData;
}

export const SparkPointsCard = ({ data }: SparkPointsCardProps) => {
  const progressToNext = (data.totalPoints % 100) / 100;
  
  return (
    <Card className="glass-card spark-gradient text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 sparkle-animation" />
            Spark Points
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Level {data.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{data.totalPoints}</div>
          <p className="text-white/80 text-sm">Total Points Earned</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {data.level + 1}</span>
            <span>{Math.round(progressToNext * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-center">
            <div className="text-lg font-semibold">{data.recentQuests}</div>
            <p className="text-xs text-white/80">Quests Completed</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{data.badges.length}</div>
            <p className="text-xs text-white/80">Badges Earned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
