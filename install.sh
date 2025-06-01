pkg up -y
pkg install nodejs git gh -y
npm config set bin-links false
npm install -g firebase-tools --force --legacy-peer-deps --no-optional
git config --global --add safe.directory /storage/emulated/0/dev/.mj-m
git config --global user.email "swk1072@gmail.com"
git config --global user.name "seo won kyeom"
firebase login
gh auth login