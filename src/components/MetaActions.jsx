import {
  selectIsConnectedToRoom,
  useHMSStore,
  selectLocalPeerRoleName,
  selectHasPeerHandRaised,
  selectLocalPeerID,
  useHMSActions,
} from "@100mslive/react-sdk";
import { BrbIcon, HandIcon } from "@100mslive/react-icons";
import { Flex, Tooltip } from "@100mslive/roomkit-react";
import IconButton from "../IconButton";
import { useIsFeatureEnabled } from "./hooks/useFeatures";
import { useMyMetadata } from "./hooks/useMetadata";
import { FEATURE_LIST } from "../common/constants";

const MetaActions = ({ isMobile = false, compact = false }) => {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const localPeerId = useHMSStore(selectLocalPeerID);
  const isHandRaised = useHMSStore(selectHasPeerHandRaised(localPeerId));
  const hmsActions = useHMSActions();
  const isHandRaiseEnabled = useIsFeatureEnabled(FEATURE_LIST.HAND_RAISE);
  const raiseHandButtonRolesList =
    process.env.REACT_APP_RAISE_HAND_BUTTON_PERMISSION_ROLES;
  const localPeerRole = useHMSStore(selectLocalPeerRoleName);
  const shouldShowHandRaiseButton =
    raiseHandButtonRolesList.includes(localPeerRole);
  const { isBRBOn, toggleBRB } = useMyMetadata();
  const isBRBEnabled = useIsFeatureEnabled(FEATURE_LIST.BRB);

  if (!isConnected || (!isHandRaiseEnabled && !isBRBEnabled)) {
    return null;
  }

  return (
    <Flex align="center" css={{ gap: compact ? "$4" : "$8" }}>
      {shouldShowHandRaiseButton === true && isHandRaiseEnabled && (
        <Tooltip title={`${!isHandRaised ? "Raise" : "Unraise"} hand`}>
          <IconButton
            onClick={() => {
              isHandRaised
                ? hmsActions.lowerLocalPeerHand()
                : hmsActions.raiseLocalPeerHand();
            }}
            active={!isHandRaised}
            data-testid={isMobile ? "raise_hand_btn_mobile" : "raise_hand_btn"}
          >
            <HandIcon />
          </IconButton>
        </Tooltip>
      )}

      {isBRBEnabled && (
        <Tooltip title={isBRBOn ? `I'm back` : `I'll be right back`}>
          <IconButton
            onClick={toggleBRB}
            active={!isBRBOn}
            data-testid="brb_btn"
          >
            <BrbIcon />
          </IconButton>
        </Tooltip>
      )}
    </Flex>
  );
};

export default MetaActions;
