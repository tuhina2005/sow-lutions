import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase.ts'; // Ensure to import supabase

interface PostCardProps {
  id: string; // Add post id for the like functionality
  title: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
  tags: string[];
  userId: string; // Add userId to track the user who liked
}

export default function PostCard({
  id,
  title,
  author,
  content,
  likes,
  comments,
  createdAt,
  tags,
  userId
}: PostCardProps) {
  const [likeCount, setLikeCount] = useState(likes); // Track like count locally
  const [isLiked, setIsLiked] = useState(false); // Track if the user has already liked the post

  // Function to handle the like button click
  const likePost = async () => {
    try {
      // Check if the user has already liked the post
      const { data, error } = await supabase
        .from('forum_likes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // if (data.length > 0) {
      //   // If the post is already liked, remove the like
      //   await supabase
      //     .from('forum_likes')
      //     .delete()
      //     .eq('post_id', id)
      //     .eq('user_id', userId);
      //   setIsLiked(false); // Update the state to reflect the unlike action
      //   setLikeCount(likeCount - 1); // Decrease like count
      // } else {
        // If not liked, add the like
        await supabase
          .from('forum_likes')
          .insert({
            post_id: id,
            user_id: userId
          });
        setIsLiked(true); // Update the state to reflect the like action
        setLikeCount(likeCount + 1); // Increase like count
      // }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600">{title}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {formatDistanceToNow(createdAt, { addSuffix: true })}
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{content}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600">By {author}</span>
        <div className="flex items-center space-x-4">
          <button
            onClick={likePost}
            className="flex items-center text-gray-500 hover:text-green-600"
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span className="text-sm">{likeCount}</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-green-600">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span className="text-sm">{comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
