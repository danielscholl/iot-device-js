FROM ubuntu:18.04

RUN apt-get update -qq && apt-get install -qqy \
  apt-transport-https \
  ca-certificates \
  curl \
  wget \
  build-essential \
  python \
  lsb-release \
  systemd && \
  rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_8.x  -o node_setup.sh && \
  bash node_setup.sh

RUN AZ_REPO=$(lsb_release -cs) && \
  echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | \
  tee /etc/apt/sources.list.d/azure-cli.list && \
  curl -L https://packages.microsoft.com/keys/microsoft.asc | apt-key add -

RUN apt-get update && apt-get install -y --no-install-recommends \
  azure-cli \
  nodejs

RUN az extension add --name azure-cli-iot-ext

WORKDIR /usr/src/app
COPY package.json ./

RUN npm install

ENV NODE_ENV=production
COPY index.js .
COPY lib ./lib

COPY docker-provision.sh ./provision.sh

ENTRYPOINT ["bash", "provision.sh"]

CMD []
