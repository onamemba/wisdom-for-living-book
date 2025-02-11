import React from 'react';
import { BookCard } from '../components/BookCard';
import { books } from '../data/books';

export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Wisdom for Living
        </h1>
        <p className="text-base text-gray-600">
          Monthly spiritual guidance by Pastor Justin Chiwala
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>
    </div>
  );
}