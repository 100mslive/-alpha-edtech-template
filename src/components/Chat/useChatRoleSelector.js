import { selectLocalPeerRoleName, useHMSStore } from "@100mslive/react-sdk";

export const useChatRoleSelector = () => {
  const localRoleName = useHMSStore(selectLocalPeerRoleName);
  const roleMap = JSON.parse(process.env.REACT_APP_CHAT_ROLE_MAPS);
  console.log(roleMap);
  const fixedRole =
    roleMap &&
    localRoleName &&
    roleMap[localRoleName] &&
    roleMap[localRoleName].sendTo
      ? roleMap[localRoleName].sendTo
      : false;
  return fixedRole;
};

export const useChatPlaceholder = () => {
  const localRoleName = useHMSStore(selectLocalPeerRoleName);
  const roleMap = JSON.parse(process.env.REACT_APP_CHAT_ROLE_MAPS);
  console.log(roleMap);
  const fixedRole =
    roleMap &&
    localRoleName &&
    roleMap[localRoleName] &&
    roleMap[localRoleName].placeholder
      ? roleMap[localRoleName].placeholder
      : "Send a message";
  return fixedRole;
};
