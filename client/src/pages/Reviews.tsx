import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

export default function Reviews() {
  const [, setLocation] = useLocation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: myReview } = trpc.reviews.getMyReview.useQuery();
  const { data: approvedReviews = [] } = trpc.reviews.getApprovedReviews.useQuery();
  const submitReview = trpc.reviews.submitReview.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    try {
      await submitReview.mutateAsync({ rating, comment });
      toast.success("Review submitted! It will be visible after approval.");
      setComment("");
      setRating(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setLocation("/")}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">Reviews</h1>
        </div>

        {/* Submit Review Form */}
        {!myReview && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Leave a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-white mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-white mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  required
                  minLength={10}
                  maxLength={500}
                />
                <p className="text-sm text-gray-400 mt-1">
                  {comment.length}/500 characters (min 10)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitReview.isPending || comment.length < 10}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {/* User's Existing Review */}
        {myReview && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Review</h2>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= myReview.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }`}
                />
              ))}
            </div>
            <p className="text-white mb-2">{myReview.comment}</p>
            <p className="text-sm text-gray-400">
              Status:{" "}
              <span
                className={
                  myReview.isApproved ? "text-green-400" : "text-yellow-400"
                }
              >
                {myReview.isApproved ? "Approved" : "Pending Approval"}
              </span>
            </p>
          </div>
        )}

        {/* Approved Reviews */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">What Players Say</h2>
          {approvedReviews.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <p className="text-gray-400">No reviews yet. Be the first!</p>
            </div>
          ) : (
            approvedReviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{review.username}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-white">{review.comment}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
