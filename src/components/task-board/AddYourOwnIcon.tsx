
import { Plus } from "lucide-react";

interface AddYourOwnIconProps {
  size?: number;
}

const AddYourOwnIcon = ({ size = 24 }: AddYourOwnIconProps) => {
  return (
    <div className="bg-gradient-to-tr from-purple-100 to-purple-200 rounded-full p-1 flex items-center justify-center">
      <Plus size={size} className="text-purple-600" />
    </div>
  );
};

export default AddYourOwnIcon;
