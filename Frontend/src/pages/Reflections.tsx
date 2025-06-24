import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, ImageIcon, Mic, Upload, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { questService } from "@/services/questService";

// Define type for reflection data
interface Reflection {
  _id: string;
  questId?: {
    _id: string;
    title: string;
    category?: string;
  };
  reflectionText: string;
  photoUrl?: string | null;
  audioUrl?: string | null;
  moodBefore: string;
  moodAfter: string;
  submittedAt: string;
  pointsEarned?: number;
}

// Add this interface to match the backend data
interface QuestOption {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  moodTargeted?: string;
  frequency?: string;
  reflectionPrompts?: {
    question: string;
    type: string;
  }[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Reflections = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");
  const [textReflection, setTextReflection] = useState("");
  const [reflectionTitle, setReflectionTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [moodBefore, setMoodBefore] = useState("");
  const [moodAfter, setMoodAfter] = useState("");
  const [questId, setQuestId] = useState("");
  const [availableQuests, setAvailableQuests] = useState<QuestOption[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<QuestOption | null>(null);
  
  const [userReflections, setUserReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Fetch user's reflections on component mount
  useEffect(() => {
    fetchReflections();
    fetchAvailableQuests();
  }, []);

  // When quest changes, suggest appropriate reflection type
  useEffect(() => {
    if (questId) {
      const quest = availableQuests.find(q => q._id === questId);
      if (quest) {
        setSelectedQuest(quest);
        // If there are reflection prompts, use them
        if (quest.reflectionPrompts && quest.reflectionPrompts.length > 0) {
          // Suggest appropriate media type if specified
          const preferredType = quest.reflectionPrompts.find(p => 
            p.type !== 'text' && p.type !== 'any'
          )?.type;
          
          if (preferredType === 'photo') {
            setActiveTab('photo');
          } else if (preferredType === 'audio') {
            setActiveTab('audio');
          }
          
          // Set reflection title based on first prompt
          if (quest.reflectionPrompts[0].question) {
            setReflectionTitle(quest.title);
          }
        }
      }
    }
  }, [questId, availableQuests]);

  const fetchReflections = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_URL}/reflections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reflections');
      }

      const data = await response.json();
      setUserReflections(data);
    } catch (error) {
      console.error('Error fetching reflections:', error);
      toast({
        title: "Failed to load reflections",
        description: "Please try again later or check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableQuests = async () => {
    try {
      // Use the new enhanced API for reflection-optimized quests
      const quests = await questService.getQuestsForReflection();
      setAvailableQuests(quests);
    } catch (error) {
      console.error('Error fetching quests:', error);
      toast({
        title: "Failed to load quests",
        description: "Please try again later",
        variant: "destructive"
      });
      
      // Fallback to regular quest endpoint if the reflection-specific one fails
      try {
        const data = await questService.fetchQuests();
        setAvailableQuests(data.quests);
      } catch (fallbackError) {
        console.error('Fallback quest fetch also failed:', fallbackError);
      }
    }
  };

  const handleSubmitReflection = async () => {
    if (!reflectionTitle.trim() || !questId) {
      toast({
        title: "Missing information",
        description: "Please add a title and select a quest.",
        variant: "destructive",
      });
      return;
    }

    if (!moodBefore || !moodAfter) {
      toast({
        title: "Mood tracking required",
        description: "Please select your mood before and after the activity.",
        variant: "destructive",
      });
      return;
    }

    const contentValidation = 
      (activeTab === 'text' && !textReflection.trim()) ||
      (activeTab === 'photo' && !selectedFile) ||
      (activeTab === 'audio' && !audioBlob);

    if (contentValidation) {
      toast({
        title: "Missing content",
        description: `Please add ${activeTab === 'text' ? 'text' : activeTab === 'photo' ? 'a photo' : 'an audio recording'} to your reflection.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('jwt_token');
      
      // Compress and convert files to base64
      let photoBase64 = null;
      if (activeTab === 'photo' && selectedFile) {
        photoBase64 = await convertToBase64(selectedFile);
      }
      
      let audioBase64 = null;
      if (activeTab === 'audio' && audioBlob) {
        // For audio, we might want to use a different approach to handle large files
        try {
          audioBase64 = await convertToBase64(new File([audioBlob], 'audio.webm'));
        } catch (audioError) {
          console.error("Audio conversion error:", audioError);
          toast({
            title: "Audio processing issue",
            description: "Your recording may be too large. Please try a shorter recording.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create request body
      const requestBody = {
        questId,
        reflectionText: textReflection.trim() ? textReflection : reflectionTitle,
        moodBefore,
        moodAfter,
        photoBase64,
        audioBase64
      };

      // Check the payload size before submitting
      const payloadSize = JSON.stringify(requestBody).length;
      
      // If payload is too large (over 40MB), show error
      if (payloadSize > 40 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Your photo or audio file is too large. Please use a smaller file.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // POST to /api/reflections
      const response = await fetch(`${API_URL}/reflections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reflection');
      }

      const data = await response.json();
      
      // Mark quest as completed with the new reflection
      if (data.reflection && data.reflection._id) {
        try {
          const completeResult = await questService.completeQuest(questId, data.reflection._id);
          if (completeResult.success) {
            // Additional points might have been awarded
            const totalPoints = completeResult.points;
            
            toast({
              title: "Reflection saved! ✨",
              description: `You've earned ${data.pointsEarned || 10} points for your growth journey!`,
            });
          }
        } catch (completeError) {
          // If quest completion fails, just log it - the reflection was still saved
          console.error("Error completing quest:", completeError);
        }
      } else {
        toast({
          title: "Reflection saved! ✨",
          description: `You've earned ${data.pointsEarned || 10} points for your growth journey!`,
        });
      }
      
      // Reset form
      setReflectionTitle("");
      setTextReflection("");
      setSelectedFile(null);
      setAudioBlob(null);
      setMoodBefore("");
      setMoodAfter("");
      setQuestId("");
      setSelectedQuest(null);
      
      // Refresh reflections list
      fetchReflections();
      // Also refresh available quests since one was completed
      fetchAvailableQuests();
    } catch (error) {
      console.error("Error submitting reflection:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      
      // Stop recording after 2 minutes max
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 120000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording not available",
        description: "Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get reflection prompts based on selected quest and active tab
  const getReflectionPrompts = () => {
    if (!selectedQuest || !selectedQuest.reflectionPrompts) return null;
    
    const relevantPrompts = selectedQuest.reflectionPrompts.filter(prompt => 
      prompt.type === activeTab || prompt.type === 'any' || 
      (activeTab === 'text' && prompt.type === 'text')
    );
    
    if (relevantPrompts.length === 0) return null;
    
    return (
      <div className="bg-muted/50 p-3 rounded-md mb-4">
        <h4 className="font-medium text-sm mb-2">Reflection Prompts:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {relevantPrompts.map((prompt, index) => (
            <li key={index}>• {prompt.question}</li>
          ))}
        </ul>
      </div>
    );
  };

  const moodOptions = [
    "Happy", "Calm", "Anxious", "Sad", "Energetic", 
    "Frustrated", "Hopeful", "Relaxed", "Stressed", "Grateful",
    "Tired", "Motivated", "Bored", "Excited", "Content"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Reflection Portal</h1>
        <p className="text-muted-foreground">
          Capture your thoughts, emotions, and insights in your preferred format
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Create New Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quest">Select Quest</Label>
                  <Select value={questId} onValueChange={setQuestId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quest to reflect on" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuests.map(quest => (
                        <SelectItem key={quest._id} value={quest._id}>
                          {quest.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Reflection Title</Label>
                  <Input
                    id="title"
                    value={reflectionTitle}
                    onChange={(e) => setReflectionTitle(e.target.value)}
                    placeholder="What's this reflection about?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="moodBefore">Mood Before</Label>
                    <Select value={moodBefore} onValueChange={setMoodBefore}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did you feel before?" />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map(mood => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="moodAfter">Mood After</Label>
                    <Select value={moodAfter} onValueChange={setMoodAfter}>
                      <SelectTrigger>
                        <SelectValue placeholder="How do you feel now?" />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map(mood => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photo
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  {/* Show prompts if available */}
                  {selectedQuest && getReflectionPrompts()}
                  
                  <div>
                    <Label htmlFor="reflection">Your Reflection</Label>
                    <Textarea
                      id="reflection"
                      value={textReflection}
                      onChange={(e) => setTextReflection(e.target.value)}
                      placeholder={selectedQuest?.reflectionPrompts?.[0]?.question || 
                        "Share your thoughts, feelings, insights, or anything that comes to mind..."}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="photo" className="space-y-4">
                  {/* Show prompts if available */}
                  {selectedQuest && getReflectionPrompts()}
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="text-green-600 dark:text-green-400">
                          ✓ Photo selected: {selectedFile.name}
                        </div>
                        {/* Preview the selected image */}
                        <div className="max-h-60 overflow-hidden rounded-md">
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Selected" 
                            className="w-auto h-auto max-h-60 mx-auto"
                          />
                        </div>
                        <Button variant="outline" onClick={() => setSelectedFile(null)}>
                          Choose Different Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedQuest?.reflectionPrompts?.find(p => p.type === 'photo')?.question ||
                             "Upload a photo that captures your moment or mood"}
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="photo-upload"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                          >
                            Choose Photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  {/* Show prompts if available */}
                  {selectedQuest && getReflectionPrompts()}
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {audioBlob ? (
                      <div className="space-y-4">
                        <div className="text-green-600 dark:text-green-400">
                          ✓ Voice recording captured
                        </div>
                        <audio controls className="mx-auto">
                          <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                        </audio>
                        <Button variant="outline" onClick={() => setAudioBlob(null)}>
                          Record Again
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Mic className={`h-12 w-12 mx-auto ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {isRecording ? 'Recording your voice...' : 
                              selectedQuest?.reflectionPrompts?.find(p => p.type === 'audio')?.question ||
                              'Record your thoughts and feelings'}
                          </p>
                          <Button
                            variant={isRecording ? "destructive" : "outline"}
                            onClick={isRecording ? stopRecording : startRecording}
                          >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={handleSubmitReflection}
                className="w-full"
                disabled={
                  isSubmitting ||
                  !reflectionTitle.trim() || 
                  !questId ||
                  !moodBefore ||
                  !moodAfter ||
                  (activeTab === 'text' && !textReflection.trim()) ||
                  (activeTab === 'photo' && !selectedFile) ||
                  (activeTab === 'audio' && !audioBlob)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Reflection'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Reflections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : userReflections.length > 0 ? (
                <div className="space-y-4">
                  {userReflections.map((reflection) => (
                    <div 
                      key={reflection._id} 
                      className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">
                          {reflection.questId?.title || "Reflection"}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {reflection.photoUrl ? "photo" : reflection.audioUrl ? "audio" : "text"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {reflection.reflectionText?.substring(0, 100)}
                        {reflection.reflectionText?.length > 100 ? "..." : ""}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDate(reflection.submittedAt)}
                        </span>
                        <span>
                          {reflection.moodBefore} → {reflection.moodAfter}
                        </span>
                      </div>
                      {/* Show points earned if available */}
                      {reflection.pointsEarned && (
                        <div className="text-xs text-primary mt-1">
                          +{reflection.pointsEarned} points
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reflections yet. Start your journey!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reflections;

// Helper function to convert and compress files to base64
const convertToBase64 = async (file: File): Promise<string> => {
  // For images, compress before converting to base64
  if (file.type.startsWith('image/')) {
    return await compressAndConvertImage(file);
  }
  
  // For other files, use standard base64 conversion
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to compress images
const compressAndConvertImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const imgElement = new window.Image(); // Use window.Image instead of Image
      imgElement.src = event.target?.result as string;
      
      imgElement.onload = () => {
        // Create a canvas to draw and compress the image
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions (max 1000px)
        let width = imgElement.width;
        let height = imgElement.height;
        
        if (width > height && width > 1000) {
          height = Math.round((height * 1000) / width);
          width = 1000;
        } else if (height > 1000) {
          width = Math.round((width * 1000) / height);
          height = 1000;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(imgElement, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
        resolve(compressedBase64);
      };
      
      imgElement.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
