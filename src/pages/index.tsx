import HomeLayout from "@/components/HomeLayout";
import Link from "next/link";

export default function Index() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">

        <div className="max-w-7xl mx-auto text-center px-4 py-10 dark:bg-black bg-gray-100">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 dark:text-white">
            Welcome to Scriptorium
          </h1>
          <p className="text-lg text-gray-800 mb-6 dark:text-gray-400">
            A platform to share knowledge, execute code, and collaborate on projects.
          </p>
        </div>

        <section className="py-10 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-12">
              Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Create and Share Blogs
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Share your thoughts, document your journey, and inspire others by creating and publishing engaging blogs.
                </p>
                <Link href="/blogs" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg">
                    Explore Blogs
                </Link>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Execute Code
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Write, execute, and test your code directly on the platform. No setup required.
                </p>
                <Link href="/code-execution" className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg">
                    Start Coding
                </Link>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Create Code Templates
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create reusable code templates and share them with the community. Make coding faster and more efficient.
                </p>
                <Link href="/code-templates" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg">
                    Explore Templates
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
}
