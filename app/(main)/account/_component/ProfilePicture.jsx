import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfilePicture({ src, alt, fallback }) {
  const [preview, setPreview] = useState(src || "/placeholder.svg");
  const fileInputRef = useRef(null);

  // Update preview if src changes from outside
  useEffect(() => {
    setPreview(src || "/placeholder.svg");
  }, [src]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-6 border-b">
      <Avatar
        className="w-20 h-20 border-4 border-background cursor-pointer"
        onClick={triggerFileInput}
        aria-label="Click to upload profile picture"
      >
        <AvatarImage src={preview} alt={alt} />
        <AvatarFallback className="text-lg font-medium">{fallback}</AvatarFallback>
      </Avatar>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        name="profilePicture"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-2 flex-1">
        <h4 className="font-medium">Profile Picture</h4>
        <p className="text-sm text-muted-foreground">
          Upload a new profile picture. Recommended size: 300x300px.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" type="button" onClick={triggerFileInput}>
            Upload New
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            type="button"
            onClick={() => {
              setPreview("/placeholder.svg");
              // Clear file input value to allow re-uploading same file if needed
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
