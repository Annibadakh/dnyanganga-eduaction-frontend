import { useState } from "react";
import api from "../../Api";
import Button from "../Generic/Button";

const AddChapterModal = ({ isOpen, onClose, subjectId, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name) return alert("Chapter name required");

    try {
      setLoading(true);

      await api.post("/question-bank/chapter", {
        name,
        subjectId,
      });

      setName("");
      onSuccess(); // refresh list
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add chapter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">Add Chapter</h2>

        <input
          type="text"
          placeholder="Enter chapter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="success" onClick={handleSubmit} loading={loading}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddChapterModal;
