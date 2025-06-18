"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUserData } from "../../../../provider/user-data-provider";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required!",
  }),
  description: z.string().min(1, {
    message: "Description is required!",
  }),
});

const AddQuizSet = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const {userData} = useUserData()

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    let instructorId = userData?.userData?.id
    let payloads = {...values,instructorId}
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloads),
      });

      if (!response.ok) {
 
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json(); // Parse the JSON response from the API

      if (responseData && responseData.id) {
        toast.success("Quiz Set Created!");
        router.push(`/instructor-dashboard/quiz-sets/${responseData.id}`); // Use the ID from the API response
      } else {
        // This case should ideally not happen if the API is well-behaved on success
        console.error("API response missing ID:", responseData);
        toast.error("Quiz Set created, but failed to get ID for redirection.");
      }

    } catch (error) {
      console.error("Error creating quiz set:", error);
      toast.error(error.message || "Something went wrong while creating the quiz set.");
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Set Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g 'A comprehensive quiz covering the fundamental concepts of algebra...'"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
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