import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Layout from "@/components/Layout";
import { Button, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import Link from "next/link";
import { useTheme } from "next-themes";

interface Report {
    id: number;
    reason: string;
    createdAt: string;
    userId: number;
    blogPostId: number;
    commentId: number | null;
}
  
interface ReportedBlog {
    id: number;
    title: string;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
    reports: Report[];
}

interface ReportedComment {
    id: number;
    content: string;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
    reports: Report[];
}

export default function Admin() {
    const { theme } = useTheme();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const [reportedComments, setReportedComments] = useState<ReportedComment[]>([]);
    const [reportedBlogs, setReportedBlogs] = useState<ReportedBlog[]>([]);
    const blogColumns = [
        { key: "id", label: "Blog ID" },
        { key: "title", label: "Title" },
        { key: "userId", label: "User ID" },
        { key: "reportCount", label: "Number of Reports" },
        { key: "status", label: "Status" },
    ];

    const commentColumns = [
        { key: "id", label: "Comment ID" },
        { key: "userId", label: "User ID" },
        { key: "content", label: "Comment" },
        { key: "reportCount", label: "Number of Reports" },
        { key: "status", label: "Status" },
        { key: "Hide", label: "Hide"}
    ];

    async function fetchUser(token: string) {
        try {
            const response = await fetch('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    toast.error("Unauthorized access");
                    setTimeout(() => {
                        router.back();
                    }, 1000);                
                }
            } else {
                throw new Error("Failed to fetch user data");
            }
        } catch (error) {
            setIsAdmin(false);
            router.replace("/");
        }
    }

    async function hideComment(commentId: number) {
        try {
            const response = await fetch(`/api/comments/${commentId}`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    isHidden: true
                }),  
            })
            if(response.ok) {
                toast.success("Comment Hidden");
                fetchContent(localStorage.getItem('token') || "")
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function unhideComment(commentId: number) {
        try {
            const response = await fetch(`/api/comments/${commentId}`,{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    isHidden: false
                }),  
            })
            if(response.ok) {
                toast.success("Comment unhidden");
                fetchContent(localStorage.getItem('token') || "");
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchContent(token: string) {
        try {
            const response = await fetch('/api/admin', {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            if(response.ok){
                const data = await response.json();
                setReportedBlogs(data.reportedBlogs);
                setReportedComments(data.reportedComments);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error("Failed to load reported content");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Unauthorized access");
            setTimeout(() => {
                router.back();
            }, 1000);
            return;
        }
        fetchUser(token);
        fetchContent(token);
    }, []);

    const clickBlog = (id:number) => {
        router.push(`/blogs/${id}`);
    };

    if (isAdmin === null || isAdmin === false || isLoading) {
        return (
            <Layout>
                <div className="flex items-center py-20 justify-center">
                    <Spinner size="lg" color="secondary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div
                className={`py-6 px-4 rounded-lg shadow-md mb-8 ${
                    theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-600 via-gray-800 to-black text-gray-200'
                        : 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-800'
                }`}
            >
                <h1
                    className={`text-5xl font-bold mb-2 text-center ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}
                >
                    Admin Page
                </h1>
            </div>

            <h2 className={`text-4xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Reported Blogs </h2>
            <Table
                aria-label="Reported Blogs Table"
                className="border rounded-md shadow-md w-full"
            >
                <TableHeader>
                    {blogColumns.map((column) => (
                    <TableColumn key={column.key} className="text-center">
                        {column.label}
                    </TableColumn>
                    ))}
                </TableHeader>
                <TableBody emptyContent="No reported blogs available">
                    {reportedBlogs.map((blog) => (
                    <TableRow key={blog.id} className="text-center">
                        {blogColumns.map((column) => (
                        <TableCell key={column.key} className="text-center" style={{ zIndex: 1 }}>
                            {column.key === "id" ? (
                                <Button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => clickBlog(blog.id)}
                                >
                                    {blog.id}
                                </Button>
                            ) : column.key === "reportCount" ? (
                            blog.reports.length
                            ) : column.key === "status" ? (
                            <span className={blog.isHidden ? "text-danger" : "text-success"}>
                                {blog.isHidden ? "Hidden" : "Viewable"}
                            </span>
                            ) : (
                            String(blog[column.key as keyof ReportedBlog])
                            )}
                        </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
            </Table>

            <h2 className={`text-4xl font-semibold mt-8 mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Reported Comments </h2>
            <Table aria-label="Reported Comments Table" className="border rounded-md shadow-md w-full">
                <TableHeader>
                    {commentColumns.map((column) => (
                        <TableColumn key={column.key} className="text-center">
                            {column.label}
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody emptyContent="No reported comments available">
                    {reportedComments.map((comment) => (
                        <TableRow key={comment.id}>
                            {commentColumns.map((column) => (
                                <TableCell key={column.key} className="text-center">
                                    {column.key === "id" ? (
                                        <Link className="text-blue-500 hover:underline" href={`/comments/${comment.id}`}>
                                            {comment.id}
                                        </Link>
                                    ) : column.key === "reportCount" ? (
                                        comment.reports.length
                                    ) : column.key === "status" ? (
                                        <span className={comment.isHidden ? "text-danger" : "text-success"}>
                                            {comment.isHidden ? "Hidden" : "Viewable"}
                                        </span>
                                    ) : column.key === "Hide" ? (
                                        comment.isHidden ? (
                                            <Button
                                                className="bg-warning hover:bg-warning-dark text-white"
                                                onClick={() => unhideComment(comment.id)}
                                            >
                                                Unhide
                                            </Button>
                                        ) : (
                                            <Button
                                                className="bg-secondary hover:bg-secondary-dark text-white"
                                                onClick={() => hideComment(comment.id)}
                                            >
                                                Hide
                                            </Button>
                                        )
                                    ) : (
                                        String(comment[column.key as keyof ReportedComment])
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Layout>
    );
}
