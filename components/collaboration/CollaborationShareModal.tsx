import React, { useState } from 'react';
import FFCard from '../education/shared/FFCard';
import FFButton from '../education/shared/FFButton';
import { PermissionLevel } from '../../types/education';

// Dummy API function
const shareContentWithUser = async (contentId: string, email: string, permission: PermissionLevel) => {
    console.log(`Sharing content ${contentId} with ${email} as ${permission}`);
    // This would call the apiService in a real app
    return { success: true };
};


interface CollaborationShareModalProps {
  content: { id: string, title: string };
  onClose: () => void;
}

const CollaborationShareModal: React.FC<CollaborationShareModalProps> = ({ content, onClose }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<PermissionLevel>('viewer');
    const [message, setMessage] = useState('');

    const handleShare = async () => {
        setMessage('');
        if (!email) return;
        const result = await shareContentWithUser(content.id, email, permission);
        if (result.success) {
            setMessage(`Successfully shared with ${email}!`);
            setEmail('');
        } else {
            setMessage('Failed to share. Please try again.');
        }
    };

    return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 ff-fade-in-up"
      onClick={onClose} role="dialog" aria-modal="true" >
      <FFCard className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
            <h2 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' }}>
              Collaborate on "{content.title}"
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <p className="text-ff-text-secondary mb-4">Invite others to view or edit this content with you.</p>
        
        <div className="flex gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter collaborator's email" className="w-full bg-ff-surface p-2 rounded-md border border-slate-600"/>
            <select value={permission} onChange={e => setPermission(e.target.value as PermissionLevel)} className="bg-ff-surface p-2 rounded-md border border-slate-600">
                <option value="viewer">Can View</option>
                <option value="editor">Can Edit</option>
            </select>
        </div>
        <FFButton onClick={handleShare} className="w-full mt-4">Send Invite</FFButton>
        {message && <p className="text-center text-sm mt-4 text-green-400">{message}</p>}
      </FFCard>
    </div>
  );
};

export default CollaborationShareModal;
