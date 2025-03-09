import { UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ProfileFormProps {
  form: UseFormReturn<any>;
  onNext: (data: any) => void;
  onPrev: () => void;
  isSaving?: boolean;
  stepTitle: string;
  stepDescription: string;
}

export function ProfileForm({ 
  form, 
  onNext, 
  onPrev, 
  isSaving = false,
  stepTitle,
  stepDescription 
}: ProfileFormProps) {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{stepTitle}</h2>
      <p className="text-muted-foreground mb-6">{stepDescription}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}