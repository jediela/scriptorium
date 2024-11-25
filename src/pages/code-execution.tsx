import React, { useState } from 'react';
import PlainLayout from '@/components/PlainLayout';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { Textarea, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes';

export default function CodeExecution() {
  const [code, setCode] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { theme } = useTheme();

  const languageOptions = [
    { key: 'javascript', name: 'JavaScript' },
    { key: 'python', name: 'Python' },
    { key: 'java', name: 'Java' },
    { key: 'c', name: 'C' },
    { key: 'cpp', name: 'C++' },
    { key: 'csharp', name: 'C#' },
    { key: 'go', name: 'Go' },
    { key: 'ruby', name: 'Ruby' },
    { key: 'php', name: 'PHP' },
    { key: 'swift', name: 'Swift' },
    { key: 'kotlin', name: 'Kotlin' },
    { key: 'rust', name: 'Rust' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(new Set(['javascript']));
  const [language, setLanguage] = useState('javascript');

  const handleLanguageChange = (keys: any) => {
    setSelectedLanguage(keys);
    setLanguage(Array.from(keys).join(''));
  };

  const selectedValue = React.useMemo(() => {
    return Array.from(selectedLanguage).join(', ').replaceAll('_', ' ');
  }, [selectedLanguage]);

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
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
    <PlainLayout>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        transition={Slide}
        limit={1}
        pauseOnFocusLoss={false}
        theme={theme}
      />
      <form
        onSubmit={handleRunCode}
        className={`w-full max-w-2xl p-6 shadow-md rounded-lg flex flex-col items-center gap-4 ${
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
                    <Button 
                        variant="shadow"
                    >
                        {selectedValue || 'Select Language'}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                aria-label="Select Language"
                selectionMode="single"
                selectedKeys={selectedLanguage}
                onSelectionChange={handleLanguageChange}
                // css={{ minWidth: '200px' }}
                itemClasses={{
                    base: [
                      "rounded-md",
                      "text-default-500",
                      "transition-opacity",
                      "data-[selectable=true]:focus:bg-default-50",
                      "data-[pressed=true]:opacity-70",
                      "data-[focus-visible=true]:ring-default-500",
                    ],
                  }}
                >
                {languageOptions.map((lang) => (
                    <DropdownItem key={lang.key}>{lang.name}</DropdownItem>
                ))}
                </DropdownMenu>
            </Dropdown>

        <Textarea
          label="Code"
          placeholder="Write your code here"
          isRequired
          fullWidth
          minRows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="max-w-xl"
          size="lg"
        />

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
    </PlainLayout>
  );
}
