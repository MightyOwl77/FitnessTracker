import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { userLoginSchema, userRegisterSchema } from "../.././../shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/contexts/user-data-context";

// Country codes for phone verification
const countryCodes = [
  { value: "+1", label: "US (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+91", label: "IN (+91)" },
  { value: "+61", label: "AU (+61)" },
  { value: "+86", label: "CN (+86)" },
  { value: "+49", label: "DE (+49)" },
  { value: "+33", label: "FR (+33)" },
  { value: "+81", label: "JP (+81)" },
  { value: "+7", label: "RU (+7)" },
  { value: "+55", label: "BR (+55)" },
  // Add more as needed
];

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "email" | "phone">("login");
  const { setUserAuth, setOnboardingStatus } = useUserData();

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Email registration form
  const emailForm = useForm({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Phone registration form
  const phoneForm = useForm({
    defaultValues: {
      countryCode: "+1",
      phoneNumber: "",
      verificationCode: "",
    },
  });

  // Submit login form
  const onLoginSubmit = useCallback(async (values) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/login", values);

      if (response && typeof response === "object") {
        const userId = response.id ? String(response.id) : '';
        const username = response.username ? String(response.username) : '';

        // Use UserDataContext instead of direct localStorage manipulation
        setUserAuth({
          userId,
          username,
          authToken: 'dummy-token-' + Date.now(),
          isAuthenticated: true,
          lastLoginTime: new Date().toISOString(),
          rememberMe: values.rememberMe
        });

        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
          variant: "default",
        });

        // Check onboarding status and redirect accordingly
        if (response.hasCompletedOnboarding) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/onboarding";
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setUserAuth, toast]);

  // Submit register form
  const onRegisterSubmit = useCallback(async (values) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/register", {
        username: values.username,
        password: values.password,
      });

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
        variant: "default",
      });

      // Automatically log in after registration
      try {
        const loginResponse = await apiRequest("POST", "/api/login", {
          username: values.username,
          password: values.password,
        });

        if (loginResponse && typeof loginResponse === "object") {
          const userId = loginResponse.id ? String(loginResponse.id) : '';
          const username = loginResponse.username ? String(loginResponse.username) : '';

          // Use UserDataContext instead of direct localStorage
          setUserAuth({
            userId,
            username,
            authToken: 'dummy-token-' + Date.now(),
            isAuthenticated: true,
            lastLoginTime: new Date().toISOString()
          });

          // Mark onboarding as not completed
          setOnboardingStatus(false);

          // Navigate to onboarding
          window.location.href = "/onboarding";
        }
      } catch (loginError) {
        console.error("Auto-login failed after registration:", loginError);
        setActiveTab("login");
        registerForm.reset();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setUserAuth, setOnboardingStatus, toast, registerForm]);

  // Handle email registration
  const onEmailRegisterSubmit = useCallback(async (values) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/register-email", {
        email: values.email,
        password: values.password,
      });

      toast({
        title: "Account created!",
        description: "We've sent a verification link to your email. Please verify your account to continue.",
        variant: "default",
      });

      setActiveTab("login");
      emailForm.reset();
    } catch (error) {
      console.error("Email registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, emailForm]);

  // Handle sending phone verification code
  const sendVerificationCode = useCallback(async () => {
    const values = phoneForm.getValues();
    if (!values.phoneNumber || values.phoneNumber.length < 5) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would call your API to send the verification code
      await apiRequest("POST", "/api/send-verification", {
        phoneNumber: `${values.countryCode}${values.phoneNumber}`,
      });

      setVerificationSent(true);
      toast({
        title: "Verification Code Sent",
        description: "We've sent a verification code to your phone number.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to send verification code:", error);
      toast({
        title: "Verification Failed",
        description: "We couldn't send a verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [phoneForm, toast]);

  // Handle phone verification and registration
  const onPhoneRegisterSubmit = useCallback(async (values) => {
    if (!verificationSent) {
      sendVerificationCode();
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would verify the code and register the user
      const response = await apiRequest("POST", "/api/verify-phone", {
        phoneNumber: `${values.countryCode}${values.phoneNumber}`,
        verificationCode: values.verificationCode,
      });

      if (response && typeof response === "object") {
        // Use UserDataContext
        setUserAuth({
          userId: response.id || `phone-${Date.now()}`,
          username: response.username || `user-${values.phoneNumber.slice(-4)}`,
          authToken: 'phone-token-' + Date.now(),
          isAuthenticated: true,
          lastLoginTime: new Date().toISOString(),
          phoneNumber: `${values.countryCode}${values.phoneNumber}`
        });

        // Mark onboarding as not completed
        setOnboardingStatus(false);

        toast({
          title: "Phone Verified!",
          description: "Your phone number has been verified successfully.",
          variant: "default",
        });

        // Navigate to onboarding
        window.location.href = "/onboarding";
      }
    } catch (error) {
      console.error("Phone verification failed:", error);
      toast({
        title: "Verification Failed",
        description: "The verification code is invalid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [verificationSent, sendVerificationCode, setUserAuth, setOnboardingStatus, toast]);

  // Continue as guest
  const continueAsGuest = useCallback(() => {
    const guestId = "guest-" + Date.now();

    // Use UserDataContext instead of direct localStorage manipulation
    setUserAuth({
      userId: guestId,
      username: "guest",
      authToken: "guest-token-" + Date.now(),
      isAuthenticated: true,
      isGuest: true
    });

    // Set onboarding as not completed
    setOnboardingStatus(false);

    // Pre-populate some preferences for guests
    // These could be moved to the UserDataContext as well
    localStorage.setItem("preferredUnits", "metric");
    localStorage.setItem("showWelcomeTips", "true");

    window.location.href = "/onboarding";
  }, [setUserAuth, setOnboardingStatus]);

  // Reset application
  const resetApplication = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login?reset=true";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-gray-100 p-4">
      <Card className="w-full max-w-md" role="dialog" aria-labelledby="login-title" aria-describedby="login-description">
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
          <CardTitle 
            id="login-title"
            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent"
          >
            Body Transformation
          </CardTitle>
          <CardDescription id="login-description">
            Your personal fitness transformation journey starts here
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "login" | "register" | "email" | "phone")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Username</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your username" 
                            autoComplete="username"
                            {...field} 
                          />
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
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                                id="rememberMe" 
                              />
                            </FormControl>
                            <label 
                              htmlFor="rememberMe" 
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              Remember me
                            </label>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button variant="link" className="text-sm p-0 h-auto text-green-600">
                      Forgot password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            autoComplete="username"
                            {...field} 
                          />
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
                          <Input
                            type="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            {...field}
                          />
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
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            {...field}
                          />
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

            <TabsContent value="email">
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailRegisterSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter your email" 
                            autoComplete="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={emailForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            {...field}
                          />
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

            <TabsContent value="phone">
              <Form {...phoneForm}>
                <form
                  onSubmit={phoneForm.handleSubmit(onPhoneRegisterSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={phoneForm.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>Country</FormLabel>
                          <Select
                            defaultValue="+1"
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Code" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countryCodes.map((country) => (
                                <SelectItem key={country.value} value={country.value}>
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={phoneForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="Enter phone number" 
                              autoComplete="tel"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {verificationSent && (
                    <FormField
                      control={phoneForm.control}
                      name="verificationCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input 
                              type="text"
                              placeholder="Enter verification code" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading 
                      ? "Processing..." 
                      : verificationSent 
                        ? "Verify Code" 
                        : "Send Verification Code"
                    }
                  </Button>

                  {verificationSent && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => sendVerificationCode()}
                      disabled={isLoading}
                    >
                      Resend Code
                    </Button>
                  )}
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="relative flex items-center justify-center mt-6">
            <Separator className="absolute w-full" />
            <span className="relative px-2 bg-white text-sm text-gray-500">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" className="flex items-center justify-center gap-2" type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2" type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-3.349 1.842-2.816 6.61.57 8.64z"/>
              </svg>
              Apple
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center flex flex-col">
          <p className="text-sm text-gray-500 mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* Guest login button that leads to onboarding */}
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={continueAsGuest}
          >
            Continue as Guest
          </Button>

          {/* Reset button - clears all storage and reloads the page */}
          <Button
            variant="ghost"
            className="mt-4 text-red-500"
            onClick={resetApplication}
          >
            Reset Application
          </Button>
          
          {/* Direct access for development */}
          <Button
            variant="link"
            className="mt-2 text-xs text-gray-400"
            onClick={() => window.location.href = "/loading-test"}
          >
            View Loading Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}