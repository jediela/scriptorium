// pages/code-templates.tsx
import React, { useEffect, useState } from 'react';
import PlainLayout from '@/components/PlainLayout';
import { useTheme } from 'next-themes';
import { Button, Input, Dropdown, DropdownItem, DropdownMenu, 
        DropdownTrigger, Modal, ModalContent, ModalHeader, 
        ModalBody, ModalFooter, Table, TableHeader, 
        TableBody, TableColumn, TableRow, TableCell, Spinner,
        } from '@nextui-org/react';
import { Editor } from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useRouter } from 'next/router';

export default function CodeTemplates() {
  const { theme } = useTheme();
  const router = useRouter();

  const [templates, setTemplates] = useState<any[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    language: '',
    title: '',
    code: '',
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

  useEffect(() => {
    // Fetch current user data
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
          // Handle unauthorized access
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Set supported languages
    setLanguages([
      'javascript',
      'python',
      'java',
      'cpp',
      'csharp',
      'php',
      'swift',
      'rust',
      'perl',
      'haskell',
    ]);
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedLanguage && selectedLanguage !== 'all') {
          queryParams.append('language', selectedLanguage);
        }
        if (searchQuery) {
          queryParams.append('search', searchQuery);
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
          console.error('Failed to fetch templates');
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
      setIsLoading(false);
    };

    fetchTemplates();
  }, [selectedLanguage, searchQuery]);

  const handleLanguageFilterChange = (keys: Set<React.Key>) => {
    setSelectedLanguage(Array.from(keys).join(''));
  };

  const handleUseTemplate = (template: any) => {
    localStorage.setItem('codeTemplate', JSON.stringify(template));
    router.push('/code-execution');
  };

  const handleEditTemplate = (template: any) => {
    setIsEditing(true);
    setCurrentTemplate(template);
    setFormData({
      language: template.language,
      title: template.title,
      code: template.code,
      isPublic: template.isPublic,
    });
    setShowModal(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/codeTemplates/${templateId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setTemplates(templates.filter((t) => t.id !== templateId));
        toast.success('Template deleted successfully', { theme });
      } else {
        toast.error('Failed to delete template', { theme });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error deleting template', { theme });
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.title || !formData.language || !formData.code) {
      toast.error('Please fill in all required fields', { theme });
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/codeTemplates/${currentTemplate.id}` : '/api/codeTemplates';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedTemplate = await response.json();
        if (isEditing) {
          setTemplates(
            templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
          );
          toast.success('Template updated successfully', { theme });
        } else {
          setTemplates([updatedTemplate, ...templates]);
          toast.success('Template created successfully', { theme });
        }
        setShowModal(false);
        setFormData({ language: '', title: '', code: '', isPublic: false });
        setIsEditing(false);
        setCurrentTemplate(null);
      } else {
        toast.error('Failed to save template', { theme });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template', { theme });
    }
  };

  const handleCreateTemplate = () => {
    setIsEditing(false);
    setCurrentTemplate(null);
    setFormData({ language: '', title: '', code: '', isPublic: false });
    setShowModal(true);
  };

  const languageItems = [
    { key: 'all', name: 'All Languages' },
    ...languages.map((lang) => ({ key: lang, name: lang })),
  ];  

  return (
    <PlainLayout>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        limit={1}
        pauseOnFocusLoss={false}
        theme={theme}
      />
      <div
        className={`w-full max-w-5xl p-6 shadow-md rounded-lg flex flex-col items-center gap-4 mx-auto ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
        } border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
      >
        <h2
          className={`text-3xl font-semibold text-center mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        >
          Code Templates
        </h2>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center my-4 w-full justify-between">
          <div className="flex gap-4">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="shadow">
                  {selectedLanguage === 'all' ? 'All Languages' : selectedLanguage}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select Language"
                selectionMode="single"
                selectedKeys={new Set([selectedLanguage])}
                onSelectionChange={handleLanguageFilterChange}
                items={languageItems}
              >
                {(item) => (
                  <DropdownItem key={item.key}>{item.name}</DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
            <Input
              placeholder="Search Templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
            />
          </div>
          <Button variant="shadow" onClick={handleCreateTemplate}>
            Create New Template
          </Button>
        </div>

        {/* Templates Table */}
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-64">
            <Spinner size="lg" />
          </div>
        ) : templates.length > 0 ? (
          <Table
            aria-label="Code Templates"
            selectionMode="none"
            className={`${
              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}
          >
            <TableHeader>
              <TableColumn>Title</TableColumn>
              <TableColumn>Language</TableColumn>
              <TableColumn>Visibility</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.title}</TableCell>
                  <TableCell>{template.language}</TableCell>
                  <TableCell>{template.isPublic ? 'Public' : 'Private'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                    {currentUser &&
                      (currentUser.id === template.userId ||
                        currentUser.role === 'admin') && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTemplate(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            color="danger"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No templates found.</p>
        )}

        {/* Create/Edit Template Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} backdrop="blur">
          <ModalContent>
            <ModalHeader>{isEditing ? 'Edit Template' : 'Create New Template'}</ModalHeader>
            <ModalBody>
              <Input
                label="Title"
                placeholder="Template Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                required
                size="lg"
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="shadow">
                    {formData.language || 'Select Language'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select Language"
                  selectionMode="single"
                  selectedKeys={new Set([formData.language])}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, language: Array.from(keys).join('') })
                  }
                >
                  {languages.map((lang) => (
                    <DropdownItem key={lang}>{lang}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <div className="editor-container w-full max-w-xl mt-4">
                <label className="editor-label text-sm font-medium mb-1">Code</label>
                <Editor
                  height="200px"
                  language={formData.language || 'plaintext'}
                  theme={editorTheme}
                  value={formData.code}
                  onChange={(value) => setFormData({ ...formData, code: value || '' })}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </div>
              <label className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="mr-2"
                />
                Public Template
              </label>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="shadow" onClick={handleSaveTemplate}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PlainLayout>
  );
}
