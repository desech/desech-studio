# Desech Studio

## Install Repo

- Open Passwords and keys > Import from file > Desech.gpg (from bitwarden)

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
```

## Build Studio Linux

- disconnect VPN
- change version in `package.json` and `app/package.json`

```sh
sudo apt update && sudo apt upgrade && sudo apt autoremove
cd ~/dev/desech-studio
npm run build-all-prod
npm run build-linux-x86
reprepro -b ~/dev/desech-download/apt includedeb apt ./dist/desech-studio-2.0.0-amd64.deb
reprepro -b ~/dev/desech-download/apt list apt
- remove the previous deb file in apt/pool/stable/d/desech-studio
cp ./dist/desech-studio-2.0.0-x86_64.rpm ~/dev/desech-download/dnf
cp ./dist/desech-studio-2.0.0-x64.pacman ~/dev/desech-download/pacman
```

Manjaro

- open software and update

```sh
sudo -s
repoctl add /home/manjaro/dev/desech-download/pacman/desech-studio-2.0.0-x64.pacman
  - File Explorer > go to `~/dev/desech-download/pacman`
  - when the lock file disappears cancel the process
  - remove the previous pacman file
```

Fedora

```sh
sudo dnf update --refresh && sudo dnf upgrade --refresh && sudo dnf autoremove
- remove the previous rpm file
sudo createrepo -v /home/fedora/dev/desech-download/dnf
```

- copy everything from `~/share` to sftp
- leave only the last 2 versions in `apt/pool/stable/d/desech-studio`, `dnf` and `pacman` on sftp

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

## Build Studio Windows

- check window updates
- fetch the latest updates from git

```sh
cd Documents/dev/desech-studio
npm i
cd app
npm i
cd ..
npm run build-all-prod
npm run build-win
```

- copy all the new files to sftp and leave only the last 2 versions
- open Desech Studio without logging in and see if it auto updates

## Build Studio Mac

- fetch the latest updates from git

```sh
cd Documents/dev/desech-studio
npm i
cd app
npm i
cd ..
npm run build-all-prod
npm run build-mac
```

- copy all the new files to sftp and leave only the last 2 versions
- open Desech Studio without logging in and see if it auto updates

## Website update

- change the version numbers for Windows and Mac in the website
- deploy the website updates on the server
