# Desech Studio

## Install Repo

```sh
cd ~/dev/desech-studio
cp .config.json config.json
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

## Build Studio

```sh
- change version in `package.json` and `app/package.json`
cd ~/dev/desech-studio
npm run build-all-prod
DEBUG=electron-builder npm run pack-linux-x86
npm run build-linux-x86
npm run build-win
npm run build-mac
  make sure you have xcode installed for the notarizing tools
```

Utilities

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
reprepro -b /home/vioi/share/download.desech.com/apt includedeb apt /home/vioi/dev/desech-studio/dist/desech-studio_1.0.0_amd64.deb
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
  at some point CTRL+C because it hangs forever
repoctl status -a
```

Copy the files to the server

- Open the file explorer, press CTRL + L, and then sftp://sftp@git.desech.com:5522/download.desech.com

How to install

```sh
echo -e "\n[desech-studio]\nSigLevel = Optional TrustAll\nServer = https://download.desech.com/pacman" | sudo tee -a /etc/pacman.conf
sudo pacman -Syy desech-studio
```

## Windows/Mac Updates

- Build the new file
- For windows copy the `latest.yml` and exe file to sftp
- For mac copy the `latest-mac.yml`, dmg and zip file to sftp
- Delete the 2 versions behind file from sftp
- Update the exe/dmg link and changelog in the download website page

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
