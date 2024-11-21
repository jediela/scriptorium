import Avatars from "@/components/Avatars";
import PlainLayout from "@/components/PlainLayout";
import { Avatar, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useTheme } from "next-themes";
import router from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import { Slide, toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Edit() {
    const { theme } = useTheme(); 
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [fname, setFname] = useState('');
    const [fnameError, setFnameError] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userData, setUserData] = useState<any>(null); 

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken === ""){
            router.push("/");
            return;
        }
        async function fetchUserData() {
            try {
                const response = await fetch("/api/users/me", {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setFname(data.firstName || "");
                    setLname(data.lastName || "");
                    setEmail(data.email || "");
                    setAvatar(data.avatar || "");
                    setPhoneNumber(data.phoneNumber || "");
                } else {
                    toast.error("Failed to fetch user data");
                    router.push("/");
                }
            } catch (error) {
                console.error("Error:", error);
                router.push("/");
            }
        }
        fetchUserData();
    }, [router]);

    function validateFname(fname: string) {
        if(fname === ""){
            setFnameError("First name is required");
            return false;
        }
        setFnameError("");
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

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if(!emailValid || !fnameValid){
            toast.error("Please enter the required fields");
            return;
        }

        try {
            const response = await fetch(`/api/users/${userData.id}`, {
                method: 'POST',
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
            
            if (response.ok) {
                const updatedData = await response.json();
                const user = updatedData.updatedUser;
                setUserData(user);
                localStorage.setItem('user', JSON.stringify(user));
            
                toast.success('Profile Updated!'); 

                setTimeout(() => {
                    router.push('/');
                }, 2000);            
            } 
            else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred, please try again.');
        }
    }

    return (
        <PlainLayout>
            <ToastContainer position='top-center' autoClose={2000} transition={Slide} limit={1} pauseOnFocusLoss={false}/>
            <form
                onSubmit={handleSubmit}
                className={`w-full max-w-md p-6 shadow-md rounded-lg flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            >        
                <h2 className={`text-3xl font-semibold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Edit Profile
                </h2>

                <Avatar
                    onClick={onOpen}
                    className="transition-transform w-32 h-32 border-4 border-gray-400 rounded-full hover:border-gray-600 hover:shadow-lg hover:scale-105"
                    src={avatar}            
                    classNames={{img: "opacity-100",}}
                    size="lg"
                />

                <Modal 
                    size="3xl"
                    isOpen={isOpen} 
                    onOpenChange={onOpenChange}
                    placement="auto"
                    >
                    <ModalContent>
                    {(onClose) => (
                        <ModalBody>
                            <ModalHeader className="flex flex-col gap-1">Select your avatar</ModalHeader>
                            <Avatars
                                currentAvatar={avatar} // Pass the currently selected avatar
                                onSelectAvatar={(selectedAvatar: string) => setAvatar(selectedAvatar)} // Update the avatar state when an avatar is selected
                            />
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                Exit
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                Update
                                </Button>
                            </ModalFooter>
                        </ModalBody>
                    )}
                    </ModalContent>
                </Modal>

                <Input
                    isRequired
                    value={fname}
                    type="text"
                    label="First Name"
                    variant="bordered"
                    className="max-w-xs"
                    size='lg'
                    isInvalid={!fnameValid}
                    color={fnameValid ? "default" : "danger"}
                    errorMessage={fnameError}
                    onValueChange={setFname}
                    onChange={(e) => setFname(e.target.value)}
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
                    size='lg'
                    isInvalid={!emailValid}
                    color={emailValid ? "default" : "danger"}
                    errorMessage={emailError}
                    onValueChange={setEmail}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    value={password}
                    type="password"
                    label="Password"
                    variant="bordered"
                    className="max-w-xs"
                    size='lg'
                    onChange={(e) => setPassword(e.target.value)}
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
                    Update Profile
                </Button>            
            </form>
        </PlainLayout>
    );
}
