interface InputFieldProps {
    type: 'email' | 'password';
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
  
export default function InputField({ type, placeholder, value, onChange }: InputFieldProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="mt-1 mb-10 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 text-black"
            required
        />
    );
}