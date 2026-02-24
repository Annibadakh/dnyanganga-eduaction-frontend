import { createContext, useEffect, useState } from "react";
import api from "../Api";


export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const [examCenter, setExamCenter] = useState([]);
    const [counsellor, setCounsellor] = useState([]);

    const getExamCenter = async () => {
        try {
            const response = await api.get("/admin/getExamCenters");
            setExamCenter(response.data.data)
        } catch (error) {
            console.error("Error fetching exam center", error);

        }
    }

    const getCounsellor = async () => {
        try {
            const response = await api.get("/admin/getUser");
            setCounsellor(response.data.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    useEffect(() => {
        getExamCenter();
        getCounsellor();
    }, [])

    return (
        <DashboardContext.Provider value={{ examCenter, getExamCenter, counsellor, getCounsellor }}>
            {children}
        </DashboardContext.Provider>
    )
}