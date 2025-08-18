import NewAppLayout from "@/components/layout/NewAppLayout";
import { StyleBoard } from "@/components/style-board/StyleBoard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function StyleBoardPage() {
  return (
    <ProtectedRoute>
      <NewAppLayout>
        <StyleBoard />
      </NewAppLayout>
    </ProtectedRoute>
  );
}