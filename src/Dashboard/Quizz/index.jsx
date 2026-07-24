import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import QuizList from "./QuizList";
import QuizCreate from "./QuizCreate";
import QuizDetails from "./QuizDetails";
import QuizAnalytics from "./QuizAnalytics";
import StudentQuizResult from "./Studentquizresult";

const QuizRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route index element={<QuizList />} />
      <Route
        path="create"
        element={
          user.role === "admin" ? <QuizCreate /> : <Navigate to="../" replace />
        }
      />
      <Route path=":id/analytics" element={<QuizAnalytics />} />
      <Route path=":id" element={<QuizDetails />} />
      <Route
        path=":id/attempt/:studentQuizId"
        element={<StudentQuizResult />}
      />
    </Routes>
  );
};

export default QuizRoutes;
