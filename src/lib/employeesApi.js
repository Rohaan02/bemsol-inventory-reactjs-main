import api from "./axiosConfig";

const employeesApi = {
  getAll: async () => {
    try {
      // Remove extra quote from endpoint
      const res = await api.get("/employees");
      return res.data;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to fetch employees");
    }
  },
};

export default employeesApi;
