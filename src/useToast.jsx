import { toast } from "react-toastify";

export const useToast = () => {
    const successToast = (msg) => {
        toast.success(msg);
    }

    const infoToast = (msg) => {
        toast.info(msg);
    }

    const errorToast = (msg) => {
        toast.error(msg);
    }

    const warnToast = (msg) => {
        toast.warn(msg);
    }

    const defaultToast = (msg) => {
        toast.default(msg);
    }

    return { successToast, infoToast, errorToast, warnToast, defaultToast };
}
