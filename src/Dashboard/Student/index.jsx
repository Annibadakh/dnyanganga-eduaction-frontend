import React from "react";
import StudentQuizList from "./StudentQuizList";
import { Route, Routes } from "react-router-dom";

const index = () => {
  return (
    // <div>
    //   <h1>Student Dashboard</h1>
    //   <StudentQuizList />
    // </div>
    <Routes>
      <Route index element={<StudentQuizList />} />
      <Route path="play/:quizId" element={<StudentQuizPlay />} />
    </Routes>
  );
};

export default index;
