import axios from "axios";


// Get token from sessionStorage
const getAuthToken = () => sessionStorage.getItem("user");


// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update with your API base URL
});

// Add Authorization header dynamically
api.interceptors.request.use(
    
  (config) => {
    const userString = getAuthToken();
    const user = JSON.parse(userString);
    console.log("token", user);

    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    console.log("congif",config)
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
