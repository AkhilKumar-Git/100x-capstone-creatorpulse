import { useState, useEffect } from "react";
import { CustomButton } from "@/components/ui/custom-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StyleSample } from "@/lib/database.types";

interface StyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style?: StyleSample | null;
  onSave: (data: { content: string; platform: string }) => Promise<void>;
  mode: "add" | "edit";
}

export function StyleDialog({
  open,
  onOpenChange,
  style,
  onSave,
  mode,
}: StyleDialogProps) {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (style && mode === "edit") {
      setContent(style.raw_text);
      setPlatform(style.platform);
    } else {
      setContent("");
      setPlatform("instagram");
    }
  }, [style, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !platform) return;

    setIsLoading(true);
    try {
      await onSave({ content: content.trim(), platform });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving style:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Style" : "Edit Style"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new style sample to your collection. This will be embedded and stored for future reference."
              : "Update your style sample content and platform."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Style Content</Label>
            <div className="relative">
              <Textarea
                id="content"
                placeholder="Enter your style sample content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none h-32 overflow-y-auto"
                required
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This content will be embedded using AI to capture your writing style.
            </p>
          </div>

          <DialogFooter>
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? "Saving..." : mode === "add" ? "Add Style" : "Update Style"}
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
