import { Button, Tooltip } from "@nextui-org/react";
import { useState, useEffect } from "react";
import ReportModal from "./ReportModal";
import { Image } from "@nextui-org/react";
import { toast } from "react-toastify";

export default function Replies({ commentId }: { commentId: number }) {
    const [replies, setReplies] = useState<{id: number;content: string;user: { id: number; email: string };createdAt: string;}[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
    const UPVOTE_ICON = "/icons/upvote.svg";
    const DOWNVOTE_ICON = "/icons/downvote.svg";
    const UPVOTE_FILLED = "/icons/upvote-filled.svg";
    const DOWNVOTE_FILLED = "/icons/downvote-filled.svg";
    const [upvoteIcon, setUpvoteIcon] = useState(UPVOTE_ICON);
    const [downvoteIcon, setDownvoteIcon] = useState(DOWNVOTE_ICON);
    const [userVoteValue, setUserVoteValue] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);  
    
    const openModal = (commentId: number) => {
        setSelectedCommentId(commentId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCommentId(null);
    };

    useEffect(() => {
        async function fetchReplies() {
        try {
            const res = await fetch(`/api/comments/${commentId}/replies`);
            if (!res.ok) throw new Error("Failed to fetch replies");
            const data = await res.json();
            setReplies(data.replies || []);
        } catch (error) {
            console.error("Error fetching replies:", error);
        }
        }
        fetchReplies();
    }, [commentId]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) setLoggedIn(true);
    }, []);

    async function upvote(replyId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/comments/${replyId}/vote`,{
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentId: replyId,
                    voteValue: 1
                }),  
            });
            if(response.ok){
                toast.success("Reply upvoted!");
                setUserVoteValue(1);
            } 
        } catch (error) {
            console.error(error);
        }    
    }

    async function downvote(replyId: number) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/comments/${replyId}/vote`,{
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commentId: replyId,
                    voteValue: -1
                }),  
            });
            if(response.ok){
                toast.success("Reply downvoted");
                setUserVoteValue(-1);
            } 
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="ml-5 border-l-2 pl-4 pb-2">
            <h4 className="text-xl font-semibold">Replies</h4>
            {replies.length > 0 ? (
                replies.map((reply) => (
                    <div key={reply.id} className="mb-3 pl-1 pt-2 flex justify-between">
                        <p className="font-medium text-md">
                            <strong>{reply.user.email}</strong>:     
                            <span className="pl-1">{reply.content}</span>
                        </p>
                        {loggedIn && (
                        <div className="flex ml-auto">
                            <Tooltip content="Upvote reply" delay={0} closeDelay={0} color="success" className="text-white rounded-md p-2 shadow-lg">
                                <Image className="opacity-100" width={30} src={upvoteIcon} onClick={() => upvote(reply.id)}/>
                            </Tooltip>
                            <Tooltip content="Downvote reply" delay={0} closeDelay={0} color="danger" className="text-white rounded-md p-2 shadow-lg">
                                <Image className="opacity-100" width={30} src={downvoteIcon} onClick={() => downvote(reply.id)}/>
                            </Tooltip>
                            <Button size="sm" onClick={() => openModal(reply.id)}>Report</Button>
                        </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No replies yet.</p>
            )}

            <ReportModal
                isOpen={isModalOpen}
                onClose={closeModal}
                commentId={selectedCommentId}
            />

        </div>
    );
}
