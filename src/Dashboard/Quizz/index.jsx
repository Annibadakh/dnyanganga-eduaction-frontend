import React from "react";
import { Route, Routes } from "react-router-dom";
import QuizList from "./QuizList";
import QuizCreate from "./QuizCreate";
import QuizDetails from "./QuizDetails";
import QuizAnalytics from "./QuizAnalytics";
import StudentQuizResult from "./Studentquizresult";

const index = () => {
  return (
    <Routes>
      <Route index element={<QuizList />} />
      <Route path="create" element={<QuizCreate />} />
      <Route path=":id/analytics" element={<QuizAnalytics />} />
      <Route path=":id" element={<QuizDetails />} />
      <Route
        path=":id/attempt/:studentQuizId"
        element={<StudentQuizResult />}
      />
    </Routes>
  );
};

export default index;
