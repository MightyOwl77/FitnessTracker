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

interface PreferencesFormProps {
  form: UseFormReturn<any>;
  onNext: (data: any) => void;
  onPrev: () => void;
  isSaving?: boolean;
  stepTitle: string;
  stepDescription: string;
}

export function PreferencesForm({
  form,
  onNext,
  onPrev,
  isSaving = false,
  stepTitle,
  stepDescription
}: PreferencesFormProps) {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-2">{stepTitle}</h2>
      <p className="text-muted-foreground mb-6">{stepDescription}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
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
                    <Input type="text" placeholder="Any injuries or conditions" {...field} />
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}