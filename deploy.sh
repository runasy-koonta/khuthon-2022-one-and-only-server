# Force sync origin to remote
git checkout main
git reset --hard origin/main
git pull -r

# Build react app
npm install
npm run build

# Move build file to root directory
mv ./src/index.js .

# Run it with forever
./node_modules/forever/bin/forever start -w index.js