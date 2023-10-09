import React from "react";
import {Box, Flex, styled, Text, useTheme} from "@100mslive/roomkit-react";
import { CREATE_ROOM_DOC_URL } from "../common/constants";
import {useLogo} from "./AppData/useUISettings";

const LogoImg = styled("img", {
    maxHeight: "$250",
    p: "$2",
    w: "auto",
    "@md": {
        maxHeight: "$12",
    },
});

function ErrorPage({ error }) {
  const themeType = useTheme().themeType;
    const logo = useLogo();
  return (
    <Flex
      align="center"
      justify="center"
      css={{
        size: "100%",
        color: "$on_surface_high",
        backgroundColor: "$background_default",
      }}
    >
      <Box css={{ position: "relative", overflow: "hidden", r: "$3" }}>
        <img
          src={
            themeType === "dark"
              ? require("../images/error-bg-dark.svg")
              : require("../images/error-bg-light.svg")
          }
          alt="Error Background"
        />
        {window.location.hostname === "localhost" ? (
          <Flex
            align="center"
            direction="column"
            css={{ position: "absolute", size: "100%", top: "33.33%", left: 0 }}
          >
              <LogoImg
                  src={
                      logo ||
                      (themeType === "dark"
                              ? process.env.REACT_APP_LOGO_LIGHT
                              : process.env.REACT_APP_LOGO_LIGHT
                      )}
                  alt="Brand Logo"
                  width={550}
                  height={100}
              />
              <br />
            <Text variant="h3">শিখো ডিজিটাল ক্লাসরুম</Text>
            <Text
              variant="body1"
              css={{ margin: "1.75rem", textAlign: "center" }}
            >
              {
                "আপনি মিটিং রুম থেকে বাইরে চলে এসেছেন । অ্যাপে ফেরত যেতে "
              }
              <a
                href={"https://app.shikho.dev"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline" }}
              >
                এখানে ক্লিক করুন ।
              </a>
            </Text>
          </Flex>
        ) : (
          <Flex
            align="center"
            direction="column"
            css={{ position: "absolute", size: "100%", top: "33.33%", left: 0 }}
          >
            <Text variant="h2">404</Text>
            <Text variant="h4" css={{ mt: "1.75rem" }}>
              {error}
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}

ErrorPage.displayName = "ErrorPage";

export default ErrorPage;
