// @ts-check
import React from "react";
import { QuizIcon } from "@100mslive/react-icons";
import { Button, Flex, Text } from "@100mslive/roomkit-react";
import { PollsQuizMenu } from "../Polls/CreatePollQuiz/PollsQuizMenu";
import { CreateQuestions } from "../Polls/CreateQuestions/CreateQuestions";
import { Voting } from "../Polls/Voting/Voting";
import { Container, ContentHeader } from "../Streaming/Common";
import { ScreenshareAudio } from "./ScreenshareAudio";
import { ToggleWhiteboard } from "../../plugins/whiteboard/ToggleWhiteboard";
import { useWidgetToggle } from "../AppData/useSidepane";
import {
  useShowAudioShare,
  useShowPolls,
  useShowWhiteboard,
  useWidgetState,
} from "../AppData/useUISettings";
import { WIDGET_STATE, WIDGET_VIEWS } from "../../common/constants";
import { useRecordingStreaming } from "@100mslive/react-sdk";

export const Widgets = props => {
  const toggleWidget = useWidgetToggle();
  const { pollInView: pollID, widgetView, setWidgetState } = useWidgetState();
  const { showPolls } = useShowPolls();
  const { showWhiteboard } = useShowWhiteboard();
  const { showAudioShare } = useShowAudioShare();
  const { isHLSRunning } = useRecordingStreaming();

  // const onClickShowPollData = () => {
  //   console.log("Show Poll Data");
  //   console.log(props.canShowPollWidget);
  // };

  const renderPollVoting = () => {
    if (widgetView === WIDGET_VIEWS.VOTE) {
      if (isHLSRunning) {
        if (props.canShowPollWidget) {
          return <Voting toggleVoting={toggleWidget} id={pollID} />;
        }
      } else {
        return <Voting toggleVoting={toggleWidget} id={pollID} />;
      }
    }
  };

  return (
    <Container rounded>
      <ContentHeader content="Widgets" onClose={toggleWidget} />
      {widgetView === WIDGET_VIEWS.LANDING && (
        <Flex direction="column" css={{ p: "$10" }}>
          {(showWhiteboard || showAudioShare) && (
            <Flex css={{ gap: "$10", mb: "$12" }}>
              {showAudioShare && <ScreenshareAudio />}
              {showWhiteboard && <ToggleWhiteboard />}
            </Flex>
          )}

          {showPolls && (
            <Flex direction="column" css={{ py: "$12" }}>
              <WidgetOptions
                title="Poll/Quiz"
                Icon={<QuizIcon width={40} height={40} />}
                subtitle="Find out what others think"
                onClick={() =>
                  setWidgetState({
                    [WIDGET_STATE.view]: WIDGET_VIEWS.CREATE_POLL_QUIZ,
                  })
                }
              />
            </Flex>
          )}
        </Flex>
      )}
      {widgetView === WIDGET_VIEWS.CREATE_POLL_QUIZ && <PollsQuizMenu />}
      {widgetView === WIDGET_VIEWS.CREATE_QUESTIONS && <CreateQuestions />}
      {renderPollVoting()}
      {/* <Button onClick={onClickShowPollData}>Print poll data</Button> */}
    </Container>
  );
};

const WidgetOptions = ({ title, onClick, subtitle, Icon }) => {
  return (
    <Flex
      onClick={onClick}
      key={title}
      css={{ cursor: "pointer", "&:hover": { opacity: 0.7, r: "$0" } }}
      align="center"
    >
      <Flex
        css={{
          border: "$space$px solid $border_bright",
          r: "$1",
          p: "$4",
          c: "$on_surface_high",
        }}
      >
        {Icon}
      </Flex>
      <Flex direction="column" css={{ ml: "$md" }}>
        <Text
          variant="sub2"
          css={{ c: "$on_surface_high", fontWeight: "$semiBold", mb: "$4" }}
        >
          {title}
        </Text>
        <Text variant="caption">{subtitle}</Text>
      </Flex>
    </Flex>
  );
};
