import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function ProfilePicture({ src, alt, fallback }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pb-6 border-b">
      <Avatar className="w-20 h-20 border-4 border-background">
        <AvatarImage src={src || "/placeholder.svg"} alt={alt} />
        <AvatarFallback className="text-lg font-medium">{fallback}</AvatarFallback>
      </Avatar>

      <div className="space-y-2 flex-1">
        <h4 className="font-medium">Profile Picture</h4>
        <p className="text-sm text-muted-foreground">Upload a new profile picture. Recommended size: 300x300px.</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Upload New
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
