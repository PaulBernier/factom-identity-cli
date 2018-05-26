FROM debian

RUN apt-get update \
    && apt-get -y install curl gnupg
       
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

RUN npm install -g factom-identity-cli

ENTRYPOINT ["/usr/bin/factom-identity-cli"]