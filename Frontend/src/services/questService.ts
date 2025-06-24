export interface Quest {
  _id: string;
  id?: string; // For compatibility with existing code
  title: string;
  description: string;
  category: string;
  moodTargeted: string;
  frequency: string; // "daily" | "weekly" | "monthly"
  type?: string; // Compatibility alias for frequency
  points?: number; // For UI display
  completed?: boolean; // Client-side tracking
  image?: string; // Optional image URL
  reflectionPrompts?: { 
    question: string; 
    type: string;
  }[];
  pointsReward?: number;
}

export interface QuestsResponse {
  quests: Quest[];
  totalPoints: number;
  completedToday: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const questService = {
  // Fetch personalized quests from the API
  fetchQuests: async (): Promise<QuestsResponse> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/quests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to fetch quests');
      }

      // Handle empty responses by defaulting to empty array
      const quests = await response.json().catch(() => []);
      
      // Transform backend data to match frontend interface
      const transformedQuests = quests.map((quest: Quest) => ({
        ...quest,
        id: quest._id, // Keep id for compatibility
        type: quest.frequency, // Map frequency to type
        points: quest.pointsReward || getPointsForQuest(quest.frequency),
        // Use provided 'completed' flag or default to false
        completed: quest.completed || false,
        // Generate image URL based on category
        image: quest.image || getImageForCategory(quest.category),
      }));

      // Get user data for points display
      const userResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();

      const completedToday = userData.completedQuests?.filter(
        (q: any) => {
          if (!q.completedAt) return false;
          const completedDate = new Date(q.completedAt);
          const today = new Date();
          return completedDate.toDateString() === today.toDateString();
        }
      ).length || 0;

      return {
        quests: transformedQuests,
        totalPoints: userData.points || 0,
        completedToday: completedToday
      };
    } catch (error) {
      console.error('Error in fetchQuests:', error);
      throw error;
    }
  },

  // Assign a quest to the current user
  assignQuest: async (questId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/quests/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign quest');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Quest assigned successfully',
      };
    } catch (error) {
      console.error('Error in assignQuest:', error);
      throw error;
    }
  },

  // Get quests specifically available for reflection
  getQuestsForReflection: async (): Promise<Quest[]> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/quests/reflection-options`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reflection quests');
      }

      const quests = await response.json();
      
      // Transform to match frontend interface
      return quests.map((quest: Quest) => ({
        ...quest,
        id: quest._id,
        type: quest.frequency,
        points: quest.pointsReward || getPointsForQuest(quest.frequency),
        image: getImageForCategory(quest.category),
      }));
    } catch (error) {
      console.error('Error in getQuestsForReflection:', error);
      throw error;
    }
  },

  // Mark a quest as completed via a reflection
  completeQuest: async (questId: string, reflectionId: string): Promise<{ success: boolean; points: number }> => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/quests/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questId, reflectionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete quest');
      }

      const data = await response.json();
      return {
        success: true,
        points: data.points || 0,
      };
    } catch (error) {
      console.error('Error in completeQuest:', error);
      throw error;
    }
  }
};

// Helper function to assign points based on quest frequency
function getPointsForQuest(frequency: string): number {
  switch (frequency?.toLowerCase()) {
    case 'daily': return 10;
    case 'weekly': return 20;
    case 'monthly': return 50;
    default: return 5;
  }
}

// Helper function to assign images based on quest category
function getImageForCategory(category: string): string {
  const defaultImage = '/images/quest-default.jpg';
  
  const categoryImages: {[key: string]: string} = {
    'Reflection': '/images/reflection-quest.jpg',
    'Mindfulness': '/images/mindfulness-quest.jpg',
    'Creativity': '/images/creativity-quest.jpg',
    'Physical': '/images/physical-quest.jpg',
    'Social': '/images/social-quest.jpg',
    'Awareness': '/images/awareness-quest.jpg',
  };
  
  return categoryImages[category] || defaultImage;
}
