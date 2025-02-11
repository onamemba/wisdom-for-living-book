import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '../components/PDFViewer';
import { AuthModal } from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { Book } from 'lucide-react';
import { books } from '../data/books';

export function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const book = books.find(b => b.id === id);

  if (!book) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{book.title}</h1>
            <p className="text-gray-600">By {book.author}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mt-4 sm:mt-0"
          >
            <Book size={20} />
            Back to Library
          </button>
        </div>

        <div className="w-full">
          <PDFViewer
            url={book.pdfUrl}
            isSubscribed={isSubscribed}
            onSubscribe={() => {
              if (!user) {
                setAuthMode('signup');
                setShowAuthModal(true);
              }
            }}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}