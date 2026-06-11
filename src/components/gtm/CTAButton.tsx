import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { track } from '../../lib/gtm-analytics';

interface CTAButtonProps {
  text: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  trackEvent?: string;
  className?: string;
}

export default function CTAButton({ text, to, href, onClick, variant = 'primary', size = 'md', trackEvent: eventName, className = '' }: CTAButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-navy-900 border-2 border-navy-200 hover:border-teal-600 hover:text-teal-700',
    outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const handleClick = () => {
    if (eventName) track(eventName, { cta_text: text });
    onClick?.();
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={handleClick}>
        {text}
        <ArrowRight className="w-4 h-4" />
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} onClick={handleClick}>
        {text}
        <ArrowRight className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={handleClick}>
      {text}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}
