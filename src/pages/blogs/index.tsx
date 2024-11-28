import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import { Button } from "@nextui-org/react";

interface Blog {
  id: number;
  title: string;
  content: string;
  voteCount: number;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchBy, setSearchBy] = useState<string>("title");
  const pageSize = 12;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    fetchBlogs(currentPage, searchQuery, searchBy);
  }, [currentPage, searchQuery, searchBy]);

  async function fetchBlogs(page: number, query: string, searchBy: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/blogs?page=${page}&pageSize=${pageSize}&${searchBy}=${query}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      const data = await res.json();
  
      if (res.ok) {
        setBlogs(data.blogsSortedByVote?.length ? data.blogsSortedByVote : []);
        setTotalPages(data.pagination?.totalBlogPages || 1);
      } else {
        setBlogs([]);
        setError(data.message || "Failed to fetch blogs");
      }
    } catch (error) {
      setBlogs([]);
      setError("Error fetching blogs: " + (error instanceof Error ? error.message : ""));
    } finally {
      setLoading(false);
    }
  }

  function handlePageChange(direction: "prev" | "next") {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Blogs</h1>
        <div className="flex flex-col sm:flex-row mb-6 justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full sm:w-1/2"
          />
          
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="ml-0 sm:ml-4 border px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            <option value="title">Title</option>
            <option value="tags">Tags</option>
            <option value="content">Content</option>
            <option value="codeTemplates">Code Templates</option>
          </select>

          {isLoggedin && (
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:ml-4 w-full sm:w-auto">
              <Link href="/blogs/create">
                <Button color="primary" className="w-full sm:w-auto">
                  Create Blog
                </Button>
              </Link>
              <Link href="/blogs/mine">
                <Button color="success" className="w-full sm:w-auto">
                  My Blogs
                </Button>
              </Link>
            </div>
          )}
        </div>
        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="border rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            >
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {blog.content.slice(0, 100)}...
              </p>
              <Link
                href={`/blogs/${blog.id}`}
                className="text-blue-500 hover:underline font-medium"
              >
                Read More
              </Link>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => handlePageChange("prev")}
            className={`px-4 py-2 mr-2 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700"
            }`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-lg font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            className={`px-4 py-2 ml-2 rounded-lg border ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed dark:bg-gray-700"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700"
            }`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}
