### Workflow

### Open the Visual Studio Code application

Within Visual Studio, open the project. It is titled fridge.

Within the project, most of what you will be editing is within src/App.js

### Open Terminal within Visual Studio Code

A black box should open at the bottom of your screen. From there you can type commands.

### run `git pull`

This will pull down the latest code.

### run `npm run start` from within the fridge directory

Runs the app in the development mode.\
Open [http://localhost:3001](http://localhost:3001) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### Once you are ready to push your changes

Save your code within the editor

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `git add .`

This will add all of your changes to git

### `git commit -m "your commit message"`

### `git push origin main`

Check to see if your code pushed - https://github.com/ChristaCode/fridge

Heroku is configured to deploy the site once anything is pushed to the Main branch on github. It may take a few minutes to see your changes on the site.

### Transfer DB to Heroku

pg_dump -Fc --no-acl --no-owner -h localhost -U cookecd1 fridge > db.dump

google drive link format - https://drive.google.com/uc?export=download&id=1Q7MB6smDEFd-PzpqK-3cC2_fAZc4yaXF
