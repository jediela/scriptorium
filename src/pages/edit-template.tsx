import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input, Textarea, Spinner } from '@nextui-org/react';
import { Editor } from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/Layout';
import { useTheme } from 'next-themes';

const EditTemplate = () => {
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
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/codeTemplates/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          explanation: data.explanation || '',
          code: data.code,
          tags: data.tags.map((tag: { name: any; }) => tag.name),
        });
        setTagInput(data.tags.map((tag: { name: any; }) => tag.name).join(', '));
        setIsLoading(false);
      } else {
        toast.error('Failed to fetch template');
        router.push('/code-templates');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while fetching the template');
      router.push('/code-templates');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!formData.title || !formData.code) {
      toast.error('Title and code are required');
      return;
    }

    try {
      const response = await fetch(`/api/codeTemplates/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Template updated successfully');
        router.push('/code-templates');
      } else {
        toast.error('Failed to update template');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating the template');
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
        <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
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
          <Button onClick={handleUpdateTemplate}>Update Template</Button>
          <Button className="ml-2" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default EditTemplate;
