import { useEffect, useState } from "react";
import videoApi from "../videoApi";

// All standards for the video module (active and inactive — video-only standards are kept
// inactive so registration never shows them). Options for selects: { label, value }.
export const useVideoStandards = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videoApi
      .get("/admin/standards")
      .then((res) => setStandards(res.data.standards || []))
      .catch(() => setStandards([]))
      .finally(() => setLoading(false));
  }, []);

  const options = standards.map((s) => ({ label: s.name, value: s.id }));
  return { standards, options, loading };
};
