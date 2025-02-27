
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BackButton = () => {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <Button
      variant="ghost"
      onClick={goBack}
      className="p-2 hover:bg-gray-100 rounded-full"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

export default BackButton;
