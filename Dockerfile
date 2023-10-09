FROM node:18-alpine AS builder





ENV WEB_PORT=7490
ENV PORT=7490
WORKDIR /100ms-web

# Copy app files
COPY . .




RUN yarn install

ENV NODE_ENV production

# set environment variables.
# These are the bare minimum needed for running
# the app. Feel free to add more as per your needs.
ENV REACT_APP_COLOR='#2F80FF'
ENV REACT_APP_TOKEN_GENERATION_ENDPOINT='https://prod-in2.100ms.live/hmsapi/shikho.app.100ms.live/'
ENV REACT_APP_ENABLE_HLS_QUALITY_LVL='true'
ENV REACT_APP_POLICY_CONFIG=''
ENV REACT_APP_DEFAULT_APP_DETAILS='{}'
ENV REACT_APP_ENABLE_STATS_FOR_NERDS='false'
ENV REACT_APP_HEADLESS_JOIN='false'
ENV REACT_APP_RAISE_HAND_BUTTON_PERMISSION_ROLES=['student-on-stage','hls-viewer']
ENV REACT_APP_CHANGE_NAME_BUTTON_PERMISSION_ROLES=['teacher','admin']
ENV REACT_APP_ATTENDEE_LIST_BUTTON_PERMISSION_ROLES=['teacher','admin']
ENV REACT_APP_ENABLE_WHITEBOARD='false'
ENV REACT_APP_WHITEBOARD_BUTTON_PERMISSION_ROLES=['teacher','admin']
ENV REACT_APP_SHOW_AUDIO_SHARE_BUTTON_PERMISSION_ROLES=['teacher','admin']
ENV REACT_APP_HLS_VIEWER_ROLES=['hls-viewer']
ENV REACT_APP_PUSHER_APP_KEY='01bfeec0bc8968d3ab37'
ENV REACT_APP_PUSHER_AUTHENDPOINT=''
ENV REACT_APP_STATIC_VIRTUAL_BACKGROUND='/virtual-background.png'
ENV REACT_APP_CHAT_ROLE_MAPS='{"hls-viewer": {"sendTo": ["teacher", "admin"],"placeholder": "Send a message to the teacher"},"student-on-stage": {"sendTo": ["teacher", "admin"],"placeholder": "Send a message to the teacher"}}'
ENV REACT_APP_LOGO_LIGHT='shikho-logo.svg'
ENV REACT_APP_LOGO_DARK='shikho-logo.svg'
ENV REACT_APP_TILE_SHAPE='16-9'
ENV REACT_APP_TITLE='Shikho Live Class Demo'

# Build the app
RUN yarn build

# Bundle static assets with nginx
FROM nginx:1.23.1-alpine AS production
# Copy built assets from builder
COPY --from=builder /100ms-web/build /usr/share/nginx/html

# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 7490
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
