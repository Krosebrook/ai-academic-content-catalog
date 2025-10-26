import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import FFCard from '../education/shared/FFCard';
import FFButton from '../education/shared/FFButton';

// Dummy API functions for now
const getCommentsForContent = async (contentId: string) => {
    // In a real app, this would be a call to apiService
    console.log(`Fetching comments for ${contentId}`);
    return []; 
};
const addCommentToContent = async (contentId: string, text: string, userId: string, userEmail: string) => {
    console.log(`Adding comment to ${contentId}: ${text}`);
    return { id: Date.now().toString(), content_id: contentId, user_id: userId, user_email: userEmail, text, created_at: new Date().toISOString() };
};


interface CommentsSidebarProps {
  content: { id: string, title: string };
  onClose: () => void;
}

const CommentsSidebar: React.FC<CommentsSidebarProps> = ({ content, onClose }) => {
  const { session } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const fetchedComments = await getCommentsForContent(content.id);
      setComments(fetchedComments);
      setLoading(false);
    };
    fetchComments();
  }, [content.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    
    const addedComment = await addCommentToContent(content.id, newComment.trim(), session.user.id, session.user.email!);
    setComments(prev => [...prev, addedComment]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-ff-bg-dark border-l border-ff-surface z-40 transform transition-transform translate-x-0 ff-fade-in-up"
         style={{ boxShadow: 'var(--ff-shadow-soft)'}}>
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                 <h3 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-xl font-bold">Comments on "{content.title}"</h3>
                 <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loading && <p>Loading comments...</p>}
                {!loading && comments.length === 0 && <p className="text-ff-text-muted text-center py-8">No comments yet.</p>}
                {comments.map(comment => (
                    <div key={comment.id} className="bg-ff-surface p-3 rounded-lg">
                        <p className="text-sm font-semibold">{comment.user_email}</p>
                        <p className="text-ff-text-secondary mt-1">{comment.text}</p>
                    </div>
                ))}
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-ff-surface">
                <textarea 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"
                />
                <FFButton type="submit" className="w-full mt-2" disabled={!newComment.trim()}>Add Comment</FFButton>
            </form>
        </div>
    </div>
  );
};

export default CommentsSidebar;
