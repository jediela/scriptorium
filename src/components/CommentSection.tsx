import { Button, Textarea, Tooltip, Image, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { Vote } from "@prisma/client";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import ReportModal from "./ReportModal";
import ReplyModal from "./ReplyModal";
import Replies from "./Replies";

export default function CommentSection() {
    const router = useRouter();
    const { id } = router.query;
    const UPVOTE_ICON = "/icons/upvote.svg";
    const DOWNVOTE_ICON = "/icons/downvote.svg";
    const UPVOTE_FILLED = "/icons/upvote-filled.svg";
    const DOWNVOTE_FILLED = "/icons/downvote-filled.svg";
    const [newComment, setNewComment] = useState<string>('');
    const [disableSubmit, setDisableSubmit] = useState(true);
    const [comments, setComments] = useState<any[]>([]);
    const [userVoteValue, setUserVoteValue] = useState(0);
    const [upvoteIcon, setUpvoteIcon] = useState(UPVOTE_ICON);
    const [downvoteIcon, setDownvoteIcon] = useState(DOWNVOTE_ICON);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [reportError, setReportError] = useState('');
    const [report, setReport] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [currentCommentId, setCurrentCommentId] = useState<number | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        if (newComment.trim()) {
        setDisableSubmit(false);
        } else {
        setDisableSubmit(true);
        }
    }, [newComment]);

    useEffect(() => {
        if (votes.length > 0 && comments.length > 0) {
            checkExistingCommentVote();
        }
    }, [votes, comments]);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) setLoggedIn(true);
        if (id) {
            fetchComments();
        }
    }, [id]);

    useEffect(() => {
        if (userVoteValue === 1) {
            setUpvoteIcon(UPVOTE_FILLED);
            setDownvoteIcon(DOWNVOTE_ICON);
        } else if (userVoteValue === -1) {
            setDownvoteIcon(DOWNVOTE_FILLED);
            setUpvoteIcon(UPVOTE_ICON);
        } else {
            setUpvoteIcon(UPVOTE_ICON);
            setDownvoteIcon(DOWNVOTE_ICON);
        }
    }, [userVoteValue]);    

    const handleNewReply = () => {
        fetchComments();
        setIsModalOpen(false);
    };

    async function processVote(commentId: number, voteValue: number) {
        await fetch(`/api/comments/${commentId}/vote`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                commentId: Number(commentId),
                voteValue,
            }),
        });
        setUserVoteValue(voteValue);
        setComments((prevComments) =>
            prevComments.map((comment) =>
                comment.id === commentId ? { ...comment, voteValue } : comment
            )
        );
    }    

    function checkExistingCommentVote() {
        const commentId = Number(id);
        const userId = Number(localStorage.getItem('userId'));
        const existingVote = votes.find(
            (vote) => vote.userId === userId && vote.commentId === commentId
        );
    
        if (existingVote) {
            setUserVoteValue(existingVote.value);
            if (existingVote.value === 1) {
                setUpvoteIcon(UPVOTE_FILLED);
                setDownvoteIcon(DOWNVOTE_ICON);
            } else if (existingVote.value === -1) {
                setDownvoteIcon(DOWNVOTE_FILLED);
                setUpvoteIcon(UPVOTE_ICON);
            }
        } else {
            setUserVoteValue(0);
            setUpvoteIcon(UPVOTE_ICON);
            setDownvoteIcon(DOWNVOTE_ICON);
        }
    }
    
async function upvoteComment(commentId: number) {
    try {
        const comment = comments.find((c) => c.id === commentId);
        if (comment.voteValue === 1) {
            await deleteVote(commentId);
            setComments((prevComments) =>
                prevComments.map((c) =>
                    c.id === commentId ? { ...c, voteValue: 0 } : c
                )
            );
            toast.info("Upvote removed.");
        } else {
            await processVote(commentId, 1);
            setComments((prevComments) =>
                prevComments.map((c) =>
                    c.id === commentId ? { ...c, voteValue: 1 } : c
                )
            );
            toast.success("Comment upvoted.");
        }
    } catch (error) {
        console.error(error);
        toast.error("An error occurred while voting. Please try again.");
    }
}

    
    async function downvoteComment(commentId: number) {
        try {
            const comment = comments.find((c) => c.id === commentId);
            if (comment.voteValue === -1) {
                await deleteVote(commentId);
                setComments((prevComments) =>
                    prevComments.map((c) =>
                        c.id === commentId ? { ...c, voteValue: 0 } : c
                    )
                );
                toast.info("Downvote removed.");
            } else {
                await processVote(commentId, -1);
                setComments((prevComments) =>
                    prevComments.map((c) =>
                        c.id === commentId ? { ...c, voteValue: -1 } : c
                    )
                );
                toast.success("Comment downvoted.");
            }
        } catch (error) {
            toast.error("An error occurred while voting. Please try again.");
        }
    }
    
    async function deleteVote(commentId: number) {
        try {
            await fetch(`/api/comments/${commentId}/vote`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
    
            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === commentId ? { ...comment, voteValue: 0 } : comment
                )
            );
        } catch (error) {
            console.error("Failed to delete vote", error);
            toast.error("An error occurred while deleting the vote.");
        }
    }    

    const reportValid = useMemo(() => {
        if (report === "") {
            setReportError("Reason for report is required");
            return false;
        }
        setReportError("");
        return true;
    }, [report]);
    
    async function handleAddComment(e: React.FormEvent) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (newComment.trim()) {
            try {
                setDisableSubmit(true);
                const response = await fetch(`/api/comments`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: newComment,
                        blogId: Number(id),
                    }),
                });
                if (response.ok) {
                    toast.info("Comment added");
                    setNewComment('');
                    fetchComments();
                } else {
                    const error = await response.json();
                    toast.error(error);
                }
            } catch (error) {
                console.error("Error creating comment");
            } finally {
                setDisableSubmit(false);
            }
        } else {
            toast.error("Comment cannot be empty");
        }
    }
    
    async function fetchComments() {
        try {
            const response = await fetch(`/api/blogs/${id}/view`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                
                const commentsWithVotes = data.comments.map((comment: any) => ({
                    ...comment,
                    voteValue: 0,
                    authorEmail: comment.user.email,
                }));
                setComments(commentsWithVotes);
            } else {
                toast.error("Error fetching comments");
            }
        } catch (error) {
            toast.error("Error fetching comments");
        }
    }
    

    return (
        <div>
            <div className="space-y-5">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow-md"
                        >
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-gray-700 dark:text-gray-200">
                                    {comment.content}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-300">
                                    {comment.authorEmail}
                                </span>
                            </div>
                            {loggedIn && (
                                <div className="mt-2 flex space-x-4 pb-5">
                                    <Button
                                        size="sm"
                                        color="secondary"
                                        className="hover:bg-gray-200 dark:hover:bg-gray-600"
                                        onClick={() => {
                                            setCurrentCommentId(comment.id);
                                            setIsReplyModalOpen(true);
                                        }}
                                    >
                                        Reply
                                    </Button>
                                    
                                    <div className="flex space-x-1">
                                        <Tooltip
                                            size="sm"
                                            content="Upvote Comment"
                                            showArrow={true}
                                            delay={0}
                                            closeDelay={0}
                                            color="success"
                                            className="text-white rounded-md p-2 shadow-lg"
                                        >
                                            <Image
                                                width={35}
                                                src={comment.voteValue === 1 ? UPVOTE_FILLED : UPVOTE_ICON}
                                                className="opacity-100"
                                                alt="Upvote Icon"
                                                onClick={() => upvoteComment(comment.id)}
                                            />
                                        </Tooltip>
                                        <Tooltip
                                            size="sm"
                                            content="Downvote Comment"
                                            showArrow={true}
                                            delay={0}
                                            closeDelay={0}
                                            color="danger"
                                            className="text-white rounded-md p-2 shadow-lg"
                                        >
                                            <Image
                                                width={35}
                                                src={comment.voteValue === -1 ? DOWNVOTE_FILLED : DOWNVOTE_ICON}
                                                className="opacity-100"
                                                alt="Downvote Icon"
                                                onClick={() => downvoteComment(comment.id)}
                                            />
                                        </Tooltip>
                                    </div>
                                        {/* <h1 className="ml-2 text-2xl font-bold">{comment.voteValue}</h1> */}
                                        <Button
                                            size="sm"
                                            color="danger"
                                            className="hover:bg-gray-200 dark:hover:bg-gray-600"
                                            onClick={() => {
                                                setCurrentCommentId(comment.id);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Report
                                        </Button>
                                </div>
                            )}
                            <Replies commentId={comment.id} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                )}
            </div>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                commentId={currentCommentId}
            />

            <ReplyModal
                isOpen={isReplyModalOpen}
                onClose={() => setIsReplyModalOpen(false)}
                commentId={currentCommentId}
                onReplySubmit={handleNewReply} 
            />

            {loggedIn && (
                <form className="pt-7" onSubmit={handleAddComment}>
                    <Textarea
                        label="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />

                    <Button
                        type="submit"
                        size="sm"
                        color="primary"
                        isDisabled={disableSubmit}
                    >
                        Post Comment
                    </Button>
                </form>
            )}

        </div>

    );
}
