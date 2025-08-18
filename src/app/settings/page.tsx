import NewAppLayout from "@/components/layout/NewAppLayout";
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <NewAppLayout>
        <SettingsPageContent />
      </NewAppLayout>
    </ProtectedRoute>
  );
}