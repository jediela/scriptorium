import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input, Textarea, Spinner } from '@nextui-org/react';
import { Editor } from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/Layout';
import { useTheme } from 'next-themes';

const ForkTemplate = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    title: '',
    explanation: '',
    code: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState<string>('');
  const [language, setLanguage] = useState<string>('plaintext');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchOriginalTemplate();
    }
  }, [id]);

  const fetchOriginalTemplate = async () => {
    try {
      const response = await fetch(`/api/codeTemplates/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: `Fork of ${data.title}`,
          explanation: data.explanation || '',
          code: data.code,
          tags: data.tags.map((tag: { name: any; }) => tag.name),
        });
        setTagInput(data.tags.map((tag: { name: any; }) => tag.name).join(', '));
        setLanguage(data.language || 'plaintext');
      } else {
        toast.error('Failed to fetch the template to fork');
        router.push('/code-templates');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while fetching the template to fork');
      router.push('/code-templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForkTemplate = async () => {
    if (!formData.title || !formData.code) {
      toast.error('Title and code are required');
      return;
    }

    try {
      const response = await fetch(`/api/codeTemplates/${id}/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          isFork: true,
          forkedFromId: id,
        }),
      });
      if (response.ok) {
        toast.success('Template forked successfully');
        router.push('/code-templates');
      } else {
        toast.error('Failed to fork template');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while forking the template');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Fork Template</h1>
        <Input
          label="Title"
          placeholder="Enter template title"
          fullWidth
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Textarea
          label="Explanation"
          placeholder="Enter explanation (optional)"
          fullWidth
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          className="mt-4"
        />
        <div className="mt-4">
          <label className="block mb-2">Code</label>
          <Editor
            height="400px"
            language={language}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={formData.code}
            onChange={(value) => setFormData({ ...formData, code: value || '' })}
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Tags</label>
          <Input
            placeholder="Add tags separated by commas"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onBlur={() => {
              if (tagInput) {
                const tags = tagInput.split(',').map((tag) => tag.trim());
                setFormData({ ...formData, tags });
              }
            }}
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleForkTemplate}>Fork Template</Button>
          <Button className="ml-2" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ForkTemplate;
