FROM ubuntu:22.10

EXPOSE 3000 5000 5050

RUN apt-get update && \
    DEBIAN_FRONTEND="noninteractive" apt-get install --yes \
    bash build-essential git tmux vim nano curl

# Install Node.JS & Global dependencies
RUN mkdir -p /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION v18.12.1

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use --delete-prefix $NODE_VERSION"

ENV NODE_PATH $NVM_DIR/versions/node/$NODE_VERSION/bin
ENV PATH $NODE_PATH:$PATH
RUN ln -sf $NODE_PATH/node /usr/bin/node
RUN ln -sf $NODE_PATH/npm /usr/bin/npm

WORKDIR /usr/src
RUN git clone https://github.com/Koreatech-Mongle/model-executor -b develop

WORKDIR /usr/src/model-executor/frontend
RUN npm install && npm run fix-reloader

WORKDIR /usr/src/model-executor/controller
RUN npm install && npm run pack

WORKDIR /usr/src/model-executor/backend
RUN echo '{"httpPort":5000,"socketExternalHost":"localhost","socketPort":5050,"defaultDockerServer":"default","dockerServers":{"default":{"host":"host.docker.internal","port":33000}}}' >> config.json && npm install

RUN printf "#!/bin/bash\n" >> /usr/sbin/startup
RUN printf 'tmux new -d -s backend && tmux send-keys -t backend "cd /usr/src/model-executor/backend && npm run dev"\n' >> /usr/sbin/entrypoint
RUN printf 'tmux new -d -s frontend && tmux send-keys -t frontend "cd /usr/src/model-executor/frontend && npm run start"\n' >> /usr/sbin/entrypoint
CMD ["/bin/bash", "-c" , "/bin/bash /usr/sbin/entrypoint && tail -f /dev/null"]