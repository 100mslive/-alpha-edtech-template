import {
  selectAppData,
  selectLocalPeerID,
  selectPeerNameByID,
  selectPollByID,
  useHMSStore,
} from "@100mslive/react-sdk";
import { Button, Flex, Text } from "@100mslive/roomkit-react";
import { useMemo } from "react";
import { APP_DATA } from "../../../common/constants";
import { checkCorrectAnswer } from "../../../common/utils";

const ResultBoard = () => {
  const localPeerID = useHMSStore(selectLocalPeerID);
  const pollID = useHMSStore(selectAppData(APP_DATA.resultBoardID));

  const poll = useHMSStore(selectPollByID(pollID));
  const pollCreatorName = useHMSStore(selectPeerNameByID(poll?.createdBy));
  const isLocalPeerCreator = useHMSStore(selectLocalPeerID) === poll?.createdBy;

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

      //Get what everyone answered - how to apply loop
      const localResponse = question.responses?.find(
        response => response.peer?.peerid === localPeerID
      );

      console.log("-----LOCAL RESPONSE-----");
      console.log(localResponse);
      console.log("-----LOCAL RESPONSE DURATION-----");
      console.log(localResponse.duration);

      //Compare
      if (checkCorrectAnswer(question.answer, localResponse, question.type)) {
        //Add the peer id to the list of the correct answer (how to create a )
        correctAnswers++;
        console.log(correctAnswers);
      } else {
        //Add the peer id to the uncorrect list
      }
    });
    return correctAnswers;
  }, [localPeerID, poll]);

  return (
    <Flex direction="column" css={{ size: "100%" }}>
      <Text css={{ fontWeight: "$semiBold", mr: "$4" }}>Results</Text>
      <Button
        variant="standard"
        onClick={() => {
          console.log(pollID);
        }}
        css={{ p: "$xs $10", fontWeight: "$semiBold" }}
      >
        View Leaderboard
      </Button>
    </Flex>
  );
};
export default ResultBoard;
