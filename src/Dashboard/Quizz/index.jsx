import React from "react";
import { Route, Routes } from "react-router-dom";
import QuizList from "./QuizList";
import QuizCreate from "./QuizCreate";
import QuizDetails from "./QuizDetails";
import QuizAnalytics from "./QuizAnalytics";

const index = () => {
  return (
    <Routes>
      <Route index element={<QuizList />} />
      <Route path="create" element={<QuizCreate />} />
      <Route path=":id/analytics" element={<QuizAnalytics />} />
      <Route path=":id" element={<QuizDetails />} />
    </Routes>
  );
};

export default index;
