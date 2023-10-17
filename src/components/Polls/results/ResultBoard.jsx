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
  Text,
  textEllipsis,
} from "@100mslive/roomkit-react";
import { useMemo, useState } from "react";
import { APP_DATA } from "../../../common/constants";
import { checkCorrectAnswer } from "../../../common/utils";

const ResultBoard = () => {
  const localPeerID = useHMSStore(selectLocalPeerID);
  const pollID = useHMSStore(selectAppData(APP_DATA.resultBoardID));

  const poll = useHMSStore(selectPollByID(pollID));
  const pollCreatorName = useHMSStore(selectPeerNameByID(poll?.createdBy));
  const isLocalPeerCreator = useHMSStore(selectLocalPeerID) === poll?.createdBy;

  const [correctResultList, setCorrectResultList] = useState([]);
  const [inCorrectResultList, setInCorrectResultList] = useState([]);

  const localCorrectAnswers = useMemo(() => {
    // pollResult={poll.result}
    // questions={poll.questions}
    // isQuiz={poll.type === "quiz"}
    // isAdmin={isLocalPeerCreator}

    let correctAnswers = 0;
    poll.questions?.forEach(question => {
      //Get the correct answer.
      console.log("Correct answer is:");
      console.log(question.answer);

      console.log("POLL DATA ---------");
      console.log(poll);

      //Get what everyone answered - how to apply loop
      question.responses?.forEach(response => {
        console.log(response);
        console.log(response.duration);
        console.log(question.answer);
        console.log(question.type);

        console.log(
          checkCorrectAnswer(question.answer, response, question.type)
        );

        if (checkCorrectAnswer(question.answer, response, question.type)) {
          console.log("-----CORRECT RESPONSE LIST-----");

          correctResultList.push({ response });
        } else {
          console.log("-----INCORRECT RESPONSE DURATION-----");
          inCorrectResultList.push({ response });
        }
      });
    });
    return correctAnswers;
  }, [localPeerID, poll]);

  return (
    <Flex direction="column" css={{ size: "100%" }}>
      <Text css={{ fontWeight: "$semiBold", mr: "$4" }}>Results</Text>

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
    </Flex>
  );
};
export default ResultBoard;
