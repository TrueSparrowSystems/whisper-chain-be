#!/usr/bin/env bash
ORGANIZATION_NAME="PLG-Works"
echo "*****Finding current working directory*****"
current_dir=$(pwd)
echo "*****You are in path ${current_dir}*****"
repo_name=`basename "$PWD"`
echo "*****We are in the repo ${repo_name}*****"
echo "*****Checking if secrets exist*****"
SECRETS_FOLDER_PATH="dev.secrets"
if [ ! -d "$HOME/$SECRETS_FOLDER_PATH" ]; then
    cd $HOME;
    echo "*****Secrets does not exist. Creating a secrets directory*****"
    mkdir -p $SECRETS_FOLDER_PATH;
    echo "*****Secrets directory created. Proceeding to cloning the secrets repo*****"
    git clone git@github.com:${ORGANIZATION_NAME}/dev.secrets.git $SECRETS_FOLDER_PATH
    echo "*****Cloning done!!!*****"
    echo "*****Pulling latest secrets*****"
    cd $SECRETS_FOLDER_PATH;
    git pull --rebase;
    echo "*****Pulling latest secrets done!!!*****"
    echo "*****Setting env vars*****"
    cd ${repo_name};
    source env_vars.sh;
    echo "*****Setting env vars done!!!*****"
    echo "*****Going back to main code path*****"
    cd ${current_dir};
    echo "*****Going back to the main code path done!!!*****"
else
    echo "*****The Secrets folder exists*****"
    echo "$(pwd)"
    cd $HOME/$SECRETS_FOLDER_PATH;
    echo "Changing to secrets path $(pwd)"
    echo "*****Pulling latest secrets*****"
    git pull --rebase;
    echo "*****Pulling latest secrets done!!!*****"
    echo "*****Setting env vars*****"
    echo "$(pwd)"
    cd ${repo_name};
    source env_vars.sh;
    echo "*****Setting env vars done!!!*****"
    echo "*****Going back to main code path*****"
    cd ${current_dir};
    echo "*****Going back to the main code path done!!!*****"
fi
