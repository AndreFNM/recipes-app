"use client";

import React, { useEffect, useState } from "react";

type Comment = {
  id: number;
  username: string;
  comment: string;
  created_at: string;
};

export default function CommentsList({ recipeId }: { recipeId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/recipeDetails/${recipeId}/comments/index`);
        if (!response.ok) throw new Error("Failed to fetch comments");

        const data: Comment[] = await response.json();
        setComments(data);
      } catch (err) {
        console.error("Error loading comments:", err);
        setError("Error loading comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId]);

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (comments.length === 0) return <p>No comments yet. Be the first to comment!</p>;

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      {comments.map((comment) => (
        <div key={comment.id} className="border-b py-3">
          <p className="font-semibold">{comment.username}</p>
          <p>{comment.comment}</p>
          <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
