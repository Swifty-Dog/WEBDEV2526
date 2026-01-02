import { useContext, useEffect } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

export function useNavigationBlocker(shouldBlock: boolean, onAttemptNavigate: (to?: string) => void) {
    const navigator = useContext(UNSAFE_NavigationContext).navigator;

    useEffect(() => {
        if (!shouldBlock) return;

        const originalPush = navigator.push;

        navigator.push = (to: string) => {
            onAttemptNavigate(to);
        };

        return () => {
            navigator.push = originalPush;
        };
    }, [shouldBlock, onAttemptNavigate, navigator]);
}
