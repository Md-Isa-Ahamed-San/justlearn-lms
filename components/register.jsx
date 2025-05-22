"use client";
import { useState, ChangeEvent, FormEvent, ReactNode } from "react";

import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
} from "@/components/modern-animated-sign-in";
import Image from "next/image";
import { useRouter } from "next/navigation";

const iconsArray = [
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg"
        alt="nodejs"
      />
    ),
    className: "size-[30px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg"
        alt="express"
      />
    ),
    className: "size-[30px] border-none bg-transparent",
    duration: 20,
    delay: 10,
    radius: 100,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg"
        alt="Prisma"
      />
    ),
    className: "size-[50px] border-none bg-transparent",
    radius: 210,
    duration: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
        alt="JavaScript"
      />
    ),
    className: "size-[40px] border-none bg-transparent",
    radius: 210,
    duration: 20,
    delay: 20,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
        alt="TailwindCSS"
      />
    ),
    className: "size-[30px] border-none bg-transparent",
    duration: 20,
    delay: 20,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg"
        alt="Nextjs"
      />
    ),
    className: "size-[30px] border-none bg-transparent",
    duration: 20,
    delay: 10,
    radius: 150,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
        alt="React"
      />
    ),
    className: "size-[50px] border-none bg-transparent",
    radius: 270,
    duration: 20,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <Image
        width={100}
        height={100}
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg"
        alt="MongoDB"
      />
    ),
    className: "size-[50px] border-none bg-transparent",
    radius: 270,
    duration: 20,
    delay: 60,
    path: false,
    reverse: true,
  },
  // {
  //   component: () => (
  //     <Image
  //       width={100}
  //       height={100}
  //       src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"
  //       alt="Git"
  //     />
  //   ),
  //   className: "size-[50px] border-none bg-transparent",
  //   radius: 320,
  //   duration: 20,
  //   delay: 20,
  //   path: false,
  //   reverse: false,
  // },
];

export function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role:"student"
  });
  const [registerError, setRegisterError] = useState(null);
  const router = useRouter();
  const goToForgotPassword = (event) => {
    event.preventDefault();
  };

  const handleInputChange = (event, name) => {
    const value = event.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

 const handleSubmit = async (event) => {
  event.preventDefault();
  console.log("Form submitted", formData);
  try {
    const registerResponse = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    
    if (registerResponse.status === 201) {
      setRegisterError(null);
      router.push("/login");
    } else {
      // Handle non-201 responses
      const errorData = await registerResponse.json();
      setRegisterError(errorData.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.log(error);
    // Convert error object to string message
    setRegisterError(error.message || "An unexpected error occurred. Please try again.");
  }
};

  const formFields = {
    header: "Welcome",
    subHeader: "Sign up to your account",
    fields: [
      {
        label: "First Name",
        required: true,
        type: "text",
        placeholder: "Enter your first name",
        onChange: (event) => handleInputChange(event, "firstName"),
      },
      {
        label: "Last Name",
        required: true,
        type: "text",
        placeholder: "Enter your last name",
        onChange: (event) => handleInputChange(event, "lastName"),
      },
      {
        label: "Email",
        required: true,
        type: "email",
        placeholder: "Enter your email address",
        onChange: (event) => handleInputChange(event, "email"),
      },
      {
        label: "Password",
        required: true,
        type: "password",
        placeholder: "Enter your password",
        onChange: (event) => handleInputChange(event, "password"),
      },
      {
        label: "Role",
        required: true,
        type: "select",
        placeholder: "Select your role",
        options: [
          { label: "Student", value: "student" },
          { label: "Instructor", value: "instructor" },
          { label: "Admin", value: "admin" },
        ],
        onChange: (event) => handleInputChange(event, "role"),
      },
    ],
    submitButton: "Sign Up",
    textVariantButton: "Have account? Sign In",
  };

  return (
    <section className="flex max-lg:justify-center">
      {/* Left Side */}
      <span className="flex flex-col justify-center w-1/2 max-lg:hidden">
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} />
      </span>

      {/* Right Side */}
      <span className="w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]">
        <AuthTabs
          formFields={formFields}
          goTo={goToForgotPassword}
          handleSubmit={handleSubmit}
          registerError={registerError}
        />
      </span>
    </section>
  );
}
