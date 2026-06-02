import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return '';
}

export default function UserAvatar({
  avatarUrl,
  name,
  email,
  size = 'md',
  className = ''
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  const textSize = textSizes[size];
  const initials = getInitials(name, email);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  const hasValidUrl = avatarUrl && avatarUrl.trim().length > 0;

  if (hasValidUrl && !imageError) {
    return (
      <img
        key={avatarUrl}
        src={avatarUrl}
        alt={name || email || 'User avatar'}
        className={`${sizeClass} rounded-xl object-cover flex-shrink-0 shadow-md border-2 border-white ${className}`}
        onError={handleImageError}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`${sizeClass} bg-gradient-to-br from-[#0067FF] to-[#0052CC] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${className}`}
        title={name || email || undefined}
      >
        <span className={`${textSize} font-bold text-white`}>{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${className}`}
    >
      <User className={`${iconSize} text-white`} />
    </div>
  );
}
