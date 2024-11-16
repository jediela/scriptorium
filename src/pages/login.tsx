import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InputField from "@/components/InputField";
import SubmitButton from '@/components/SubmitButton';
import PlainLayout from '@/components/PlainLayout';
import { Slide, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  // Redirect to homepage if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);
  
  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Invalid credentials');  // Show error toast
        return;
      }

      const data = await response.json();
      const token = data.token;

      // Store token in localStorage as 'token'
      localStorage.setItem('token', token);
      
      toast.success('Login successful! Redirecting...',); 

      // Delay redirect to show message
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      toast.error('An error occurred, please try again.');
    }
  }

  return (
    <PlainLayout>
      <ToastContainer position='top-center' autoClose={2000} transition={Slide}/>
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-black">Login</h2>

        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <SubmitButton/>
      </form>      
    </PlainLayout>
  );
}