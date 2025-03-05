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
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(18, "Must be at least 18 years old").max(120, "Must be at most 120 years old"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"], {
    required_error: "Please select an activity level",
  }),
  bodyFatPercentage: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
});

export default function UserData() {
  const [location, setLocation] = useLocation();
  const { profileData, isLoading, saveProfile, isSaving } = useUserProfile();
  const [bmr, setBmr] = useState<number | null>(null);
  const [showBmrResult, setShowBmrResult] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profileData?.name || "",
      age: profileData?.age || 30,
      gender: (profileData?.gender as "male" | "female" | "other") || "male",
      height: profileData?.height || 175,
      weight: profileData?.weight || 75,
      activityLevel: (profileData?.activityLevel as "sedentary" | "light" | "moderate" | "active" | "veryActive") || "moderate",
      bodyFatPercentage: profileData?.bodyFatPercentage,
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset(profileData);
      setBmr(profileData.bmr);
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
      setLocation("/goals");
    }, 1500);
  };

  const bodyFatPercentage = form.watch('bodyFatPercentage');
  const weight = form.watch('weight');
  const height = form.watch('height');

  const bodyStats = calculateBodyStats(weight, bodyFatPercentage);
  const bmi = height ? calculateBMI(weight, height) : undefined;

  const calculateBodyStats = (weight: number, bodyFatPercentage?: number) => {
    if (!bodyFatPercentage) return {};
    const leanMass = calculateLeanMass(weight, bodyFatPercentage);
    const fatMass = weight - leanMass;
    return { leanMass, fatMass };
  };


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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="Your age" required />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                        <Input type="number" {...field} placeholder="Your height in cm" required />
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
                        <Input type="number" step="0.1" {...field} placeholder="Your current weight" required />
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
                        <Input type="number" step="0.1" {...field} placeholder="Your body fat percentage" />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                          <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="veryActive">Very active (very hard exercise & physical job)</SelectItem>
                        </SelectContent>
                      </Select>
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