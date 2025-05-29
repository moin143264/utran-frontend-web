import axios from "axios";
import { getToken } from "../utils/tokenStorage";
import { API_URL } from "../config";

// Create axios instance with base URL from config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] Success ${response.config.method.toUpperCase()} ${
        response.config.url
      }`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        `[API] Error ${error.response.status}:`,
        error.response.data
      );
      console.error("Request URL:", error.config.url);
      console.error("Request Method:", error.config.method);
      console.error("Request Headers:", error.config.headers);
      return Promise.reject({
        status: error.response.status,
        ...error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error("[API] Network Error - No response received");
      console.error("Request URL:", error.config.url);
      console.error("Request Method:", error.config.method);
      console.error("Using Base URL:", api.defaults.baseURL);
      return Promise.reject({
        message:
          "Network error occurred. Please check your internet connection and make sure the server is running.",
        details: "No response received from server",
      });
    } else {
      // Error in request setup
      console.error("[API] Request Setup Error:", error.message);
      console.error("Full Error:", error);
      return Promise.reject({
        message: "Failed to make the request",
        details: error.message,
      });
    }
  }
);

// Auth endpoints
export const auth = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  sendOTP: (email) => api.post("/auth/send-otp", { email }),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getCloudinarySignature: () => api.get("/cloudinary/signature"),
 
};

// User endpoints
export const users = {
  getAll: () => api.get("/users"),
  getByEmail: (email) => api.get("/users/lookup", { params: { email } }),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  updateProfile: (data) => api.put("/users/profile", data),
  delete: (userId) => api.delete(`/users/${userId}`),
};

// Competition endpoints
export const competitions = {
  getAll: () => api.get("/competitions"),
  getOne: (id) => api.get(`/competitions/${id}`),
  create: (data) => api.post("/competitions", data),
  update: (id, data) => api.put(`/competitions/${id}`, data),
  delete: (id) => api.delete(`/competitions/${id}`),
  registerTeam: (id, teamId) =>
    api.post(`/competitions/${id}/register`, { teamId }),
  getByTeams: (teamIds) =>
    api.get("/competitions", { params: { teams: teamIds } }),
  getByOrganizer: (organizerId) =>
    api.get("/competitions", { params: { organizer: organizerId } }),
};

// Team endpoints
export const teams = {
  getAll: () => api.get("/teams"),
  getOne: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post("/teams", data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  addPlayer: (id, data) => api.post(`/teams/${id}/players`, data),
  removePlayer: (id, playerId) =>
    api.delete(`/teams/${id}/players/${playerId}`),
  getByMember: (userId) => api.get("/teams", { params: { player: userId } }),
  getByOrganizer: (organizerId) =>
    api.get("/teams", { params: { organizer: organizerId } }),
};

// Match endpoints
export const matches = {
  getAll: () => api.get("/matches"),
  getOne: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post("/matches", data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  updateScore: (id, data) => api.put(`/matches/${id}/score`, data),
  getUpcoming: () => api.get("/matches", { params: { status: "upcoming" } }),
  getByCompetition: async (competitionId) => {
    console.log(
      `[api.js] matches.getByCompetition called with competitionId: ${competitionId}`
    );
    if (!competitionId) {
      console.error(
        "[api.js] matches.getByCompetition: competitionId is undefined or null"
      );
      throw new Error("Competition ID is required to fetch matches.");
    }
    const url = `${API_URL}/matches/competition/${competitionId}`;
    console.log(`[api.js] matches.getByCompetition: Requesting URL: ${url}`);
    try {
      const response = await api.get(url);
      console.log(
        "[api.js] matches.getByCompetition: Response received:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `[api.js] matches.getByCompetition: Error fetching matches for competition ${competitionId}:`,
        error.response ? error.response.data : error.message
      );
      if (error.response && error.response.status === 404) {
        return []; // Return empty array if no matches found (404)
      } else {
        throw error; // Re-throw other errors
      }
    }
  },
};

// Feedback endpoints
export const feedback = {
  getAll: () => api.get("/feedback"),
  create: (data) => api.post("/feedback", data),
  respond: (id, data) => api.put(`/feedback/${id}`, data),
};

// PDF endpoints
export const pdf = {
  generateCompetitionReport: (id, type) =>
    api.get(`/pdf/competition/${id}/${type}`),
  generateTeamReport: (id) => api.get(`/pdf/team/${id}`),
};

const apiServices = {
  api,
  auth,
  users,
  competitions,
  teams,
  matches,
  feedback,
  pdf,
};

export default apiServices;
