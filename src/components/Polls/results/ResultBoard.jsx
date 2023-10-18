import {
  selectAppData,
  selectLocalPeerID,
  selectPeerNameByID,
  selectPollByID,
  useHMSStore,
} from "@100mslive/react-sdk";
import {
  Avatar,
  Button,
  Flex,
  IconButton,
  Text,
  textEllipsis,
} from "@100mslive/roomkit-react";
import { Fragment, useMemo, useState } from "react";
import { APP_DATA } from "../../../common/constants";
import { checkCorrectAnswer } from "../../../common/utils";
import { CrossIcon } from "@100mslive/react-icons";

const ResultBoard = () => {
  const localPeerID = useHMSStore(selectLocalPeerID);
  const pollID = useHMSStore(selectAppData(APP_DATA.resultBoardID));

  const poll = useHMSStore(selectPollByID(pollID));

  const [correctResultList, setCorrectResultList] = useState([]);
  const [inCorrectResultList, setInCorrectResultList] = useState([]);

  const localCorrectAnswers = useMemo(() => {
    poll.questions?.forEach(question => {
      question.responses?.forEach(response => {
        if (checkCorrectAnswer(question.answer, response, question.type)) {
          correctResultList.push({ response });
        } else {
          inCorrectResultList.push({ response });
        }
      });
    });
  }, [localPeerID, poll]);

  return (
    <Fragment>
      <Flex direction="column" css={{ size: "100%" }}>
        <Flex
          // How to pop the sidepane?
          // onClick={onToggle}
          align="center"
          css={{
            color: "$on_surface_high",
            h: "$16",
            mb: "$2",
          }}
        >
          <Text variant="h6">RESULTS</Text>
          {/* <IconButton
          css={{ ml: "auto" }}
          onClick={e => {
            e.stopPropagation();
            selectorOpen ? onToggle() : toggleChat();
          }}
          data-testid="close_chat"
        >
          <CrossIcon />
        </IconButton> */}
        </Flex>
        <Text variant="lg">Correct</Text>

        <ul>
          {correctResultList.map(response => (
            <Flex
              key={response.response.peer.id}
              css={{ w: "100%", py: "$4", pr: "$10" }}
              align="center"
              data-testid={"participant_" + response.response.peer.username}
            >
              <Avatar
                name={response.response.peer.username}
                css={{
                  position: "unset",
                  transform: "unset",
                  mr: "$8",
                  fontSize: "$sm",
                  size: "$12",
                  p: "$4",
                }}
              />
              <Flex direction="column" css={{ flex: "1 1 0" }}>
                <Text
                  variant="md"
                  css={{ ...textEllipsis(150), fontWeight: "$semiBold" }}
                >
                  {response.response.peer.username}
                </Text>
                <Text variant="sub2">
                  {/* Only works best when only one question instead of multiple questions. */}
                  {poll.questions[0].options[response.response.option - 1].text}
                </Text>
              </Flex>
              {/* {isConnected && (
      <ParticipantActions
        peerId={response.response.peer.id}
        role={response.response.peer.roleName}
        onSettings={() => {
          setSelectedPeerId(response.response.peer.id);
        }}
      />
    )} */}
            </Flex>
          ))}
        </ul>
        <Text variant="lg">Incorrect</Text>

        <ul>
          {inCorrectResultList.map(response => (
            <Flex
              key={response.response.peer.id}
              css={{ w: "100%", py: "$4", pr: "$10" }}
              align="center"
              data-testid={"participant_" + response.response.peer.username}
            >
              <Avatar
                name={response.response.peer.username}
                css={{
                  position: "unset",
                  transform: "unset",
                  mr: "$8",
                  fontSize: "$sm",
                  size: "$12",
                  p: "$4",
                }}
              />
              <Flex direction="column" css={{ flex: "1 1 0" }}>
                <Text
                  variant="md"
                  css={{ ...textEllipsis(150), fontWeight: "$semiBold" }}
                >
                  {response.response.peer.username}
                </Text>
                <Text variant="sub2">
                  {/* Only works best when only one question instead of multiple questions. */}
                  {poll.questions[0].options[response.response.option - 1].text}
                </Text>
              </Flex>
              {/* {isConnected && (
      <ParticipantActions
        peerId={response.response.peer.id}
        role={response.response.peer.roleName}
        onSettings={() => {
          setSelectedPeerId(response.response.peer.id);
        }}
      />
    )} */}
            </Flex>
          ))}
        </ul>
      </Flex>
    </Fragment>
  );
};
export default ResultBoard;
