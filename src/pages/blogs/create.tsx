import Layout from "@/components/Layout";
import { Button, Input, Select, SelectItem, SelectSection, Textarea } from "@nextui-org/react";
import { useTheme } from "next-themes";
import router from "next/router";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Create(){
    const {theme} = useTheme();
    const [title, setTitle] = useState('');
    const [titleError, setTitleError] = useState('');
    const [content, setContent] = useState('');
    const [contentError, setContentError] = useState('');
    const [codeTemplates, setCodeTemplates] = useState<{ id: number; title: string }[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState('');
    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [selectedTags, setSelectedTags] = useState('')
    const [touched, setTouched] = useState<{ title: boolean; content: boolean }>({ title: false, content: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token === null) router.push('/');
        else{
            fetchTags();
            fetchCodeTemplates();
        }
    }, []);

    async function fetchTags() {
        try {
            const response = await fetch('/api/tags', {
                method: "GET",
            });
            if (response.ok) {
                const data = await response.json();
                
                setTags(data);
            } 
            else {
                console.error("Failed to fetch tags");
            }
        } catch (error) {
            console.error("An error occurred while fetching tags:", error);
        }
    }

    async function fetchCodeTemplates() {
        try {
            const response = await fetch('/api/codeTemplates', {
                method: "GET",
            });
            const data = await response.json();
            if (response.ok) {
                const templates = data.templates.map((template: { id: number; title: string }) => ({
                    id: template.id,
                    title: template.title,
                }));
                setCodeTemplates(templates);
            } 
            else {
                console.error("Failed to fetch code templates");
            }
        } catch (error) {
            console.error("An error occurred while fetching code templates: ", error);
        }
    }

    function validateTitle(title: string){
        if(title === ""){
            setTitleError("Blog title is required");
            return false;
        }
        setTitleError("");
        return true;
    }

    function validateContent(content: string){
        if(content === ""){
            setContentError("Blog content is required");
            return false;
        }
        setContentError("");
        return true;
    }
    
    const titleValid = React.useMemo(() => validateTitle(title), [title]);
    const contentValid = React.useMemo(() => validateContent(content), [content]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const templates = selectedTemplates ? selectedTemplates.split(',').map(Number) : [];
        const blogTags = selectedTags ? selectedTags.split(',').map(Number) : [];        
        setTouched({ title: true, content: true });
        if(!titleValid || !contentValid){
            toast.error("Please enter the required fields");
            return;
        }
        try {
            const blogResponse = await fetch('/api/blogs',{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    codeTemplateIds: templates,
                    tagIds: blogTags,
                }),  
            });
            if(blogResponse.ok){
                toast.success("Blog Created!");
                const data = await blogResponse.json();
                const newBlogId = data.blog.id;
                setTimeout(() => {
                    router.push(`/blogs/${newBlogId}`);
                }, 1500);
            }
            else{
                toast.error('Failed to create blog');
            }
        } catch (error) {
            toast.error('An error occurred, please try again.');
        }
    }

    return(
        <Layout>
            <form
                onSubmit={handleSubmit}
                className={`w-full max-w-4xl p-10 shadow-md rounded-lg flex flex-col items-left gap-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            >  
                <h2 className={`text-4xl font-semibold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Create Blog 
                </h2>
                <Input 
                    isRequired
                    labelPlacement="outside"
                    label={<span className="font-bold text-lg">Blog Title</span>}                    
                    size="lg" 
                    variant="bordered"
                    type="text" 
                    placeholder="The title of your amazing blog!" 
                    isInvalid={touched.title && !titleValid}
                    color={touched.title && !titleValid ? 'danger' : 'default'}
                    errorMessage={touched.title ? titleError : ''}
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (!touched.title) setTouched((prev) => ({ ...prev, title: true }));
                    }}
                />
                
                <Textarea
                    isRequired
                    labelPlacement="outside"
                    label={<span className="font-bold text-lg">Blog Content</span>}                    
                    variant="bordered"
                    placeholder="The contents of the amazing blog"
                    description={<span className="italic">Blog your thoughts!</span>} 
                    className="max-w-4xl"
                    minRows={10}
                    maxRows={30}
                    isInvalid={touched.content && !contentValid}
                    color={touched.content && !contentValid ? 'danger' : 'default'}
                    errorMessage={touched.content ? contentError : ''}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        if (!touched.content) setTouched((prev) => ({ ...prev, content: true }));
                    }}
                />
                    
                <span className="font-bold text-lg -mb-5">Tags</span>
                <Select
                    items={tags}
                    variant="bordered"
                    placeholder="Select tags related to your blog"
                    selectionMode="multiple"
                    className="max-w-sm"
                    onChange={(e) => {
                        setSelectedTags(e.target.value);
                    }}
                >
                    <SelectSection className="bg-gray-200 border-gray-500 text-black dark:bg-gray-700 dark:text-white rounded-md p-2 border-2 dark:border-white">
                        {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id} className="cursor-pointer rounded-md px-2 py-1 hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                            {tag.name}
                        </SelectItem>
                        ))}
                    </SelectSection>
                </Select>

                <span className="font-bold text-lg -mb-5">Related Code Templates</span>
                <Select
                    items={codeTemplates}
                    variant="bordered"
                    placeholder="Select a code template"
                    selectionMode="multiple"
                    className="max-w-sm"
                    onChange={(e) => {
                        setSelectedTemplates(e.target.value);
                    }}
                >
                    <SelectSection className="bg-gray-200 text-black dark:bg-gray-800 dark:text-white rounded-md p-2 border-2 dark:border-white">
                    {codeTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id} className="cursor-pointer rounded-md px-2 py-1 hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                            {template.title}
                        </SelectItem>
                    ))}
                    </SelectSection>
                </Select>

                <div className="flex gap-4">
                    <Button type="submit" color="primary" size="lg">Create Blog</Button>
                </div>
            </form>
        </Layout>
    );
}