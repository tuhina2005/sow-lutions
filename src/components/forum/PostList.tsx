import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user: {
    email: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
  category: {
    name: string;
    slug: string;
  };
}

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
}

export default function PostList({ posts, isLoading }: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/forum/post/${post.id}`}
          className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 hover:text-green-600">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Posted by {post.user.email} in {post.category.name}
              </p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>

          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-gray-500">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span className="text-sm">{post._count.likes}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="text-sm">{post._count.comments}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}