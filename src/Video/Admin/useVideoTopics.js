import { useCallback, useEffect, useState } from "react";
import videoApi from "../videoApi";

// All video topics (active and inactive) with their standard and video count.
// Used by the Topic filter, the Add Topic list and the topic selects of upload / edit.
export const useVideoTopics = () => {
  const [topics, setTopics] = useState([]);

  const reload = useCallback(
    () =>
      videoApi
        .get("/admin/topics")
        .then((res) => setTopics(res.data.topics || []))
        .catch(() => setTopics([])),
    [],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { topics, reload };
};

// Topic options of one standard for a select. Only active topics can be picked,
// except the one the video already has (keepId), shown with "(inactive)".
export const topicOptionsFor = (topics, standardId, keepId = null) =>
  topics
    .filter((t) => String(t.standardId) === String(standardId))
    .filter((t) => t.isActive || String(t.id) === String(keepId))
    .map((t) => ({ value: t.id, label: t.isActive ? t.title : `${t.title} (inactive)` }));
