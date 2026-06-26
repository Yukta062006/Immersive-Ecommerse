'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductReview } from '@/types/product';
import RatingStars from '@/components/ui/RatingStars';

interface ReviewsSectionProps {
  reviews: ProductReview[];
  averageRating: number;
  reviewCount: number;
  onAddReview?: (review: { rating: number; title: string; comment: string }) => void;
}

export default function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
  onAddReview,
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const sortedReviews = [...reviews]
    .filter((r) => !ratingFilter || r.rating === ratingFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  const handleSubmit = () => {
    if (formRating === 0 || !formTitle.trim() || !formComment.trim()) return;
    onAddReview?.({ rating: formRating, title: formTitle, comment: formComment });
    setFormRating(0);
    setFormTitle('');
    setFormComment('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Reviews</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 dark:bg-zinc-800 rounded-xl">
        <div className="text-center sm:text-left">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating.toFixed(1)}</div>
          <RatingStars rating={averageRating} size="md" animated={false} className="mt-1" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reviewCount} reviews</p>
        </div>

        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map((item) => (
            <button
              key={item.rating}
              onClick={() => setRatingFilter(ratingFilter === item.rating ? null : item.rating)}
              className="flex items-center gap-2 w-full group"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400 w-3">{item.rating}</span>
              <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Write Your Review</h3>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormRating(star)}
                    >
                      <svg
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || formRating) ? 'text-yellow-400' : 'text-gray-300 dark:text-zinc-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review</label>
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={formRating === 0 || !formTitle.trim() || !formComment.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          {(['newest', 'highest', 'lowest'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`text-sm capitalize ${
                sortBy === option ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
          {ratingFilter && (
            <button
              onClick={() => setRatingFilter(null)}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {ratingFilter ? 'No reviews with this rating.' : 'No reviews yet. Be the first to review!'}
          </p>
        ) : (
          sortedReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-gray-100 dark:border-zinc-800 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-semibold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{review.userName}</span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <RatingStars rating={review.rating} size="sm" animated={false} />
              </div>
              <div className="mt-3">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{review.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{review.comment}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
