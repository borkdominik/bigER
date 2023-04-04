FROM gitpod/openvscode-server:latest

ENV OPENVSCODE_SERVER_ROOT="/home/.openvscode-server"
ENV OPENVSCODE="${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server"

# change to root and install jdk 11
USER root
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get install -y ant && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/ && \
    rm -rf /var/cache/oracle-jdk11-installer;
# Set JAVA_HOME for bigER extensions 
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-arm64/
RUN export JAVA_HOME

RUN mkdir workspace && \
    echo 'erdiagram Model\nentity E1 {\n\tid: INTEGER key\n}' > workspace/test.erd;
# change back permissions
# USER openvscode-server

SHELL ["/bin/bash", "-c"]
RUN \
    # Direct download links to external .vsix not available on https://open-vsx.org/
    urls=(\
        https://github.com/borkdominik/bigER/releases/download/v0.4.0/erdiagram-0.4.0.vsix \
    )\
    # Create a tmp dir for downloading
    && tdir=/tmp/exts && mkdir -p "${tdir}" && cd "${tdir}" \
    # Download via wget from $urls array.
    && wget "${urls[@]}" && \
    # List the extensions in this array
    exts=(\
        # From https://open-vsx.org/ registry directly
        # gitpod.gitpod-theme \
        # From filesystem, .vsix that we downloaded (using bash wildcard '*')
        "${tdir}"/* \
    )\
    # Install the $exts
    && for ext in "${exts[@]}"; do ${OPENVSCODE} --install-extension "${ext}"; done