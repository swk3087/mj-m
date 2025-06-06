pkg up -y
pkg install nodejs-lts python git gh -y
npm config set bin-links true
npm install -g firebase-tools --no-optional
export PATH="$HOME/.npm-global/bin:$PATH"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
ln -s $HOME/.npm-global/lib/node_modules/firebase-tools/lib/bin/firebase.js $PREFIX/bin/firebase
chmod +x $PREFIX/bin/firebase
git config --global --add safe.directory /storage/emulated/0/dev/.mj-m
git config --global user.email "swk1072@gmail.com"
git config --global user.name "seo won kyeom"
firebase login
gh auth login