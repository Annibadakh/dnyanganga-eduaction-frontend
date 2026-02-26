import { createContext, useEffect, useState } from "react";
import api from "../Api";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [examCenter, setExamCenter] = useState([]);
  const [counsellor, setCounsellor] = useState([]);
  const [counsellorBranch, setCounsellorBranch] = useState([]);

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
      // console.log(response.data.data);

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
      const response = await api.get("/admin/getUser");
    
      const formattedCounsellors = response.data.data.map((user) => ({
        value: user.uuid,
        label: user.name,
      }));
      const formattedBranches = response.data.data.map((user) => ({
        value: user.counsellorBranch,
        label: user.counsellorBranch,
      }));
      setCounsellorBranch(getDistinctBranches(formattedBranches));
      setCounsellor(formattedCounsellors);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    getExamCenter();
    getCounsellor();
  }, []);

  return (
    <DashboardContext.Provider
      value={{ examCenter, getExamCenter, counsellor, getCounsellor, counsellorBranch }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
