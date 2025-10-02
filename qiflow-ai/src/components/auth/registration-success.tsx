'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RegistrationSuccessProps {
  email: string;
  isDemoMode?: boolean;
  onContinue?: () => void;
}

export function RegistrationSuccess({ 
  email, 
  isDemoMode = false, 
  onContinue 
}: RegistrationSuccessProps) {
  const router = useRouter();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push('/zh-CN/bazi-analysis');
    }
  };

  if (isDemoMode) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Demo Account Created Successfully!
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              You have successfully created a demo account <strong>{email}</strong>
            </p>
            <p className="mt-1">
              In demo mode, you can immediately start using all features.
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Start Using QiFlow AI
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Mail className="h-4 w-4 text-blue-600" />
      <div className="ml-3">
        <h3 className="text-sm font-medium text-blue-800">
          Registration Successful! Please Verify Email
        </h3>
        <div className="mt-2 text-sm text-blue-700">
          <p>
            We have sent a verification email to <strong>{email}</strong>.
          </p>
          <p className="mt-1">
            Please check your email and click the verification link to activate your account.
          </p>
        </div>
        <div className="mt-4 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/zh-CN/auth/login')}
            className="text-blue-800 border-blue-300 hover:bg-blue-100"
          >
            Go to Login
          </Button>
          <Button
            variant="outline"
            onClick={handleContinue}
            className="text-blue-800 border-blue-300 hover:bg-blue-100"
          >
            Guest Mode Experience
          </Button>
        </div>
      </div>
    </Alert>
  );
}