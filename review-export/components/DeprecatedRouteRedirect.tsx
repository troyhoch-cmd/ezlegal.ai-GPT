import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { logDeprecationHit } from '../services/ui-preferences-service';

interface Props {
  to: string;
  oldPath: string;
}

export default function DeprecatedRouteRedirect({ to, oldPath }: Props) {
  const location = useLocation();

  useEffect(() => {
    logDeprecationHit(oldPath);
  }, [oldPath]);

  const target = to + location.search + location.hash;
  return <Navigate to={target} replace />;
}
