import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { Textarea, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes';
import { Editor } from '@monaco-editor/react';
import { useRouter } from 'next/router';

export default function CodeExecution() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { theme } = useTheme();
  
  const router = useRouter();
  const { code: initialCode, language: initialLanguage } = router.query;
  const [code, setCode] = useState<string>(initialCode as string || '');
  const [language, setLanguage] = useState<string>(initialLanguage as string || 'javascript');
  const [selectedLanguage, setSelectedLanguage] = useState(new Set(['javascript']));


  const languageOptions = [
    { key: 'javascript', name: 'JavaScript' },
    { key: 'python', name: 'Python' },
    { key: 'java', name: 'Java' },
    { key: 'cpp', name: 'C++' },
    { key: 'csharp', name: 'C#' },
    { key: 'php', name: 'PHP' },
    { key: 'swift', name: 'Swift' },
    { key: 'rust', name: 'Rust' },
    { key: 'perl', name: 'Perl' },
    { key: 'haskell', name: 'Haskell' },
    { key: 'dart', name: 'Dart' },
  ];

  const handleLanguageChange = (keys: any) => {
    setSelectedLanguage(keys);
    const newLanguage = Array.from(keys).join('');
    setLanguage(newLanguage);
  };

  const selectedValue = React.useMemo(() => {
    return Array.from(selectedLanguage).join(', ').replaceAll('_', ' ');
  }, [selectedLanguage]);

  const languageMappings: { [key: string]: string } = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    csharp: 'csharp',
    php: 'php',
    swift: 'swift',
    rust: 'rust',
    perl: 'perl',
    haskell: 'haskell',
  };

  const monacoLanguage = languageMappings[language] || 'plaintext';

  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

  const handleRunCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setOutput('Running...');
    const language = Array.from(selectedLanguage).join('');
    try {
      const response = await fetch('/api/codeExecutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ language, code, input }),
      });

      const data = await response.json();

      if (response.ok) {
        setOutput(data.output || 'No output produced.');
        toast.success('Code executed successfully!', { theme });
      } else {
        setOutput(data.error || 'Error executing code');
        toast.error(data.error || 'Error executing code', { theme });
      }
    } catch (error) {
      setOutput('Error connecting to server');
      console.error(error);
      toast.error('Error connecting to server', { theme });
    }
    setIsRunning(false);
  };

  return (
    <Layout>
      <form
        onSubmit={handleRunCode}
        className={`w-full p-6 shadow-md rounded-lg flex flex-col items-center gap-4 ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
        } border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
      >
        <h2
          className={`text-3xl font-semibold text-center mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-black'
          }`}
        >
          Online Code Executor
        </h2>
        <Dropdown backdrop="blur">
          <DropdownTrigger>
            <Button variant="shadow">{selectedValue || 'Select Language'}</Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Select Language"
            selectionMode="single"
            selectedKeys={selectedLanguage}
            onSelectionChange={handleLanguageChange}
            itemClasses={{
              base: [
                'rounded-md',
                'text-default-500',
                'transition-opacity',
                'data-[selectable=true]:focus:bg-default-50',
                'data-[pressed=true]:opacity-70',
                'data-[focus-visible=true]:ring-default-500',
              ],
            }}
          >
            {languageOptions.map((lang) => (
              <DropdownItem key={lang.key}>{lang.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <div className="editor-container w-full max-w-xl">
          <label className="editor-label text-sm font-medium mb-1">Code</label>
          <Editor
            height="400px"
            language={monacoLanguage}
            theme={editorTheme}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        <Textarea
          label="Input"
          placeholder="Enter input for your code"
          fullWidth
          minRows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="max-w-xl"
          size="lg"
        />

        <Button variant="shadow" size="lg" type="submit" isDisabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>

        <Textarea
          label="Output"
          readOnly
          fullWidth
          minRows={5}
          value={output}
          className="max-w-xl"
          size="lg"
        />
      </form>
    </Layout>
  );
}
