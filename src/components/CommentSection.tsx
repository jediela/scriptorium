import { Button, Textarea } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function CommentSection() {
    const router = useRouter();
    const { id } = router.query;
    const [newComment, setNewComment] = useState<string>('');
    const [disableSubmit, setDisableSubmit] = useState(true);

    useEffect(() => {
        if (newComment.trim()) {
        setDisableSubmit(false);
        } else {
        setDisableSubmit(true);
        }
    }, [newComment]);

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
    

  return (
    <form onSubmit={handleAddComment}>
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
  );
}
