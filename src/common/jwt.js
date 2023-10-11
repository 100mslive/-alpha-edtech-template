import jwt_decode from "jwt-decode";
import { parseCookies, setCookie } from "nookies";

export const getACookie = key => {
  const cookies = parseCookies();
  return cookies[`${process.env.NEXT_PUBLIC_ENV || "dev"}_${key}`]
    ? cookies[`${process.env.NEXT_PUBLIC_ENV || "dev"}_${key}`]
    : "";
};

export const decodeToken = key => {
  const theCookie = getACookie("token");
  return theCookie !== "" ? jwt_decode(theCookie) : null;
};

export const getLoggedInUser = () => {
  const user = getACookie("user");
  if (user !== "") {
    return JSON.parse(user);
  }
  return {};
};

export const setACookie = (key, value) => {
  setCookie(null, `${process.env.NEXT_PUBLIC_ENV || "dev"}_${key}`, value, {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    domain: process.env.NEXT_PUBLIC_COOKIE_HOST,
  });
};

export const removeACookie = key => {
  document.cookie =
    `${process.env.NEXT_PUBLIC_ENV || "dev"}_${key}` +
    "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};
