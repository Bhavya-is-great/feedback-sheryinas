import http from "@/utils/http.util";

export async function getUserFeedbacks(feedbackId) {
  const { data } = await http.get(`/api/getUserFeedbacks?feedbackId=${encodeURIComponent(feedbackId)}`, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  return data;
}

export async function setUserFeedback(payload) {
  const { data } = await http.post("/api/setFeedback", payload);

  return data;
}

export async function updateUserFeedback(payload) {
  const { data } = await http.patch("/api/setFeedback", payload);

  return data;
}

export async function likeUserFeedback(payload) {
  const { data } = await http.post("/api/likeFeedback", payload);

  return data;
}
