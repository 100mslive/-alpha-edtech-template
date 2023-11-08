import React from "react";
import { Flex, VerticalDivider } from "@100mslive/roomkit-react";
import { Logo, SpeakerTag } from "./HeaderComponents";
import { ParticipantCount } from "../Footer/ParticipantList";
import { StreamActions } from "./StreamActions";
import { useHMSStore, selectLocalPeerRoleName } from "@100mslive/react-sdk";

export const ConferencingHeader = ({ isPreview }) => {
  const viewAttendeeButtonRolesList =
    process.env.REACT_APP_ATTENDEE_LIST_BUTTON_PERMISSION_ROLES;
  const localPeerRole = useHMSStore(selectLocalPeerRoleName);
  const shouldViewAttendeeListButton =
    viewAttendeeButtonRolesList.includes(localPeerRole);

  return (
    <Flex
      justify="between"
      align="center"
      css={{ position: "relative", height: "100%" }}
    >
      <Flex align="center" css={{ position: "absolute", left: "$10" }}>
        <Logo />
        <VerticalDivider css={{ ml: "$8" }} />
        {!isPreview ? <SpeakerTag /> : null}
      </Flex>

      <Flex
        align="center"
        css={{
          position: "absolute",
          right: "$10",
          gap: "$4",
        }}
      >
        <StreamActions />
        {shouldViewAttendeeListButton === true && <ParticipantCount />}
      </Flex>
    </Flex>
  );
};
