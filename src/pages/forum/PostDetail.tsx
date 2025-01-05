import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import PageTransition from '../../components/shared/PageTransition';
import { fetchPost, fetchComments, createComment } from '../../lib/queries/forum';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost();
      loadComments();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await fetchPost(id!);
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
    }
  };

  const loadComments = async () => {
    try {
      const data = await fetchComments(id!);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createComment(id!, newComment);
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
              <div className="text-sm text-gray-500 mt-2">
                Posted by {post.user.email} in {post.category.name}{' '}
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-500 hover:text-green-600">
                <ThumbsUp className="w-5 h-5 mr-1" />
                <span>{post.likes.length}</span>
              </button>
              <button className="flex items-center text-gray-500">
                <MessageSquare className="w-5 h-5 mr-1" />
                <span>{comments.length}</span>
              </button>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              required
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-500">
                    {comment.user.email} •{' '}
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </div>
                  <button className="flex items-center text-gray-500 hover:text-green-600">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    <span>{comment.likes.length}</span>
                  </button>
                </div>
                <p className="mt-2 text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}