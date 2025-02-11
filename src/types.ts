export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  pdf_url: string;
  cover_image: string;
  published_date: string;
  likes_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  book_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_subscribed: boolean;
}
