import { useState, useEffect } from 'react';
import { communityAPI } from '../services/api';
import {
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await communityAPI.getAll();
      setPosts(res.data.data.posts || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Community</h1>
          <p className="text-neutral-600 mt-1">Ask questions, share knowledge</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Ask Question
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..."
          className="input pl-12"
        />
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.post_id} className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button className="p-2 hover:bg-neutral-100 rounded-lg">
                    <HandThumbUpIcon className="w-5 h-5 text-neutral-400" />
                  </button>
                  <span className="text-sm font-medium text-neutral-600">{post.upvotes}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 text-lg">{post.title}</h3>
                  <p className="text-neutral-600 mt-2 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      {post.reply_count || 0} answers
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {post.views} views
                    </span>
                    <span className="badge badge-neutral">{post.subject_name || 'General'}</span>
                  </div>
                </div>
                <img
                  src={post.author_pic || `https://i.pravatar.cc/50?u=${post.user_id}`}
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No posts yet</h3>
          <p className="text-neutral-600">Be the first to ask a question!</p>
        </div>
      )}
    </div>
  );
}

export default CommunityPage;
