"use client";
import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { createCourse } from "@/app/actions/course";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required!",
  }),
  description: z.string().min(1, {
    message: "Description is required!",
  }),
  subtitle: z.string().optional(),
  thumbnail: z.string().optional(),
  code: z.string().min(1, {
    message: "Course code is required!",
  }),
  visibility: z.enum(["public", "private"]).default("private"),
  categoryId: z.string().min(1, {
    message: "Category is required!",
  }),
  active: z.boolean().default(false),
  learning: z.array(z.string()).default([]),
});

const AddCourse = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [learningOutcomes, setLearningOutcomes] = useState([""]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subtitle: "",
      thumbnail: "",
      code: "",
      visibility: "private",
      categoryId: "",
      active: false,
      learning: [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Replace with your actual API endpoint to fetch categories
        const response = await fetch("/api/category");
        // console.log(" fetchCategories ~ response:", response)
        const categories = await response.json();
        console.log(" fetchCategories ~ categories:", categories)
        // setCategories(data);
        
        // Mock data - replace with actual API call
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const addLearningOutcome = () => {
    setLearningOutcomes([...learningOutcomes, ""]);
  };

  const removeLearningOutcome = (index) => {
    const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setLearningOutcomes(newOutcomes);
    form.setValue("learning", newOutcomes.filter(outcome => outcome.trim()));
  };

  const updateLearningOutcome = (index, value) => {
    const newOutcomes = [...learningOutcomes];
    newOutcomes[index] = value;
    setLearningOutcomes(newOutcomes);
    form.setValue("learning", newOutcomes.filter(outcome => outcome.trim()));
  };

  const onSubmit = async (values) => {
    try {
      // Filter out empty learning outcomes
      const filteredLearning = learningOutcomes.filter(outcome => outcome.trim());
      const courseData = {
        ...values,
        learning: filteredLearning,
      };
      
      const course = await createCourse(courseData);
      router.push(`/dashboard/courses/${course?._id}`);
      toast.success("Course created successfully");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full p-6">
      <div className="max-w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-8"
          >
            {/* Two column grid for main fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g 'Reactive Accelerator'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* subtitle */}
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g 'Master React from basics to advanced'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* course code */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g 'REACT-001'"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for your course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Course overview"
                          className="resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Write a brief description of your course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* visibility */}
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Private courses are only visible to you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* thumbnail */}
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a thumbnail image for your course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Full width learning outcomes section */}
            <div className="space-y-4">
              <FormLabel>Learning Outcomes</FormLabel>
              <FormDescription>
                What will students learn from this course?
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      disabled={isSubmitting}
                      placeholder={`Learning outcome ${index + 1}`}
                      value={outcome}
                      onChange={(e) => updateLearningOutcome(index, e.target.value)}
                    />
                    {learningOutcomes.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLearningOutcome(index)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLearningOutcome}
                disabled={isSubmitting}
              >
                Add Learning Outcome
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-x-2 pt-4">
              <Link href="/dashboard/courses">
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

export default AddCourse;