import Layout from "@/components/Layout";
import ToggleTheme from "@/components/ToggleTheme";

export default function Index(){

  function handleToken(){
    const token = localStorage.getItem('token');
    console.log(token);
  };

  function logout(){
    const token = localStorage.getItem('token');
    localStorage.removeItem('token');
    window.location.reload();
  };

  async function login(){
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "test@email.com",
          password: "password"
        }),
      });
      const data = await response.json();
      const token = data.token;
      localStorage.setItem('token', token);
      window.location.reload();
  };


  return(
      <Layout>
        <div className="container mx-auto py-10">
          <h1 className="text-4xl font-bold text-center">Welcome to Scriptorium</h1>
          <p className="text-center mt-4 text-gray-600">
            Explore, write, and share code with others.
          </p>
        </div>

        <ToggleTheme/>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleToken}
        >
          Log Token
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={logout}
        >
          Log out
        </button>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={login}
        >
          Log in
        </button>

      </Layout>        
  );
}