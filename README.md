# Desech Studio

## Install Repo

```sh
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
npm run build-all-dev
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
sudo apt install rpm alien libarchive-tools
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

On your computer, generate a gpg key

```sh
gpg --full-generate-key
  Key: (1) RSA default
  Keysize: 4096
  Real Name: Desech
  Email: contact@desech.com
  Passphrase [bitwarden]
gpg --list-keys --with-colons
  from `pub:u:4096:1:466DA09847B071CF:1614977408:::u:::scESC::::::23::0:`, id is `466DA09847B071CF`
  or you can open the passwords gui app
```

### Apt

Export the keys

```sh
mkdir -p ~/share/download.desech.com/apt
cd ~/share/download.desech.com/apt
gpg --export 466DA09847B071CF > desech-archive-keyring.gpg
gpg --export --armor 466DA09847B071CF > desech-archive-keyring.asc
```

Setup reprepro

```sh
sudo apt install -y reprepro
mkdir conf
nano conf/options
  ask-passphrase
nano conf/distributions
  Codename: apt
  Components: stable
  Architectures: amd64
  SignWith: 466DA09847B071CF
```

Add/upgrade the deb file

```sh
reprepro -b /home/vioi/share/download.desech.com/apt includedeb apt /home/vioi/dev/desech-studio/dist/desech-studio-1.0.0-amd64.deb
  [use the passphrase from bitwarden only once]
reprepro -b /home/vioi/share/download.desech.com/apt list apt
# reprepro -b /home/vioi/share/download.desech.com/apt remove apt desech-studio
```

Copy the files to the server

- Open the file explorer, press CTRL + L, and then sftp://sftp@git.desech.com:5522/download.desech.com

How to install

```sh
wget -qO - https://download.desech.com/apt/desech-archive-keyring.asc | gpg --dearmor | sudo tee /usr/share/keyrings/desech-archive-keyring.gpg > /dev/null
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/desech-archive-keyring.gpg] https://download.desech.com/apt apt stable" | sudo tee /etc/apt/sources.list.d/desech.list > /dev/null
sudo apt update && sudo apt install -y desech-studio
```

### Dnf

Setup the folder on your computer

```sh
mkdir -p ~/share/download.desech.com/dnf
- copy the rpm file
sudo chmod 777 -R ~/share
sudo chown -R libvirt-qemu:kvm ~/share
```

Setup createrepo on fedora vm

```sh
sudo createrepo -v /home/fedora/share/download.desech.com/dnf
sudo nano /home/fedora/share/download.desech.com/dnf/desech-studio.repo
  [desech-studio]
  name=Desech Studio
  baseurl=https://download.desech.com/dnf
  enabled=1
  gpgcheck=0
```

Add/upgrade the rpm file on fedora vm

```sh
- replace the old rpm with the new rpm
sudo createrepo -v /home/fedora/share/download.desech.com/dnf
```

Copy the files to the server

- Open the file explorer, press CTRL + L, and then sftp://sftp@git.desech.com:5522/download.desech.com

How to install

```sh
sudo dnf config-manager --add-repo https://download.desech.com/dnf/desech-studio.repo
sudo dnf update && sudo dnf install -y desech-studio
sudo nano /etc/yum.repos.d/desech-studio.repo
```

### Pacman

Setup the folder on your computer

```sh
mkdir -p ~/share/download.desech.com/pacman
- copy the pacman file
sudo chmod 777 -R ~/share
sudo chown -R libvirt-qemu:kvm ~/share
```

Setup repoctl on manjaro vm

```sh
sudo pacman -S --needed base-devel
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
yay repoctl
sudo -s
repoctl conf new /home/manjaro/share/download.desech.com/pacman/desech-studio.db.tar.zst
```

Add/upgrade the pacman file on manjaro vm

```sh
#sudo -s
repoctl reset
repoctl add /home/manjaro/share/download.desech.com/pacman/desech-studio-1.0.0.pacman
  wait till the lock file disappears
repoctl status -a
```

Copy the files to the server

- Open the file explorer, press CTRL + L, and then sftp://sftp@git.desech.com:5522/download.desech.com

How to install

```sh
echo -e "\n[desech-studio]\nSigLevel = Optional TrustAll\nServer = https://download.desech.com/pacman" | sudo tee -a /etc/pacman.conf
sudo pacman -Syy desech-studio
```

## Docker windows [not finished]

- Install docker

```sh
sudo apt update && sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install docker-ce docker-ce-cli containerd.io
```

```sh
sudo docker pull electronuserland/builder:wine
sudo docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/project \
 -v ${PWD##*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine
```

## Plugins

```sh
cd ~/dev/github
git clone git@github.com:desech/studio-plugins.git
cd ~/.config/Electron/plugin
git clone git@github.com:desech/studio-material-design.git desech-studio-material-design
git clone git@github.com:desech/studio-react.git desech-studio-react
git clone git@github.com:desech/studio-angular.git desech-studio-angular
git clone git@github.com:desech/studio-vue.git desech-studio-vue
```

## Import

### Elements
- pages will be converted to folders
- top level visible groups or frames/artboards will be converted to files
- only svg and image elements with export options, are imported
- elements that don't fit inside containers are ignored and need to be adjusted and re-imported
- clear `_desech/cache` to re-fetch images

### Style
- we can't have width and height for each element, because responsive will be hard
   - icons are an exception
- on grids:
   - we don't set the columns width and leave it auto, because responsive will be hard
   - we don't add margins to grid children, because you usually want to use alignment on parent
   - we leave the 10px default gap, because all grids would have gap set to 0
- we can't have font-size 16px for each element, we assume this is the default size
- we can't have font-family for each element, we set this on main containers instead
- components

### Bugs
- wrong angle and color positions on linear and radial gradients
- figma:
  - rotation is not supported because not enough info is provided
  - vectors with gradients and bg images will not be shown correctly when inside html
  - multiple backgrounds with images will be exported with the solid colors and gradients,
    although we also add the solid colors and gradient background on top of the processed image
    - a solution to this is to keep your images and background images in separate layers
- adobexd:
  - text width and height is approximated, wait for adobexd to provide exact values
  - text-transform is not present in the style property, only in the rangeStyles
    which are buggy, wait for adobexd to add it in the style too
  - masked vectors are not supported because we don't know how to calculate the transform
  - autolayout is not supported because it applies to groups and groups have no x,y,w,h

### TODO:
- lines are <hr>; no bg color on <hr>
- filter shadow on svg; opacity effect and bg opacity
- adobexd
   - svg masked shapes
   - background image for all type of svgs
   - autolayout, meta.ux.repeatGrid
- sketch
   - remove empty em's - check AdobexdInline
   - svg masked shapes
   - background image for all type of svgs
   - autolayout, meta.ux.repeatGrid
- figma
   - remove empty em's - check AdobexdInline
   - svg masked shapes
   - background image for all type of svgs

### Features:
- we do import figma auto-layout which sets the gap, padding, justify-content and align-content



-------------------------------------------------------------------------------



## Build Studio Linux

- disconnect VPN
- change version in `package.json` and `app/package.json`

```sh
sudo apt update && sudo apt upgrade && sudo apt autoremove
cd ~/dev/desech-studio
npm run build-all-prod
npm run build-linux-x86
reprepro -b ~/share/download.desech.com/apt includedeb apt ./dist/desech-studio-1.1.2-amd64.deb
reprepro -b /home/vioi/share/download.desech.com/apt list apt
cp ./dist/desech-studio-1.1.2-x86_64.rpm ~/share/download.desech.com/dnf
cp ./dist/desech-studio-1.1.2-x64.pacman ~/share/download.desech.com/pacman
sudo chmod 777 -R ~/share/download.desech.com
```

Fedora

```sh
sudo dnf update && sudo dnf upgrade && sudo dnf autoremove
sudo rm -rf ~/share/download.desech.com/dnf/repodata
sudo createrepo -v ~/share/download.desech.com/dnf
```

Manjaro

- open software and update

```sh
sudo -s
repoctl add /home/manjaro/share/download.desech.com/pacman/desech-studio-1.1.2-x64.pacman
  - File Explorer > go to `~/share/download.desech.com/pacman/`
  - when the lock file disapears cancel the process
repoctl status -a
```

Ubuntu

```sh
sudo chmod 777 -R ~/share/download.desech.com
```

- leave only the last 2 versions in `~/share/dnf` and `pacman` 
- copy everything from `~/share` to sftp
- leave only the last 2 versions in `apt/pool/stable/d/desech-studio`, `dnf` and `pacman` on sftp
- open software and update
- open Desech Studio and see if it updated

Fedora

```sh
sudo dnf update && sudo dnf upgrade
```

- open Desech Studio without logging in and see if it updated
- power off the vm

Manjaro

- open add/remove software to update
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

- copy the `latest.yml` and exe file to sftp and leave only the last 2 versions
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

- copy the `latest-mac.yml`, dmg and zip file to sftp and leave only the last 2 versions
- open Desech Studio without logging in and see if it auto updates

## Website update

- change the version numbers for Windows and Mac in the website
- deploy the website updates on the server
