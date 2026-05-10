export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'owner' | 'admin' | 'client';
  whatsapp?: string;
  createdAt: any;
}

export interface Post {
  id?: string;
  authorId: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string;
  mediaUrls: string[];
  createdAt: any;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  type: 'text' | 'image' | 'file';
  createdAt: any;
}

export interface Portfolio {
  id?: string;
  userId: string;
  slug: string;
  title: string;
  description: string;
  theme: string;
  sections: PortfolioSection[];
  createdAt: any;
}

export interface PortfolioSection {
  type: 'hero' | 'about' | 'gallery' | 'contact' | 'custom';
  content: any;
}

export interface AICreation {
  id?: string;
  userId: string;
  type: 'image' | 'video' | 'voice';
  prompt: string;
  url: string;
  createdAt: any;
}
