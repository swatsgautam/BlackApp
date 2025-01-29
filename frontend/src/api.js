const API_URL = "http://localhost:5000/api";

export const createRoom = async (name, users) => {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, users }),
  });
  return response.json();
};

export const searchUsers = async (query) => {
  const response = await fetch(`${API_URL}/users/search?query=${query}`);
  return response.json();
};

export const getRooms = async () => {
  const response = await fetch(`${API_URL}/rooms`);
  return response.json();
};
