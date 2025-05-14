
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface AccountCreationProps {
  userData: {
    name: string;
    email: string;
    password: string;
  };
  updateUserData: (data: Partial<{ name: string; email: string; password: string }>) => void;
  onNext: () => void;
}

const AccountCreation: React.FC<AccountCreationProps> = ({ userData, updateUserData, onNext }) => {
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: ""
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: ""
    };

    // Validate name
    if (!userData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim() || !emailRegex.test(userData.email)) {
      newErrors.email = "Valid email is required";
      isValid = false;
    }

    // Validate password (at least 10 characters, includes uppercase, includes special character)
    if (userData.password.length < 10) {
      newErrors.password = "Password must be at least 10 characters";
      isValid = false;
    } else if (!/[A-Z]/.test(userData.password)) {
      newErrors.password = "Password must include at least one uppercase letter";
      isValid = false;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password)) {
      newErrors.password = "Password must include at least one special character";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateUserData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Let's set up your account</h1>
        <p className="text-gray-500 mt-2">Create your Hey Megan account to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            value={userData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={userData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="•••••••••••"
            value={userData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.password}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Must be at least 10 characters with uppercase and special characters
          </p>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default AccountCreation;
