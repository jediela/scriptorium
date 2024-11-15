import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { useState } from "react";

export default function Login(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return(
        <Layout>
        <div className="container mx-auto py-10">
          <h1 className="text-4xl font-bold text-center">Welcome to Scriptorium</h1>
          <p className="text-center mt-4 text-gray-600">
            Explore, write, and share code with others.
          </p>
        </div>
        <Button type="submit">Login</Button>
        <div></div>
        </Layout>
        
    );
}