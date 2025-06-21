const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:519999903";

export const API = {
  register: `${baseUrl}/api/auth/register`,
  authRefresh: `${baseUrl}/api/auth/refresh`,
  usersMe: `${baseUrl}/api/users/me`,
  login: `${baseUrl}/api/auth/login`,
  friends: `${baseUrl}/api/friends`,
  friendsMe: `${baseUrl}/api/friends/me`,
  friendsPending: `${baseUrl}/api/friends/pending`,
  friendsRequest: `${baseUrl}/api/friends/request`,
  friendsRespond: `${baseUrl}/api/friends/respond`,
  friendsChatHub: `${baseUrl}/hub/friends`,
  armies: `${baseUrl}/api/armies`,
};
