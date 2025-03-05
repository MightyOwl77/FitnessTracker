import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-data";
import { calculateBMR, calculateTDEE } from "@/lib/fitness-calculations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Form schema for user data
const formSchema = z.object({
  age: z.coerce.number().int().min(18, "Must be at least 18 years old").max(120, "Must be at most 120 years old"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender",
  }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"], {
    required_error: "Please select an activity level",
  }),
});

export default function UserData() {
  const [location, setLocation] = useLocation();
  const { profileData, isLoading, saveProfile, isSaving } = useUserProfile();
  const [bmr, setBmr] = useState<number | null>(null);
  const [showBmrResult, setShowBmrResult] = useState(false);

  // Set up form with existing profile data or defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: profileData?.age || 30,
      gender: (profileData?.gender as "male" | "female") || "male",
      height: profileData?.height || 175,
      weight: profileData?.weight || 75,
      activityLevel: (profileData?.activityLevel as "sedentary" | "lightly" | "moderately" | "very") || "moderately",
    },
  });

  // Update form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      form.reset({
        age: profileData.age,
        gender: profileData.gender as "male" | "female",
        height: profileData.height,
        weight: profileData.weight,
        activityLevel: profileData.activityLevel as "sedentary" | "lightly" | "moderately" | "very",
      });
      setBmr(profileData.bmr);
    }
  }, [profileData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Calculate BMR
    const calculatedBmr = calculateBMR(
      values.weight,
      values.height,
      values.age,
      values.gender
    );
    
    // Calculate TDEE based on activity level
    const tdee = calculateTDEE(calculatedBmr, values.activityLevel);
    
    setBmr(tdee);
    setShowBmrResult(true);
    
    // Save profile data
    await saveProfile({
      ...values,
      bmr: tdee,
    });
    
    // Navigate to goals page after a short delay
    setTimeout(() => {
      setLocation("/set-goals");
    }, 1500);
  };

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-xl mb-4 text-neutral-800">Basic Information</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="175" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="75.5" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Activity Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your typical activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                          <SelectItem value="lightly">Lightly active (light exercise/sports 1-3 days/week)</SelectItem>
                          <SelectItem value="moderately">Moderately active (moderate exercise/sports 3-5 days/week)</SelectItem>
                          <SelectItem value="very">Very active (hard exercise/sports 6-7 days/week)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showBmrResult && bmr && (
                <div className="bg-neutral-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-neutral-700">Your Basal Metabolic Rate (BMR)</h3>
                      <p className="text-sm text-neutral-500">Calories your body needs at complete rest</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-primary-600">{bmr.toLocaleString()}</span>
                      <span className="text-sm text-neutral-500">calories/day</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSaving}
              >
                {isSaving ? "Calculating..." : "Calculate BMR & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="bg-neutral-100 rounded-lg p-5 text-sm border border-neutral-200">
        <h3 className="font-medium text-neutral-700 mb-2 flex items-center">
          <InfoIcon className="h-4 w-4 mr-1 text-primary-500" /> About BMR
        </h3>
        <p className="text-neutral-600">
          Basal Metabolic Rate (BMR) is the number of calories your body needs to maintain basic functions while at rest. 
          We calculate this using the Mifflin-St Jeor formula, which is considered one of the most accurate methods.
        </p>
      </div>
    </div>
  );
}
