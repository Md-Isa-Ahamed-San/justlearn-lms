"use client";
import * as z from "zod";
// import axios from "axios"; // You'll likely need this for the actual API call
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription, // Optional: if you want to add a description under the label
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for description
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// 1. Update Zod schema
const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required!",
  }),
  description: z.string().min(1, { // Assuming description is also required
    message: "Description is required!",
  }),
});

const AddQuizSet = () => {
  const router = useRouter();

  // 2. Update defaultValues
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "", // Add default for description
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.post("/api/quiz-sets", values);
      // router.push(`/instructor-dashboard/quiz-sets/${response.data.id}`);
      console.log("Form values:", values); // For now, just log
      router.push(`/instructor-dashboard/quiz-sets/${1}`); // Placeholder ID
      toast.success("Quiz Set Created");
    } catch (error) {
      console.error("Error creating quiz set:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
      <div className="max-w-full w-[536px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8"
          >
            {/* title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Set Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g 'Chapter 1: Introduction to Algebra'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Add FormField for description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Set Description</FormLabel>
                  <FormControl>
                    <Textarea // Using Textarea for potentially longer descriptions
                      disabled={isSubmitting}
                      placeholder="e.g 'A comprehensive quiz covering the fundamental concepts of algebra...'"
                      rows={5} // Optional: suggest a number of rows
                      {...field}
                    />
                  </FormControl>
                  {/* Optional: Add a FormDescription if needed */}
                  {/* <FormDescription>
                    Provide a brief overview of what this quiz set covers.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Link href="/instructor-dashboard/quiz-sets">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddQuizSet;