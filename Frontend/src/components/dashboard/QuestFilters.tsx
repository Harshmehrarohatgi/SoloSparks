
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuestFiltersProps {
  activeFilter: "all" | "daily" | "weekly";
  onFilterChange: (filter: "all" | "daily" | "weekly") => void;
  questCounts: {
    all: number;
    daily: number;
    weekly: number;
  };
}

export const QuestFilters = ({ activeFilter, onFilterChange, questCounts }: QuestFiltersProps) => {
  const filters = [
    { key: "all" as const, label: "All Quests", count: questCounts.all },
    { key: "daily" as const, label: "Daily", count: questCounts.daily },
    { key: "weekly" as const, label: "Weekly", count: questCounts.weekly },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-card/50 rounded-lg border">
      <div className="text-sm font-medium text-muted-foreground mr-4 flex items-center">
        Filter by:
      </div>
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className="flex items-center gap-2"
        >
          {filter.label}
          <Badge variant="secondary" className="ml-1 text-xs">
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};
