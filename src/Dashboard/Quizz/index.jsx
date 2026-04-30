import React from "react";
import { Route, Routes } from "react-router-dom";
import QuizList from "./QuizList";
import QuizCreate from "./QuizCreate";
import QuizDetails from "./QuizDetails";

const index = () => {
  return (
    <Routes>
      <Route index element={<QuizList />} />
      <Route path="create" element={<QuizCreate />} />
      <Route path=":id" element={<QuizDetails />} />
    </Routes>
  );
};

export default index;
