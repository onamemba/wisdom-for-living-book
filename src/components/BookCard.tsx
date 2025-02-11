import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Heart, Share2, MessageCircle } from 'lucide-react';

interface BookCardProps {
  id: string;
  title: string;
  coverUrl: string;
  likes: number;
  comments: number;
  month: string;
  year: string;
}

export function BookCard({ id, title, coverUrl, likes, comments, month, year }: BookCardProps) {
  return (
    <div className="w-full max-w-[165px] mx-auto bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
  {/* Book Cover */}
  <Link to={`/book/${id}`}> {/* Added Link around the image */}
  <div className="relative w-h6 h-56 bg-gray-100 "> {/* Adjusted height */}
    <img
      src={coverUrl}
      alt={title}
      className="w-full h-full object-contain shadow-md hover:shadow-lg transition-shadow"
      loading="lazy"
    />
  </div>
  </Link>

    {/* Card Content */}
    <div className="p-3"> {/* Reduced padding */}
    {/* Title and Date */}
    <div className="mb-1"> {/* Reduced bottom margin */}
      <h3 className="text-xs font-semibold text-gray-900 truncate">{title}</h3> {/* Reduced font size */}
      <p className="text-gray-600 text-xs">{month} {year}</p>
    </div>

    {/* Description */}
    <p className="text-gray-500 text-xs mb-2 truncate">By Pastor Justin Chiwala</p> {/* Reduced font size */}

    {/* Buttons and Interactions */}
    <div className="flex items-center justify-between">
      {/* Read Now Button */}
      <Link
        to={`/book/${id}`}
        className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 hover:bg-blue-600" 
      >
        <Book size={18} />
        Read Now
      </Link>

      {/* Likes, Comments, and Share */}
      {/* <div className="flex items-center gap-2"> 
        <button className="text-gray-600 hover:text-red-500 flex items-center gap-1">
          <Heart size={12} /> 
          <span className="text-xs">{likes}</span>
        </button>
        <button className="text-gray-600 hover:text-blue-500 flex items-center gap-1">
          <MessageCircle size={12} /> 
          <span className="text-xs">{comments}</span>
        </button>
        <button className="text-gray-600 hover:text-green-500">
          <Share2 size={12} /> 
        </button>
      </div> */}
    </div>
  </div>
</div>
  
  );
}