import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    commentId: number | null;
    onReport: (commentId: number, reportReason: string) => void;
  }
  
  export function ReportModal({ isOpen, onClose, commentId, onReport }: ReportModalProps) {
  const [reportReason, setReportReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [reportError, setReportError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setReportReason('');
    setTouched(false);
    setReportError('');
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) {
      setReportError('Reason for reporting is required');
      return;
    }

    if (commentId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/comments/${id}/report`,{
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                commentId,
                reason: reportReason
            }),  
        });        toast.success('Comment reported');
        onClose();
      } catch (error) {
        console.error(error);
        toast.error('Failed to report the comment');
      }
    }
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}
    >
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Report Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Reason for report</label>
            <textarea
              className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touched && !reportReason.trim() ? 'border-red-500' : ''
              }`}
              value={reportReason}
              onChange={(e) => {
                setReportReason(e.target.value);
                setTouched(true);
                setReportError('');
              }}
              rows={4}
              placeholder="Reason for reporting this comment"
            />
            {touched && !reportReason.trim() && (
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
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
