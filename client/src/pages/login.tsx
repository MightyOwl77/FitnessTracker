import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userLoginSchema, userRegisterSchema } from "../.././../shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { loginAsGuest, resetAuth } = useAuth();

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Submit login form
  async function onLoginSubmit(values: any) {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/login", values);

      // Store user data in localStorage for persistence across page reloads
      if (response && typeof response === 'object') {
        // Safely access id, converting to string if it exists
        const userId = response.id ? String(response.id) : '';
        localStorage.setItem('userId', userId);

        // Safely access username
        const username = response.username ? String(response.username) : '';
        localStorage.setItem('username', username);

        localStorage.setItem('authToken', 'dummy-token-' + Date.now()); // Simple token for demonstration
        localStorage.setItem('isAuthenticated', 'true');

        // Record last login time for reference
        localStorage.setItem('lastLoginTime', new Date().toISOString());
      }

      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
        variant: "default"
      });

      //Check if onboarding is complete is now handled by AuthContext and App.tsx
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Submit register form
  async function onRegisterSubmit(values: any) {
    setIsLoading(true);
    try {
      const registerResponse = await apiRequest("POST", "/api/register", {
        username: values.username, 
        password: values.password
      });

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
        variant: "default"
      });

      // Automatically log in the user after registration
      try {
        const loginResponse = await apiRequest("POST", "/api/login", {
          username: values.username,
          password: values.password
        });

        // Store user data in localStorage for persistence across page reloads
        if (loginResponse && typeof loginResponse === 'object') {
          // Safely access id, converting to string if it exists
          const userId = loginResponse.id ? String(loginResponse.id) : '';
          localStorage.setItem('userId', userId);

          // Safely access username
          const username = loginResponse.username ? String(loginResponse.username) : '';
          localStorage.setItem('username', username);

          localStorage.setItem('authToken', 'dummy-token-' + Date.now()); // Simple token for demonstration
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('lastLoginTime', new Date().toISOString());
        }

        // Mark as not completed onboarding to ensure user goes through the process
        localStorage.setItem("hasCompletedOnboarding", "false");
        // Navigation is now handled by AuthContext and App.tsx
      } catch (loginError) {
        console.error("Auto-login failed after registration:", loginError);
        // Fall back to login tab if auto-login fails
        setActiveTab("login");
        registerForm.reset();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
            Body Transformation
          </CardTitle>
          <CardDescription>
            Your personal fitness transformation journey starts here
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="text-center flex flex-col">
          <p className="text-sm text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* Guest login button that leads to onboarding */}
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => {
              loginAsGuest();
              // Navigation is handled by AuthContext
            }}
          >
            Continue as Guest
          </Button>

          {/* Reset button - clears all storage and reloads the page */}
          <Button 
            variant="ghost" 
            className="mt-4 text-red-500" 
            onClick={() => {
              resetAuth();
              // Reload the page to ensure clean state
              window.location.href = "/login?reset=true";
            }}
          >
            Reset Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}