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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
  bodyFatPercentage: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  dietaryPreference: z.enum(["standard", "vegan", "vegetarian", "keto", "paleo", "mediterranean"]).optional(),
  trainingAccess: z.enum(["gym", "home", "both"]).optional(),
  healthConsiderations: z.string().optional(),
});

export default function UserData() {
  const [location, setLocation] = useLocation();
  const { profileData, isLoading, saveProfile, isSaving } = useUserProfile();
  const [bmr, setBmr] = useState<number | null>(null);
  const [showBmrResult, setShowBmrResult] = useState(false);

  // Set default values for the form initially
  const defaultValues = {
    age: 30,
    gender: "male" as "male" | "female",
    height: 175,
    weight: 75,
    activityLevel: "moderately" as "sedentary" | "lightly" | "moderately" | "very",
    bodyFatPercentage: undefined as number | undefined,
    fitnessLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
    dietaryPreference: "standard" as "standard" | "vegan" | "vegetarian" | "keto" | "paleo" | "mediterranean",
    trainingAccess: "both" as "gym" | "home" | "both",
    healthConsiderations: ""
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (profileData) {
      form.reset(profileData);
      if (profileData.bmr) {
        setBmr(profileData.bmr);
      }
    }
  }, [profileData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const calculatedBmr = calculateBMR(
      values.weight,
      values.height,
      values.age,
      values.gender
    );

    setBmr(calculatedBmr);
    setShowBmrResult(true);

    await saveProfile({
      ...values,
      bmr: calculatedBmr,
    });

    setTimeout(() => {
      setLocation("/set-goals");
    }, 1500);
  };

  const calculateBodyStats = (weight: number, bodyFatPercentage?: number) => {
    if (!bodyFatPercentage) return {};
    const leanMass = calculateLeanMass(weight, bodyFatPercentage);
    const fatMass = weight - leanMass;
    return { leanMass, fatMass };
  };

  const bodyFatPercentage = form.watch('bodyFatPercentage');
  const weight = form.watch('weight');
  const height = form.watch('height');

  const bodyStats = calculateBodyStats(weight, bodyFatPercentage);
  const bmi = height ? calculateBMI(weight, height) : undefined;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <p className="text-gray-600 mb-6">Update your personal information to get accurate recommendations</p>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Your age" 
                          required 
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
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
                        value={field.value} 
                        onValueChange={field.onChange}
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
                          placeholder="Your height in cm" 
                          required 
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
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
                          placeholder="Your current weight" 
                          required 
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          placeholder="Your body fat percentage"
                          value={field.value || ''} 
                          onChange={(e) => {
                            const val = e.target.value !== '' ? parseFloat(e.target.value) : undefined;
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
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
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                          <SelectItem value="lightly">Lightly active (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderately">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="very">Very active (hard exercise/physical job)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fitnessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitness Level</FormLabel>
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
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
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dietary preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                          <SelectItem value="paleo">Paleo</SelectItem>
                          <SelectItem value="mediterranean">Mediterranean</SelectItem>
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
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select training access" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gym">Gym Only</SelectItem>
                          <SelectItem value="home">Home Only</SelectItem>
                          <SelectItem value="both">Both Gym and Home</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="healthConsiderations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Considerations (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List any injuries, conditions, or health concerns"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-8">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}