import { createContext, useContext, useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "./AuthContext";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [examCenter, setExamCenter] = useState([]);
  const [counsellor, setCounsellor] = useState([]);
  const [counsellorBranch, setCounsellorBranch] = useState([]);
  const { user } = useAuth();
  const getDistinctBranches = (branchList) => {
    const distinctBranches = [];
    const seenBranches = new Set();
    branchList.forEach((item) => {
      if (item.value && !seenBranches.has(item.value)) {
        seenBranches.add(item.value);
        distinctBranches.push(item);
      }
    });
    return distinctBranches;
  };

  const getExamCenter = async () => {
    try {
      const response = await api.get("/admin/getExamCenters");

      const formattedExamCenters = response.data.data.map((centre) => ({
        value: centre.centerId,
        label: centre.centerName,
      }));

      setExamCenter(formattedExamCenters);
    } catch (error) {
      console.error("Error fetching exam center", error);
    }
  };

  const getCounsellor = async () => {
    try {
      let people = [];
      if (user?.role === "sub-admin") {
        const response = await api.get("/admin/myTeam");
        people = [response.data?.data?.me, ...(response.data?.data?.members || [])].filter(Boolean);
      } else {
        const response = await api.get("/admin/getUser");
        people = response.data.data;
      }

      const formattedCounsellors = people.map((person) => ({
        value: person.uuid,
        label: person.name,
      }));
      const formattedBranches = people.map((person) => ({
        value: person.counsellorBranch,
        label: person.counsellorBranch,
      }));
      setCounsellorBranch(getDistinctBranches(formattedBranches));
      setCounsellor(formattedCounsellors);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role !== "counsellor" && user.role !== "ca") getCounsellor();
      if (user.role !== "ca") getExamCenter();
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{ examCenter, getExamCenter, counsellor, getCounsellor, counsellorBranch }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
