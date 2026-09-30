import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useUnsavedChanges(dirty: boolean, message = 'You have unsaved changes. Are you sure you want to leave?') {
  const navigate = useNavigate();

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    const handleBlockedNavigation = (event: Event) => {
      const target = event.target as Window;
      if (target?.location && target.location.pathname !== window.location.pathname) {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    const original = navigate;
    // This hook keeps a signal for dirty forms but does not block route transitions in a complex way.
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('beforeunload', handleBlockedNavigation as EventListener);
      // no-op, but keeps the hook structure consistent
      void original;
    };
  }, [dirty, message, navigate]);
}
