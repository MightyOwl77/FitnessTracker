import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, Activity, Utensils, Dumbbell } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-data";
import { calculateBMR, calculateLeanMass, calculateBMI } from "@/lib/fitness-calculations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Form schema for user data
const formSchema = z.object({
  // Basic Information
  age: z.coerce.number().int().min(18, "Must be at least 18 years old").max(120, "Must be at most 120 years old"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender",
  }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"], {
    required_error: "Please select an activity level",
  }),
  
  // Body Composition
  bodyFatPercentage: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
  
  // Fitness Level & Dietary Preferences
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your fitness level",
  }).optional(),
  dietaryPreference: z.enum(["standard", "vegan", "vegetarian", "keto", "paleo", "mediterranean"], {
    required_error: "Please select your dietary preference",
  }).optional(),
  trainingAccess: z.enum(["gym", "home", "both"], {
    required_error: "Please select your training access",
  }).optional(),
  healthConsiderations: z.string().max(500, "Health considerations must be at most 500 characters").optional(),
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
      // Basic info
      age: profileData?.age || 30,
      gender: (profileData?.gender as "male" | "female") || "male",
      height: profileData?.height || 175,
      weight: profileData?.weight || 75,
      activityLevel: (profileData?.activityLevel as "sedentary" | "lightly" | "moderately" | "very") || "moderately",
      
      // Body composition
      bodyFatPercentage: profileData?.bodyFatPercentage,
      
      // Fitness and diet preferences
      fitnessLevel: (profileData?.fitnessLevel as "beginner" | "intermediate" | "advanced") || "intermediate",
      dietaryPreference: (profileData?.dietaryPreference as "standard" | "vegan" | "vegetarian" | "keto" | "paleo" | "mediterranean") || "standard",
      trainingAccess: (profileData?.trainingAccess as "gym" | "home" | "both") || "both",
      healthConsiderations: profileData?.healthConsiderations || "",
    },
  });

  // Update form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      form.reset({
        // Basic info
        age: profileData.age,
        gender: profileData.gender as "male" | "female",
        height: profileData.height,
        weight: profileData.weight,
        activityLevel: profileData.activityLevel as "sedentary" | "lightly" | "moderately" | "very",
        
        // Body composition
        bodyFatPercentage: profileData.bodyFatPercentage,
        
        // Fitness and diet preferences
        fitnessLevel: (profileData.fitnessLevel as "beginner" | "intermediate" | "advanced") || "intermediate",
        dietaryPreference: (profileData.dietaryPreference as "standard" | "vegan" | "vegetarian" | "keto" | "paleo" | "mediterranean") || "standard",
        trainingAccess: (profileData.trainingAccess as "gym" | "home" | "both") || "both",
        healthConsiderations: profileData.healthConsiderations || "",
      });
      
      // Only set BMR if it's available and is a number
      if (profileData.bmr !== undefined && profileData.bmr !== null) {
        setBmr(profileData.bmr);
      }
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
    
    // Calculate additional metrics
    let leanMass: number | undefined = undefined;
    
    // Calculate lean mass if body fat percentage is provided
    if (values.bodyFatPercentage) {
      leanMass = calculateLeanMass(values.weight, values.bodyFatPercentage);
    }
    
    // We'll store the raw BMR, not the TDEE, since our calculations now use BMR × 1.55 explicitly
    setBmr(calculatedBmr);
    setShowBmrResult(true);
    
    // Save profile data with all metrics
    await saveProfile({
      ...values,
      bmr: calculatedBmr, // Store the raw BMR value
      leanMass, // Store the calculated lean mass if available
    });
    
    // Navigate to goals page after a short delay
    setTimeout(() => {
      setLocation("/goals");
    }, 1500);
  };

  // Calculate lean mass if body fat percentage is provided
  const calculateBodyStats = (weight: number, bodyFatPercentage?: number) => {
    if (!bodyFatPercentage) return {};
    
    const leanMass = calculateLeanMass(weight, bodyFatPercentage);
    const fatMass = weight - leanMass;
    
    return {
      leanMass,
      fatMass,
    };
  };

  // Calculate when the form changes
  const bodyFatPercentage = form.watch('bodyFatPercentage');
  const weight = form.watch('weight');
  const height = form.watch('height');
  
  // Calculate body stats
  const bodyStats = calculateBodyStats(weight, bodyFatPercentage);
  
  // Calculate BMI
  const bmi = height ? calculateBMI(weight, height) : undefined;
  
  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-heading font-semibold text-xl mb-4 text-neutral-800">User Profile</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="basic" className="flex items-center">
                    <InfoIcon className="h-4 w-4 mr-2" /> Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="body" className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" /> Body Composition
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center">
                    <Utensils className="h-4 w-4 mr-2" /> Preferences
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
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
                </TabsContent>
                
                <TabsContent value="body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bodyFatPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Body Fat % (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="15" 
                              {...field}
                              value={field.value || ''} 
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : Number(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            If you know your body fat percentage, enter it here for more accurate calculations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {bodyFatPercentage && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-neutral-100 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-neutral-700">Lean Mass</h3>
                            <p className="text-xl font-bold text-primary-600">{bodyStats.leanMass?.toFixed(1)} kg</p>
                            <p className="text-xs text-neutral-500">
                              {((bodyStats.leanMass || 0) / weight * 100).toFixed(1)}% of total weight
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-neutral-700">Fat Mass</h3>
                            <p className="text-xl font-bold text-orange-500">{(weight - (bodyStats.leanMass || 0)).toFixed(1)} kg</p>
                            <p className="text-xs text-neutral-500">
                              {bodyFatPercentage?.toFixed(1)}% of total weight
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {height && weight && (
                    <div className="mt-4">
                      <div className="bg-neutral-100 rounded-lg p-4">
                        <h3 className="font-medium text-neutral-700">Body Mass Index (BMI)</h3>
                        <p className="text-xl font-bold text-primary-600">{bmi?.toFixed(1)}</p>
                        <p className="text-xs text-neutral-500">
                          {bmi && bmi < 18.5 && "Underweight"}
                          {bmi && bmi >= 18.5 && bmi < 25 && "Normal weight"}
                          {bmi && bmi >= 25 && bmi < 30 && "Overweight"}
                          {bmi && bmi >= 30 && "Obese"}
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="preferences">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fitnessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your fitness level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner (new to working out)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (consistent for 6+ months)</SelectItem>
                              <SelectItem value="advanced">Advanced (training for 2+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dietaryPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Preference</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your dietary preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard (balanced diet)</SelectItem>
                              <SelectItem value="vegan">Vegan (no animal products)</SelectItem>
                              <SelectItem value="vegetarian">Vegetarian (no meat)</SelectItem>
                              <SelectItem value="keto">Keto (very low carb, high fat)</SelectItem>
                              <SelectItem value="paleo">Paleo (whole foods, no grains)</SelectItem>
                              <SelectItem value="mediterranean">Mediterranean (lean proteins, healthy fats)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trainingAccess"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training Access</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your training access" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gym">Gym (access to full equipment)</SelectItem>
                              <SelectItem value="home">Home (limited equipment)</SelectItem>
                              <SelectItem value="both">Both (gym and home workouts)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="healthConsiderations"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Health Considerations (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Any injuries, conditions, or limitations..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Let us know about any health issues that might affect your fitness plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {showBmrResult && bmr && (
                <div className="space-y-4">
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
                  
                  <div className="bg-primary-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-primary-700">Your Maintenance Calories</h3>
                        <p className="text-sm text-primary-500">BMR × 1.55 (Moderately Active Multiplier)</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-bold text-primary-600">{Math.round(bmr * 1.55).toLocaleString()}</span>
                        <span className="text-sm text-primary-500">calories/day</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSaving}
              >
                {isSaving ? "Calculating..." : "Save Profile & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="bg-neutral-100 rounded-lg p-5 text-sm border border-neutral-200">
        <h3 className="font-medium text-neutral-700 mb-2 flex items-center">
          <InfoIcon className="h-4 w-4 mr-1 text-primary-500" /> About BMR & Body Composition
        </h3>
        <p className="text-neutral-600 mb-2">
          Basal Metabolic Rate (BMR) is the number of calories your body needs to maintain basic functions while at rest. 
          We calculate this using the Mifflin-St Jeor formula, which is considered one of the most accurate methods.
        </p>
        <p className="text-neutral-600">
          Providing your body fat percentage allows us to create a more personalized plan that targets fat loss while preserving muscle mass.
        </p>
      </div>
    </div>
  );
}
