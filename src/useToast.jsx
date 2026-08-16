import { useCallback } from "react";
import { toast } from "react-toastify";

export const useToast = () => {
    const successToast = useCallback((msg) => {
        toast.success(msg);
    }, [])

    const infoToast = useCallback((msg) => {
        toast.info(msg);
    }, [])

    const errorToast = useCallback((msg) => {
        toast.error(msg);
    }, [])

    const warnToast = useCallback((msg) => {
        toast.warn(msg);
    }, [])

    const defaultToast = useCallback((msg) => {
        toast.default(msg);
    }, [])

    return { successToast, infoToast, errorToast, warnToast, defaultToast };
}