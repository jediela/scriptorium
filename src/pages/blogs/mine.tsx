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

export default function Mine() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [myId, setMyId] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchBy, setSearchBy] = useState<string>("title");
  const pageSize = 12;

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if(storedId) setMyId(storedId);
  }, []);

  useEffect(() => {
    fetchBlogs(currentPage, searchQuery, searchBy);
  }, [currentPage, searchQuery, searchBy]);

  async function fetchBlogs(page: number, query: string, searchBy: string) {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `/api/blogs/mine?page=${page}&pageSize=${pageSize}&${searchBy}=${query}`,
        { 
            headers: {
                "Cache-Control": "no-cache",
                "Authorization": `Bearer ${token}`,
                }, 
            }
      );
      const data = await res.json();
  
      if (res.ok) {
        setBlogs(data.blogs?.length ? data.blogs : []);
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
        <h1 className="text-4xl font-bold mb-6 text-center">My Blogs</h1>
        {/* <div className="flex mb-6 justify-center items-center space-x-4">
            <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded-lg w-1/2"
            />
            <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="ml-4 border px-4 py-2 rounded-lg"
            >
            <option value="title">Title</option>
            <option value="tags">Tags</option>
            <option value="content">Content</option>
            <option value="codeTemplates">Code Templates</option>
            </select>
        </div> */}

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
