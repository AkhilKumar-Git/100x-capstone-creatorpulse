import PostEditor from "@/components/post-editor/PostEditor";
import NewAppLayout from "@/components/layout/NewAppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function PostEditorPage() {
  return (
    <ProtectedRoute>
      <NewAppLayout>
        <PostEditor />
      </NewAppLayout>
    </ProtectedRoute>
  );
}