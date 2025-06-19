import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface LoginFormData {
  id: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    id: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'ID is required';
    } else if (formData.id.length < 3) {
      newErrors.id = 'ID must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateApiCall = async (credentials: LoginFormData): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure based on credentials
    if (credentials.id === 'admin' && credentials.password === 'password123') {
      return {
        success: true,
        message: 'Login successful! Welcome back.',
        token: 'mock-jwt-token-12345'
      };
    } else {
      return {
        success: false,
        message: 'Invalid credentials. Please check your ID and password.'
      };
    }
  };

  const callLoginApi = async (credentials: LoginFormData): Promise<LoginResponse> => {
  const { id, password } = credentials;

  try {
    const response = await fetch(
      `https://localhost:7176/WeatherForecast/Login?username=${encodeURIComponent(id)}&password=${encodeURIComponent(password)}`,
      {
        method: 'POST',
        headers: {
          'accept': '*/*'
        },
        body: null // Or `undefined` – the API does not expect a body
      }
    );

    if (!response.ok) {
      throw new Error('API returned an error');
    }

    const data = await response.text(); // assuming API returns plain text
    return {
      success: true,
      message: data || 'Login successful!',
      token: data // assuming the token is in the text response
    };
  } catch (error) {
    return {
      success: false,
      message: 'Login failed. Please check your credentials or try again later.'
    };
  }
};


  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof Partial<LoginFormData>]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Reset login status when user modifies form
    if (loginStatus !== 'idle') {
      setLoginStatus('idle');
      setStatusMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginStatus('idle');
    
    try {
      const response = await callLoginApi(formData);
      
      if (response.success) {
        setLoginStatus('success');
        setStatusMessage(response.message);
        
        // In a real app, you would store the token and redirect
        console.log('Login successful, token:', response.token);
      } else {
        setLoginStatus('error');
        setStatusMessage(response.message);
      }
    } catch (error) {
      setLoginStatus('error');
      setStatusMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {/* Status Message */}
        {loginStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 transition-all duration-300 ${
            loginStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {loginStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID Field */}
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="id"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.id 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your ID"
                disabled={isLoading}
              />
            </div>
            {errors.id && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.id}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;