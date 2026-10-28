import jwt from "jsonwebtoken";
import { ApiError } from "./errors.js";
import { findPublic } from "./users.js";

// .env 설정을 읽는다. 잘못되어 있으면 서버를 아예 켜지 않는다.
const secret = process.env.JWT_SECRET ?? "";
if (
  !secret ||
  secret === "REPLACE_WITH_RANDOM_64_HEX_CHARACTERS" ||
  !/^[0-9a-fA-F]{64}$/.test(secret)
)
  throw new Error("JWT_SECRET은 새로 만든 64자리 16진수여야 합니다. (.env 확인)");

export const ttl = Number(process.env.TOKEN_TTL || 90); // 토큰 유효 시간(초)

const key = Buffer.from(secret, "hex"); // 서명에 쓸 32바이트 키
const issuer = process.env.JWT_ISSUER;
const audience = process.env.JWT_AUDIENCE;

// BE-01: 로그인 성공한 사용자에게 토큰을 만들어 준다.
// 비밀번호 같은 건 넣지 않고 사용자 id(sub)만 담는다.
export function issueToken(user) {
  return jwt.sign({}, key, {
    algorithm: "HS256",
    subject: String(user.id),
    issuer,
    audience,
    expiresIn: ttl,
  });
}

// BE-02: 요청 헤더의 토큰을 확인하고, 확인된 사용자 id를 돌려준다.
export function currentUserId(req) {
  // 1) "Bearer 토큰" 모양인지 본다
  const header = /^Bearer +(\S+)$/.exec(req.headers.authorization ?? "");
  if (!header)
    throw new ApiError(
      401,
      "TOKEN_REQUIRED",
      "Authorization: Bearer <토큰> 헤더가 필요합니다.",
    );

  // 2) 토큰이 진짜인지 확인한다 (서명, 만료 시간, 발급자, 대상자)
  let data;
  try {
    data = jwt.verify(header[1], key, {
      algorithms: ["HS256"],
      issuer,
      audience,
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError)
      throw new ApiError(401, "TOKEN_EXPIRED", "토큰이 만료되었습니다.");
    throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
  }

  // 3) 만료 시간(exp)이 없는 토큰은 거른다
  if (typeof data.exp !== "number")
    throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");

  // 4) 그 사용자가 실제로 있는지 확인한다
  const found = findPublic(Number(data.sub));
  if (!found)
    throw new ApiError(401, "INVALID_TOKEN", "존재하지 않는 사용자입니다.");
  return found.id;
}
// BE-03: 로그인한 사용자와 글 작성자가 다르면 403으로 막는다.
export function assertOwner(userId, authorId) {
  if (userId !== authorId)
    throw new ApiError(403, "FORBIDDEN", "본인이 쓴 글만 수정·삭제할 수 있습니다.");
}
