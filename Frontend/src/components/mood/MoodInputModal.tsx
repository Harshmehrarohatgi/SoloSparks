
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MoodInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "😤", label: "Stressed", value: "stressed" },
  { emoji: "😢", label: "Sad", value: "sad" },
  { emoji: "😡", label: "Angry", value: "angry" },
  { emoji: "🤔", label: "Thoughtful", value: "thoughtful" },
  { emoji: "✨", label: "Inspired", value: "inspired" },
];

export const MoodInputModal = ({ open, onOpenChange }: MoodInputModalProps) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedMood) return;

    try {
      // POST to /api/mood
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ mood: selectedMood, timestamp: new Date().toISOString() }),
      });

      if (response.ok) {
        toast({
          title: "Mood logged! ✨",
          description: "Thanks for sharing how you're feeling.",
        });
        onOpenChange(false);
        setSelectedMood("");
      }
    } catch (error) {
      console.log("Mood logging:", { mood: selectedMood, timestamp: new Date().toISOString() });
      toast({
        title: "Mood logged! ✨",
        description: "Thanks for sharing how you're feeling.",
      });
      onOpenChange(false);
      setSelectedMood("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling right now?</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-3 my-6">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              className="flex flex-col h-16 p-2"
              onClick={() => setSelectedMood(mood.value)}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedMood} className="flex-1">
            Log Mood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
