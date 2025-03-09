
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

const preferencesSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  dietaryPreference: z.enum(["standard", "vegan", "vegetarian", "keto", "paleo", "mediterranean"]),
  trainingAccess: z.enum(["gym", "home", "both"]),
  healthConsiderations: z.string().optional()
});

type PreferencesData = z.infer<typeof preferencesSchema>;

export default function PreferencesStep({
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
  const preferencesFormDefaults = {
    fitnessLevel: "intermediate" as const,
    dietaryPreference: "standard" as const,
    trainingAccess: "both" as const,
    healthConsiderations: "",
  };

  const form = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      fitnessLevel: profileData?.fitnessLevel || preferencesFormDefaults.fitnessLevel,
      dietaryPreference: profileData?.dietaryPreference || preferencesFormDefaults.dietaryPreference,
      trainingAccess: profileData?.trainingAccess || preferencesFormDefaults.trainingAccess,
      healthConsiderations: profileData?.healthConsiderations || preferencesFormDefaults.healthConsiderations
    },
    mode: "onBlur"
  });

  const handleSubmit = async (data: PreferencesData) => {
    try {
      await saveProfile({
        ...profileData,
        fitnessLevel: data.fitnessLevel,
        dietaryPreference: data.dietaryPreference,
        trainingAccess: data.trainingAccess,
        healthConsiderations: data.healthConsiderations
      });
      localStorage.setItem("hasCompletedOnboarding", "true");
      onNext();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">Your Preferences</h2>
      <p className="text-muted-foreground mb-6">Customize your experience to suit your lifestyle.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Level</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
            <FormField
              control={form.control}
              name="healthConsiderations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Considerations (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Any injuries or conditions" {...field} aria-label="Health Considerations" />
                  </FormControl>
                  <FormDescription>Information that may affect your workout plan</FormDescription>
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
