import api from "./api";

export async function registerUser(email, password) {
  const response = await api.post("/auth/register", {
    email,
    password,
  });

  return response.data;
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  localStorage.setItem("access_token", response.data.access_token);

  return response.data;
}