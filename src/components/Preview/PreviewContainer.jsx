import React from "react";
import { flexCenter, styled } from "@100mslive/roomkit-react";
import PreviewJoin from "./PreviewJoin";

const PreviewContainer = ({
  token,
  onJoin,
  env,
  skipPreview,
  initialName,
  asRole,
  userId,
}) => {
  return (
    <Container>
      <PreviewJoin
        initialName={initialName}
        skipPreview={skipPreview}
        env={env}
        onJoin={onJoin}
        token={token}
        asRole={asRole}
        userId={userId}
      />
    </Container>
  );
};

const Container = styled("div", {
  width: "100%",
  ...flexCenter,
  flexDirection: "column",
});

export default PreviewContainer;
