// pages/code-templates/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Badge, Spinner } from '@nextui-org/react';
import { Editor } from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/Layout';
import { useTheme } from 'next-themes';

const TemplateDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();

  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchTemplate();
      fetchCurrentUser();
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
        setTemplate(data);
      } else {
        toast.error('Failed to fetch template');
        router.push('/code-templates');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while fetching the template');
      router.push('/code-templates');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleEditTemplate = () => {
    router.push(`/edit-template?id=${template.id}`);
  };

  const handleDeleteTemplate = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/codeTemplates/${template.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        router.push('/code-templates');
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error deleting template');
    }
  };

  const handleForkTemplate = () => {
    router.push(`/fork-template?id=${template.id}`);
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

  if (!template) {
    return null;
  }

  return (
    <Layout>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{template.title}</h1>
        <div className="mb-4">
          <p className="text-gray-600">
            By {template.user.firstName} {template.user.lastName}
          </p>
          <p className="text-gray-600">
            Created at: {new Date(template.createdAt).toLocaleString()}
          </p>
        </div>
        {template.tags.length > 0 && (
          <div className="mb-4">
            {template.tags.map((tag: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
              <Badge key={tag.id} className="mr-2">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        {template.explanation && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Explanation</h2>
            <p>{template.explanation}</p>
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Code</h2>
          <Editor
            height="400px"
            language="javascript" // Adjust the language based on your template data if available
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={template.code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
            }}
          />
        </div>
        <div className="flex gap-4">
          <Button onClick={handleForkTemplate}>Fork</Button>
          {currentUser && currentUser.id === template.userId && (
            <>
              <Button onClick={handleEditTemplate}>Edit</Button>
              <Button onClick={handleDeleteTemplate}>
                Delete
              </Button>
            </>
          )}
          <Button onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TemplateDetail;
