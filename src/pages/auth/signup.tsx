import Avatars from "@/components/Avatars";
import PlainLayout from "@/components/PlainLayout";
import { Avatar, Button, Input, Link } from "@nextui-org/react";
import { useTheme } from "next-themes";
import router from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Signup(){
    const { theme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fnameError, setFnameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [touched, setTouched] = useState<{ fname: boolean; email: boolean; password: boolean }>({ fname: false, email: false, password: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) router.push('/');    
    }, []);

    function validateFname(fname: string) {
        if(fname === ""){
            setFnameError("First name is required");
            return false;
        }
        setFnameError("");
        return true;
    }     

    function validatePassword(password: string) {
        if(password === ""){
            setPasswordError("Password is required");
            return false;
        }
        else if(password.length < 3){
            setPasswordError("Password must be at least 3 characters long");
            return false;
        }
        setPasswordError("");
        return true;
    }    

    function validateEmail(email: string) {
        if(email === ""){
            setEmailError("Email is required");
            return false;
        }
        else if(!email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)){
            setEmailError("Please enter a valid email");
            return false;
        }
        setEmailError('');
        return true;
    }     

    const fnameValid = React.useMemo(() => validateFname(fname), [fname]);
    const emailValid = React.useMemo(() => validateEmail(email), [email]);
    const passwordValid = React.useMemo(() => validatePassword(password), [password]);

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if(!emailValid || !passwordValid || !fnameValid){
            toast.error("Please enter the required fields");
            return;
        }
        try {
            const signupResponse = await fetch('/api/users/signup',{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    firstName: fname,
                    lastName: lname,
                    avatar,
                    phoneNumber,
                }),  
            });

            if(signupResponse.status == 409){
                toast.error("Email already in use");
                return;
            }
            else if(signupResponse.ok){
                // Log in with new user data
                const loginResponse = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await loginResponse.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                toast.success('Profile Created!'); 
                setTimeout(() => {
                    router.push('/');
                }, 1500);      
            }
            else{
                toast.error('Failed to create profile');
            }
        } catch (error) {
            toast.error('An error occurred, please try again.');
        }
    }

    return(
        <PlainLayout>
            <form
                onSubmit={handleSubmit}
                className={`w-full max-w-md p-6 shadow-md rounded-lg flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            >        
                <h2 className={`text-3xl font-semibold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Create Profile
                </h2>

                <Avatar
                    onClick={() => setIsModalOpen(true)}
                    className="transition-transform w-32 h-32 border-4 border-gray-400 rounded-full hover:border-gray-600 hover:shadow-lg hover:scale-105"
                    src={avatar}            
                    classNames={{img: "opacity-100",}}
                    size="lg"
                />

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Select Avatar</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-lg">&times;</button>
                            </div>
                            <Avatars
                                currentAvatar={avatar}
                                onSelectAvatar={(selectedAvatar: string) => setAvatar(selectedAvatar)}
                            />
                            <div className="mt-4 flex justify-between">
                                <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
                                    Exit
                                </Button>
                                <Button color="primary" onPress={() => setIsModalOpen(false)}>
                                    Select
                                </Button>
                            </div>
                        </div>
                    </div>
                )}      

                <Input
                    isRequired
                    value={fname}
                    type="text"
                    label="First Name"
                    variant="bordered"
                    className="max-w-xs"
                    size="lg"
                    isInvalid={touched.fname && !fnameValid}
                    color={touched.fname && !fnameValid ? 'danger' : 'default'}
                    errorMessage={touched.fname ? fnameError : ''}
                    onChange={(e) => {
                        setFname(e.target.value);
                        if (!touched.fname) setTouched((prev) => ({ ...prev, fname: true }));
                    }}
                />

                <Input
                    value={lname}
                    type="text"
                    label="Last Name"
                    variant="bordered"
                    className="max-w-xs"
                    size='lg'
                    onChange={(e) => setLname(e.target.value)}
                />

                <Input
                    isRequired
                    value={email}
                    type="text"
                    label="Email"
                    variant="bordered"
                    className="max-w-xs"
                    size="lg"
                    isInvalid={touched.email && !emailValid}
                    color={touched.email && !emailValid ? 'danger' : 'default'}
                    errorMessage={touched.email ? emailError : ''}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
                    }}
                />

                <Input
                    isRequired
                    value={password}
                    type="password"
                    label="Password"
                    variant="bordered"
                    className="max-w-xs"
                    size='lg'
                    isInvalid={touched.password && !passwordValid}
                    color={touched.password && !passwordValid ? 'danger' : 'default'}
                    errorMessage={touched.password ? passwordError : ''}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (!touched.password) setTouched((prev) => ({...prev, password: true}));
                    }}
                />

                <Input
                    value={phoneNumber}
                    type="phone"
                    label="Phone Number"
                    variant="bordered"
                    className="max-w-xs"
                    size='lg'
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <Button color="primary" size='lg' type='submit'>
                    Create Profile
                </Button>     
                <p>Already have an account? <Link underline="always" href="/auth/login">Login here</Link> </p>       
            </form>
        </PlainLayout>
    );
}