import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RotateCw } from "lucide-react";

const ImageViewerModal = ({
    isOpen,
    onClose,
    imageUrl,
    title = "Image Preview",
    minHeight = "600px",
}) => {
    const [rotation, setRotation] = useState(0);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleClose = () => {
        setRotation(0); // reset rotation
        onClose();
    };

    if (!imageUrl) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>

                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </Transition.Child>

                {/* Modal */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-2 text-center">

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white md:p-6 p-2 text-left shadow-xl transition-all">

                                {/* Title */}
                                <Dialog.Title className="text-lg font-medium text-gray-900">
                                    {title}
                                </Dialog.Title>

                                {/* Rotate Button */}
                                <button
                                    onClick={handleRotate}
                                    className="absolute top-5 right-6 rounded-full bg-gray-100 hover:bg-gray-200 p-2"
                                    title="Rotate Image"
                                >
                                    <RotateCw className="w-5 h-5 text-gray-700" />
                                </button>

                                {/* Image */}
                                <div className="mt-6 flex justify-center overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-auto object-contain rounded border transition-transform duration-300"
                                        style={{
                                            minHeight,
                                            transform: `rotate(${rotation}deg)`,
                                        }}
                                    />
                                </div>

                                {/* Footer */}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleClose}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Close
                                    </button>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ImageViewerModal;