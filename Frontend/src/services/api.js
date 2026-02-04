import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/";

export const predictTumor = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return await axios.post(`${API_BASE}predict/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
