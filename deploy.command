#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
remoteHost="slots-mac"
remotePath="/Users/apple/Software/gpt-image"
rsync -av "$currentShellPath/src/" "$remoteHost:$remotePath/src/"
rsync -av "$currentShellPath/public/" "$remoteHost:$remotePath/public/"
echo "Enter password for $remoteHost:"
ssh -t $remoteHost "cd $remotePath && sudo ./reload.sh"