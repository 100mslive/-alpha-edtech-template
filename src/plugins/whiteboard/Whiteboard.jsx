import React from "react";
import { Tldraw } from "@tldraw/tldraw";
import { useSessionStore } from "./useSessionStore";
import "./Whiteboard.css";

export const Whiteboard = React.memo(() => {
  const events = useSessionStore();
  return (
    <Tldraw
      autofocus
      disableAssets={true}
      showSponsorLink={false}
      showPages={false}
      showMenu={false}
      showZoom={false}
      {...events}
    />
  );
});
