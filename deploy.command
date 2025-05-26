#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
remoteHost="slots-mac"
remotePath="/Users/apple/Software/gpt-image"
rsync --exclude ".git" --exclude "node_modules" --exclude ".env.local" --exclude ".next" --exclude "generated-images" --exclude ".DS_Store" -av "$currentShellPath/" "$remoteHost:$remotePath/"
echo "Enter password for $remoteHost:"
ssh -t $remoteHost "cd $remotePath && sudo ./reload.sh"