import React from 'react';
import PlainLayout from '@/components/PlainLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import {Input} from "@nextui-org/input";
import {EyeFilledIcon} from "public/tools/EyeFilledIcon";
import {EyeSlashFilledIcon} from "public/tools/EyeSlashFilledIcon";
import { Button, Link } from '@nextui-org/react';
import { useTheme } from 'next-themes';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = React.useState(false);
  const { theme } = useTheme(); 
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

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
        toast.error(errorData.message || 'Invalid credentials');
        return;
      }
      
      // Store token and user data in localStorage
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
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
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-sm p-6 shadow-md rounded-lg flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
      >
        <h2 className={`text-3xl font-semibold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Login
        </h2>

        <Input
          value={email}
          type="text"
          label="Email"
          variant="bordered"
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-xs"
          size='lg'
        />

        <Input
          label="Password"
          variant="bordered"
          endContent={
            <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
          className="max-w-xs"
          size='lg'
        />

        <Button color="primary" size='lg' type='submit'>
          Login
        </Button>
        <p>Don&apos;t have an account? <Link underline="always" href="/auth/signup">Sign up here</Link> </p>        
      </form>
    </PlainLayout>
  );
}