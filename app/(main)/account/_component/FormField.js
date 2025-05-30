import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function FormField({
  id,
  label,
  type = "text",
  placeholder,
  defaultValue,
  required = false,
  icon,
  isTextarea = false,
  className = "",
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        {isTextarea ? (
          <Textarea
            id={id}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className={`resize-none ${icon ? "pl-9 pt-3" : ""}`}
            rows={3}
          />
        ) : (
          <Input
            id={id}
            type={type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className={icon ? "pl-9" : ""}
            required={required}
          />
        )}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
