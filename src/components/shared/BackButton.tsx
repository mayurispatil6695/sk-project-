import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1)}
      className="mb-4 flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
};