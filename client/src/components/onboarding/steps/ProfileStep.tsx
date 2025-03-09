
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { calculateBMR } from "@/lib/fitness-calculations";

const profileSchema = z.object({
  age: z.coerce.number().int().min(18, "Must be at least 18 years old").max(120, "Must be at most 120 years old"),
  gender: z.enum(["male", "female"], { required_error: "Please select a gender" }),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be at most 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be at most 300 kg"),
  bodyFatPercentage: z.coerce.number().min(3, "Body fat must be at least 3%").max(60, "Body fat must be at most 60%").optional(),
  activityLevel: z.enum(["sedentary", "lightly", "moderately", "very"], { required_error: "Please select an activity level" })
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfileStep({ 
  onNext, 
  onPrev, 
  profileData, 
  saveProfile 
}: { 
  onNext: () => void;
  onPrev: () => void;
  profileData: any;
  saveProfile: (data: any) => Promise<void>;
}) {
  const profileFormDefaults = {
    age: 30,
    gender: "male" as const,
    height: 175,
    weight: 76.5,
    bodyFatPercentage: undefined,
    activityLevel: "moderately" as const,
  };

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData || profileFormDefaults,
    mode: "onBlur"
  });

  const handleSubmit = async (data: ProfileData) => {
    try {
      const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
      await saveProfile({ ...data, bmr });
      onNext();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
      <p className="text-muted-foreground mb-6">This helps us calculate your energy needs accurately.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                    />
                  </FormControl>
                  <FormDescription>Leave blank if you don't know</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Activity Level</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <FormDescription>This is your day-to-day activity level excluding workouts</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
