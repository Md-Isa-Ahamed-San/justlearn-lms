"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Pencil, Upload, X, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {uploadToCloudinary} from "@/utils/uploadToCloudinary";


const attachmentsFormSchema = z.object({
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
});

export const LessonAttachmentsForm = ({ initialData, courseId, lessonId }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [attachments, setAttachments] = useState(initialData?.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(attachmentsFormSchema),
    defaultValues: {
      attachments: initialData?.attachments || [],
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    try {
      // Update form values with current attachments state
      const payload = {
        attachments: attachments
      };

      // API call to update lesson attachments
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/attachments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update attachments");
      }

      toast.success("Lesson attachments updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error updating attachments:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const newAttachments = [];

    try {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `${Date.now()}-${i}`;

        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { name: file.name, progress: 0 }
        }));

        try {
          // Upload to Cloudinary
          const uploadedUrl = await uploadToCloudinary(file);

          // Determine file type based on file extension
          const fileType = getFileType(file.name, file.type);

          // Create attachment object
          const newAttachment = {
            name: file.name,
            url: uploadedUrl,
            type: fileType,
          };

          newAttachments.push(newAttachment);

          // Update progress to complete
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { name: file.name, progress: 100 }
          }));

        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);

          // Remove from progress
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      }

      // Add all successfully uploaded attachments
      if (newAttachments.length > 0) {
        setAttachments(prev => [...prev, ...newAttachments]);
        toast.success(`Successfully uploaded ${newAttachments.length} file(s)`);
      }

    } catch (error) {
      console.error("Error in file upload process:", error);
      toast.error("Error uploading files");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      // Reset file input
      event.target.value = '';
    }
  };

  const getFileType = (fileName, mimeType) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Image files
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }

    // Document files
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'document';
    }

    // Default to file
    return 'file';
  };

  const addAttachment = () => {
    const newAttachment = {
      name: "",
      url: "",
      type: "file",
    };
    setAttachments([...attachments, newAttachment]);
  };

  const removeAttachment = (index) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

  const updateAttachment = (index, field, value) => {
    const newAttachments = [...attachments];
    newAttachments[index][field] = value;
    setAttachments(newAttachments);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
      <div className="mt-6 border rounded-md p-4">
        <div className="font-medium flex items-center justify-between">
          Lesson Attachments
          <Button variant="ghost" onClick={toggleEdit}>
            {isEditing ? (
                <>Cancel</>
            ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Attachments
                </>
            )}
          </Button>
        </div>

        {!isEditing && (
            <div className={cn("text-sm mt-2", !attachments?.length && "text-slate-500 italic")}>
              {!attachments?.length ? (
                  "No attachments"
              ) : (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          {getFileIcon(attachment.type)}
                          <span className="flex-1">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">({attachment.type})</span>
                          {attachment.url && (
                              <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                View
                              </a>
                          )}
                        </div>
                    ))}
                  </div>
              )}
            </div>
        )}

        {isEditing && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

                {/* File Upload Section */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="h-4 w-4" />
                    <span className="font-medium">Upload Files</span>
                  </div>

                  <div className="space-y-3">
                    <Input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    {/* Upload Progress */}
                    {Object.keys(uploadProgress).length > 0 && (
                        <div className="space-y-2">
                          {Object.entries(uploadProgress).map(([fileId, progress]) => (
                              <div key={fileId} className="flex items-center gap-2 text-sm">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Uploading {progress.name}...</span>
                              </div>
                          ))}
                        </div>
                    )}

                    {isUploading && (
                        <div className="text-sm text-blue-600 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading files...
                        </div>
                    )}
                  </div>
                </div>

                {/* Manual Attachments Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Manual Attachments</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addAttachment}>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Manual Entry
                    </Button>
                  </div>

                  {attachments.map((attachment, index) => (
                      <div key={index} className="border rounded p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Attachment {index + 1}</h4>
                          <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                              placeholder="Attachment name"
                              value={attachment.name}
                              onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                          />
                          <Input
                              placeholder="Attachment URL"
                              value={attachment.url}
                              onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                          />
                          <Select
                              value={attachment.type}
                              onValueChange={(value) => updateAttachment(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="file">File</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                  ))}
                </div>

                <div className="flex items-center gap-x-2">
                  <Button
                      disabled={!isValid || isSubmitting || isUploading}
                      type="submit"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save
                  </Button>
                </div>
              </form>
            </Form>
        )}
      </div>
  );
};