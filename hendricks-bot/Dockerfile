# === Setup Layers ===
FROM node:18
# this is the cwd '.' refers to
WORKDIR /app


# === Image Dependencies ===
# FFmpeg
RUN apt-get -y update && apt-get -y upgrade && apt-get install -y ffmpeg
# pnpm
RUN npm install --ignore-scripts --global pnpm

# === Runtime Dependencies ===
# RUN layer is only run if COPY layer is invalidated by file change 
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install --prod

# === App Code ===
COPY . ./

# === Run ===
# expose ports for rest comms
EXPOSE 80 443
CMD ["pnpm", "start"]