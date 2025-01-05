import React, { useState, useEffect } from 'react';
import PageTransition from '../components/shared/PageTransition';
import PostList from '../components/forum/PostList';
import CategoryFilter from '../components/forum/CategoryFilter';
import CreatePostButton from '../components/forum/CreatePostButton';
import CreatePostModal from '../components/forum/CreatePostModal';
import { Search } from 'lucide-react';
import { fetchCategories, fetchPosts } from '../lib/queries/forum';

export default function Forum() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPosts(selectedCategory, searchQuery);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Community Forum</h1>
          <CreatePostButton onClick={() => setIsCreateModalOpen(true)} />
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <PostList posts={posts} isLoading={isLoading} />

        {isCreateModalOpen && (
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            categories={categories}
          />
        )}
      </div>
    </PageTransition>
  );
}