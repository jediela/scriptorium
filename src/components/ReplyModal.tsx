import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    commentId: number | null;
}

export default function ReplyModal({ isOpen, onClose, commentId, }: ReplyModalProps){
    const [replyContent, setReplyContent] = useState('');
    const [touched, setTouched] = useState(false);
    const [reportError, setReportError] = useState('');
    
    useEffect(() => {
        setReplyContent('');
        setTouched(false);
        setReportError('');
    }, [isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!replyContent.trim()) {
          setReportError('Content for reply is required');
          return;
        }
    
        if (commentId) {
          try {
            const token = localStorage.getItem('token');
            await fetch(`/api/comments`,{
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: replyContent,
                    commentId
                }),  
            });        
            toast.success('Reply processed');
            onClose();
          } catch (error) {
            console.error(error);
            toast.error('Failed to reply to the comment');
          }
        }
    }

    return (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}
        >
          <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Reply to Comment</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Enter your reply</label>
                <textarea
                  className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    touched && !replyContent.trim() ? 'border-red-500' : ''
                  }`}
                  value={replyContent}
                  onChange={(e) => {
                    setReplyContent(e.target.value);
                    setTouched(true);
                    setReportError('');
                  }}
                  rows={4}
                  placeholder="Your reply to the comment here"
                />
                {touched && !replyContent.trim() && (
                  <p className="text-sm text-red-500">{reportError}</p>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-700"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
                >
                    Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      );
}