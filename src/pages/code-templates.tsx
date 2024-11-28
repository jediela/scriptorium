import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input, Dropdown, Modal, Table, Spinner, Badge, TableHeader, TableBody, TableColumn, TableRow, TableCell, ModalContent, ModalBody, ModalHeader, ModalFooter} from '@nextui-org/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/Layout';
import { useTheme } from 'next-themes';

const CodeTemplates = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [templates, setTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showForkModal, setShowForkModal] = useState<boolean>(false);
  const [forkTemplateId, setForkTemplateId] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [searchQuery, selectedTags]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      if (selectedTags.length > 0) {
        queryParams.append('tags', selectedTags.join(','));
      }

      const response = await fetch(`/api/codeTemplates?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        toast.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while fetching templates');
    }
    setIsLoading(false);
  };

  const handleForkTemplate = (templateId: number) => {
    setForkTemplateId(templateId);
    setShowForkModal(true);
  };

  const handleUseTemplate = (template: any) => {
    localStorage.setItem('codeTemplate', JSON.stringify(template));
    router.push('/code-execution');
  };

  const handleForkSubmit = async () => {
    if (!forkTemplateId) return;
    try {
      const response = await fetch(`/api/codeTemplates/${forkTemplateId}/fork`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        toast.success('Template forked successfully');
        setShowForkModal(false);
        fetchTemplates();
      } else {
        toast.error('Failed to fork template');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while forking the template');
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Code Templates</h1>
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md"
          />
          <Button onClick={() => router.push('/create-template')}>Create New Template</Button>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <Table>
            <TableHeader>
              <TableColumn>Title</TableColumn>
              <TableColumn>Author</TableColumn>
              <TableColumn>Tags</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.title}</TableCell>
                  <TableCell>{`${template.user.firstName} ${template.user.lastName}`}</TableCell>
                  <TableCell>
                    {template.tags.map((tag: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
                      <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/code-templates/${template.id}`)}
                    >
                      View
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/edit-template?id=${template.id}`)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/fork-template?id=${template.id}`)}
                    >
                      Fork
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {showForkModal && (
        <Modal isOpen={showForkModal} onClose={() => setShowForkModal(false)}>
          <ModalContent>
            <ModalHeader>Fork Template</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to fork this template?</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setShowForkModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleForkSubmit}>
                Fork
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Layout>
  );
};

export default CodeTemplates;
