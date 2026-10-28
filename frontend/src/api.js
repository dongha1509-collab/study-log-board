// TODO FE-01~04: 공통 API 명세와 구현 체크리스트를 보고 완성하세요.
let session = { accessToken: "", user: null };
export const getSession = () => session;
export function clearSession() {
  session = { accessToken: "", user: null };
}
function authorizationHeaders() {
  // 토큰이 있을 때만 Authorization 헤더를 만든다 (없으면 헤더 없음)
  if (!session.accessToken) return {};
  return { Authorization: `Bearer ${session.accessToken}` };
}
// 401일 때 화면에 보여줄 안내 (code별)
const loginMessages = {
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 틀렸습니다.",
  TOKEN_REQUIRED: "로그인이 필요합니다. 먼저 로그인하세요.",
  INVALID_TOKEN: "로그인 정보가 올바르지 않습니다. 다시 로그인하세요.",
  TOKEN_EXPIRED: "로그인 시간이 지났습니다. 다시 로그인하세요.",
};
export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    // 401이면 토큰이 없거나 틀린 것이므로 로그인 상태를 지운다 (403은 지우지 않는다)
    if (response.status === 401) clearSession();
    const error = new Error(
      loginMessages[data.code] ||
        data.message ||
        data.code ||
        `HTTP ${response.status}`,
    );
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
export async function login(email, password) {
  // 서버에 로그인 요청을 보내고, 받은 토큰과 사용자를 메모리(session)에 저장한다
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  session = { accessToken: data.accessToken, user: data.user };
  return data.user;
}
export function canEdit(post) {
  // 로그인했고, 내 id가 글 작성자 id와 같을 때만 수정·삭제 버튼을 보여준다
  return !!session.user && session.user.id === post.authorId;
}
export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) =>
    request("/posts", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) =>
    request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  me: () => request("/me"),
};
