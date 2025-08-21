import YourDrafts from "@/components/drafts/YourDrafts";
import NewAppLayout from "@/components/layout/NewAppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function YourDraftsPage() {
  return (
    <ProtectedRoute>
      <NewAppLayout>
        <YourDrafts />
      </NewAppLayout>
    </ProtectedRoute>
  );
}
