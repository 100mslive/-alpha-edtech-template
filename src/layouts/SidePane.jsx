import React from "react";
import { selectAppData, useHMSStore } from "@100mslive/react-sdk";
import { Box } from "@100mslive/roomkit-react";
import { Chat } from "../components/Chat/Chat";
import { Widgets } from "../components/Footer/Widgets";
import { ParticipantList } from "../components/Footer/ParticipantList";
import { StreamingLanding } from "../components/Streaming/StreamingLanding";
import { useWidgetState } from "../components/AppData/useUISettings";
import { APP_DATA, SIDE_PANE_OPTIONS } from "../common/constants";
import ResultBoard from "../components/Polls/results/ResultBoard";

const SidePane = ({ css = {} }) => {
  const sidepane = useHMSStore(selectAppData(APP_DATA.sidePane));
  const canShowPollWidget = useHMSStore(selectAppData("showPollWidget"));
  const { widgetView } = useWidgetState();
  const commonCss = {
    position: "absolute",
    w: "$100",
    h: "100%",
    p: "$10",
    bg: "$surface_default",
    r: "$1",
    top: 0,
    zIndex: 10,
    boxShadow: "$md",
    ...css,
    "@lg": {
      w: "100%",
      position: "fixed",
      bottom: 0,
      right: 0,
      left: "0 !important",
      height: "unset",
      ...(css["@lg"] || {}),
    },
  };
  let RightComponent;
  if (sidepane === SIDE_PANE_OPTIONS.PARTICIPANTS) {
    RightComponent = ParticipantList;
  } else if (sidepane === SIDE_PANE_OPTIONS.CHAT) {
    RightComponent = Chat;
  } else if (sidepane === SIDE_PANE_OPTIONS.STREAMING) {
    RightComponent = StreamingLanding;
  } else if (sidepane === SIDE_PANE_OPTIONS.RESULTS) {
    RightComponent = ResultBoard;
  }

  return (
    <>
      {RightComponent && (
        <Box
          css={{
            ...commonCss,
            right: "$10",
            "@lg": { ...commonCss["@lg"] },
          }}
        >
          <RightComponent />
        </Box>
      )}
      {widgetView && (
        <Box
          css={{
            ...commonCss,
            left: "$10",
            "@lg": { ...commonCss["@lg"] },
          }}
        >
          <Widgets canShowPollWidget={canShowPollWidget} />
        </Box>
      )}
    </>
  );
};

export default SidePane;
