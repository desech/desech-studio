# Desech Studio

## Gpg key

- download the public and secret gpg file from bitwarden

```sh
cd ~/Downloads
gpg --import Desech.public.asc
gpg --import Desech.secret.asc
gpg --list-keys --with-colons
```

## Install Repo

```sh
sudo apt install rpm alien libarchive-tools reprepro
cd ~/dev/desech-studio
cp .config.json config.json
cp .electron-builder.env electron-builder.env
  enable/disable for win/mac
  copy the `desech.pfx` file from bitwarden to `build/win/desech.pfx`
  copy the `application.p12` file from bitwarden to `build/mac/application.p12`
  add the certificate password from bitwarden
npm install
cd app
npm install
cd ..
npm run build-all-dev
./app/node_modules/.bin/electron ./app/index.js
```

Icons

```sh
- use figma to export the image files needed
sudo apt install icnsutils icoutils
cd ~/dev/desech-studio
png2icns build/resource/icon.icns build/resource/icon.png
icotool -c -o build/resource/icon.ico build/resource/icon.png
```

## Build Studio Utilities

```sh
cd ~/dev/desech-studio/dist
# unpack asar
npx asar extract ./linux-unpacked/resources/app.asar ./linux-unpacked/resources/app
# unpack deb
ar x desech-studio_1.0.0_amd64.deb
# run unpackaged app
./linux-unpacked/desech-studio
# convert rpm to deb
sudo alien desech-studio-1.0.0.x86_64.rpm
# install deb file
sudo dpkg -i ./desech-studio_1.0.0_amd64.deb
# uninstall deb/app
sudo apt purge -y desech-studio
```

## Linux Repositories

Manjaro VM

```sh
sudo pacman -S --needed base-devel
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
yay repoctl
  1
  n
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub
- check the server-git docs to add the key to the git user ~/.ssh/authorized_keys file
mkdir dev
cd dev
git clone ssh://git@git.desech.com:5522/~/desech-download.git
git config --global user.email "catalin.luntraru@desech.com"
git config --global user.name "catalin"
repoctl conf new /home/manjaro/dev/desech-download/pacman/desech-studio.db.tar.zst
```

Fedora VM

```sh
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub
- check the server-git docs to add the key to the git user ~/.ssh/authorized_keys file
mkdir dev
cd dev
git clone ssh://git@git.desech.com:5522/~/desech-download.git
git config --global user.email "catalin.luntraru@desech.com"
git config --global user.name "catalin"
```

## Build Studio and update downloads repository

- disconnect VPN
- change version in `package.json` and `app/package.json`

```sh
sudo apt update && sudo apt upgrade && sudo apt autoremove
cd ~/dev/desech-studio
npm run build-all-prod
npm run build-linux-x86
- make sure to copy the gpg passphrase now
reprepro -b ~/dev/desech-download/apt includedeb apt ./dist/desech-studio-2.0.1-amd64.deb
reprepro -b ~/dev/desech-download/apt list apt
cp ./dist/desech-studio-2.0.1-x86_64.rpm ~/dev/desech-download/dnf
cp ./dist/desech-studio-2.0.1-x64.pacman ~/dev/desech-download/pacman

cd ../desech-download
git add -A
git commit -am "ubuntu"
git push
```

Manjaro

- open software and update

```sh
cd ~/dev/desech-download
git pull

- open a new tab (CTRL+SHIFT+T)
- next time try to sudo repoctl
sudo -s
repoctl add ./pacman/desech-studio-2.0.1-x64.pacman
  - File Explorer > go to `~/dev/desech-download/pacman`
  - when the lock file disappears cancel the process
  - remove the previous pacman file
chown -R manjaro:manjaro *

- back to the other tab
git add -A
git commit -am "manjaro"
git push
```

Fedora

```sh
sudo dnf update --refresh && sudo dnf upgrade --refresh && sudo dnf autoremove
- remove the previous rpm file
cd ~/dev/desech-download
git pull
sudo createrepo -v ./dnf
sudo chown -R fedora:fedora *
git add -A
git commit -am "fedora"
git push
```

Windows

```sh
- check window updates
- fetch the latest updates from git
cd Documents/dev/desech-studio
npm i
cd app
npm i
cd ..
npm run build-all-prod
npm run build-win
- copy the windows files to the desech-download repo and push/pull
```

Mac

```sh
- fetch the latest updates from git
cd Documents/dev/desech-studio
npm i
cd app
npm i
cd ..
npm run build-all-prod
npm run build-mac
- copy the mac files to the desech-download repo and push/pull
```

Web server

```sh
su sftp
cd /var/sftp/download.desech.com
git pull
```

## Check updates

Ubuntu

```sh
sudo apt update && sudo apt upgrade && sudo apt autoremove
```
- open Desech Studio and see if it updated

Manjaro

- open add/remove software to update
- open Desech Studio without logging in and see if it updated
- power off the vm

Fedora

```sh
sudo dnf update --refresh && sudo dnf upgrade
```
- open Desech Studio without logging in and see if it updated
- power off the vm

Windows/Mac

- open Desech Studio without logging in and see if it auto updates
- power off the vm

## Website update

- change the version numbers for Windows and Mac in the website
- deploy the website updates on the server
