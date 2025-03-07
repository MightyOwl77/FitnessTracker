import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userLoginSchema, userRegisterSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import { Activity, ArrowRight } from "lucide-react";
import { brandColors } from "@/lib/brand";

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if it's the first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      // Wait a short time to show the modal for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Function to handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('hasVisitedBefore', 'true');
    setShowOnboarding(false);
    // Optionally redirect to first step
    // setLocation('/user-data');
  };

  // Function to start guest journey with onboarding
  const startGuestJourney = () => {
    localStorage.setItem('hasVisitedBefore', 'true');
    setShowOnboarding(false);
    setLocation('/user-data');
  };

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
      await apiRequest("POST", "/api/login", values);
      
      // For now, we'll just simulate a successful login
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
        variant: "default"
      });
      
      setLocation("/dashboard");
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
      await apiRequest("POST", "/api/register", {
        username: values.username, 
        password: values.password
      });
      
      // For now, we'll just simulate a successful registration
      toast({
        title: "Account created!",
        description: "Your account has been created successfully. You can now log in.",
        variant: "default"
      });
      
      setActiveTab("login");
      registerForm.reset();
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      {/* App Logo and Hero Section */}
      <div className="text-center mb-8 max-w-md">
        <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Activity className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
          BodyTransform
        </h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your scientific approach to fitness transformation. Get personalized plans based on your body's unique needs.
        </p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Login to continue your transformation journey
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
              <TabsTrigger value="register">Create Account</TabsTrigger>
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
        
        <CardFooter className="flex flex-col">
          <div className="relative w-full py-4 flex items-center">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-sm">or</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>
          
          {/* Guest login with prominent button */}
          <Button 
            variant="secondary" 
            className="w-full group"
            onClick={() => setShowOnboarding(true)}
          >
            Start Your Transformation
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <p className="text-xs text-muted-foreground mt-6 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
      
      {/* Features highlights */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="flex flex-col items-center p-4">
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Scientific Approach</h3>
          <p className="text-sm text-center text-muted-foreground">
            Plans based on proven scientific principles
          </p>
        </div>
        <div className="flex flex-col items-center p-4">
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Personalized Plans</h3>
          <p className="text-sm text-center text-muted-foreground">
            Customized to your unique body metrics
          </p>
        </div>
        <div className="flex flex-col items-center p-4">
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Progress Tracking</h3>
          <p className="text-sm text-center text-muted-foreground">
            Visual insights into your transformation
          </p>
        </div>
      </div>
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={startGuestJourney}
      />
    </div>
  );
}