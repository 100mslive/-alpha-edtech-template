import {
  selectAppData,
  selectLocalPeerID,
  selectPollByID,
  useHMSStore,
} from "@100mslive/react-sdk";
import { Avatar, Text, textEllipsis } from "@100mslive/roomkit-react";
import { Fragment, useMemo } from "react";
import { APP_DATA } from "../../../common/constants";
import { checkCorrectAnswer } from "../../../common/utils";

const ResultBoard = () => {
  const localPeerID = useHMSStore(selectLocalPeerID);
  const pollID = useHMSStore(selectAppData(APP_DATA.resultBoardID));

  const poll = useHMSStore(selectPollByID(pollID));

  const correctResultList = useMemo(() => {
    const list = [];
    poll.questions?.forEach(question => {
      question.responses?.forEach(response => {
        if (checkCorrectAnswer(question.answer, response, question.type)) {
          list.push({ response });
        }
      });
    });

    return list;
  }, [localPeerID, poll]);

  const inCorrectResultList = useMemo(() => {
    const list = [];
    poll.questions?.forEach(question => {
      question.responses?.forEach(response => {
        if (!checkCorrectAnswer(question.answer, response, question.type)) {
          list.push({ response });
        }
      });
    });
    return list;
  }, [localPeerID, poll]);

  return (
    <Fragment>
      <Flex direction="column" css={{ size: "100%" }}>
        <Flex
          align="center"
          css={{
            color: "$on_surface_high",
            h: "$16",
            mb: "$2",
          }}
        >
          <Text variant="h6">RESULTS</Text>
        </Flex>

        <Flex
          direction="column"
          css={{ px: "$10", pb: "$10", overflowY: "auto" }}
        >
          <Text variant="lg">Correct</Text>
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
            </Flex>
          ))}
          <Text variant="lg">Incorrect</Text>

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
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Fragment>
  );
};
export default ResultBoard;