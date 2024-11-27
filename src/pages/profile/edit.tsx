import Avatars from "@/components/Avatars";
import PlainLayout from "@/components/PlainLayout";
import { Avatar, Button, Input } from "@nextui-org/react";
import { useTheme } from "next-themes";
import router from "next/router";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Edit() {
    const { theme } = useTheme(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fname, setFname] = useState('');
    const [fnameError, setFnameError] = useState('');
    const [touchedFname, setTouchedFname] = useState(false);
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [touchedEmail, setTouchedEmail] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [touchedPassword, setTouchedPassword] = useState(false);
    const [avatar, setAvatar] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userData, setUserData] = useState<any>(null); 

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken === null){
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
                    return;
                }
            } catch (error) {
                console.error("Error:", error);
                router.push("/");
                return;
            }
        }
        fetchUserData();
    }, []);

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

    function validatePassword(password: string) {
        if(password === "") {
            setPasswordError("Password is required");
            return false;
        }
        setPasswordError('');
        return true;
    }

    const fnameValid = React.useMemo(() => validateFname(fname), [fname]);
    const emailValid = React.useMemo(() => validateEmail(email), [email]);
    const passwordValid = React.useMemo(() => validatePassword(password), [password]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const isFnameValid = validateFname(fname);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isFnameValid || !isEmailValid || !isPasswordValid) {
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
                toast.success('Profile Updated!');
                setTimeout(() => {
                    router.push('/');
                }, 2000);            
            } 
            else if(response.status == 409){
                const error = "Email already in use";
                toast.error(error);
                setEmailError(error);
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
            <form
                onSubmit={handleSubmit}
                className={`w-full max-w-md p-6 shadow-md rounded-lg flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            >
                <h2 className={`text-3xl font-semibold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Edit Profile
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
                                    Update
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
                    size='lg'
                    isInvalid={touchedFname && !!fnameError}
                    color={touchedFname && fnameError ? "danger" : "default"}
                    errorMessage={touchedFname && fnameError}
                    onFocus={() => setTouchedFname(true)}
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
                    isInvalid={touchedEmail && !!emailError}
                    color={touchedEmail && emailError ? "danger" : "default"}
                    errorMessage={touchedEmail && emailError}
                    onFocus={() => setTouchedEmail(true)}
                    onValueChange={setEmail}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    isRequired
                    value={password}
                    type="password"
                    label="Password"
                    variant="bordered"
                    className="max-w-xs"
                    size='lg'
                    isInvalid={touchedPassword && !!passwordError}
                    color={touchedPassword && passwordError ? "danger" : "default"}
                    errorMessage={touchedPassword && passwordError}
                    onFocus={() => setTouchedPassword(true)}
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
