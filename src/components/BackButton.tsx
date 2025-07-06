import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
}

const BackButton = ({ to, className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
};

export default BackButton;