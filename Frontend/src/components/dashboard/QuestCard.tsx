import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quest } from "@/services/questService";

interface QuestCardProps {
  quest: Quest;
  onAssign: () => void;
}

export function QuestCard({ quest, onAssign }: QuestCardProps) {
  const {
    title,
    description,
    category,
    frequency = quest.type || "daily",
    pointsReward,
    points = pointsReward || getPointsForQuestType(frequency),
    completed,
  } = quest;

  // Remove image reference entirely and use colored backgrounds instead
  const bgColor = getBgColorForCategory(category || "default");

  function getBgColorForCategory(category: string): string {
    const colors: Record<string, string> = {
      "reflection": "bg-blue-100 dark:bg-blue-900",
      "mindfulness": "bg-purple-100 dark:bg-purple-900",
      "physical": "bg-green-100 dark:bg-green-900",
      "creativity": "bg-red-100 dark:bg-red-900",
      "social": "bg-yellow-100 dark:bg-yellow-900",
      "awareness": "bg-teal-100 dark:bg-teal-900",
      "default": "bg-gray-100 dark:bg-gray-800"
    };
    
    return colors[category.toLowerCase()] || colors.default;
  }

  function getPointsForQuestType(type: string): number {
    switch (type.toLowerCase()) {
      case 'daily': return 10;
      case 'weekly': return 20;
      case 'monthly': return 50;
      default: return 5;
    }
  }

  return (
    <Card className={`overflow-hidden transition-all ${completed ? 'bg-muted' : ''}`}>
      <div className="relative">
        {/* Replace image with colored div + icon */}
        <div className={`h-32 ${bgColor} flex items-center justify-center`}>
          <div className="text-center">
            <div className="text-3xl font-bold">{category?.charAt(0) || '?'}</div>
            <div className="text-xs uppercase mt-1">{category || 'Quest'}</div>
          </div>
        </div>
        <Badge 
          className="absolute top-2 right-2" 
          variant={frequency === "daily" ? "default" : frequency === "weekly" ? "secondary" : "outline"}
        >
          {frequency === "daily" && "Daily"}
          {frequency === "weekly" && "Weekly"}
          {frequency === "monthly" && "Monthly"}
        </Badge>
      </div>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline">{category}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm font-medium">
          <span className="text-primary">{points} points</span>
        </div>
        <Button 
          variant={completed ? "outline" : "default"} 
          size="sm"
          onClick={onAssign}
          disabled={completed}
        >
          {completed ? "Completed" : "Take Quest"}
        </Button>
      </CardFooter>
    </Card>
  );
}
