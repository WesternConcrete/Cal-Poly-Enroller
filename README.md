The Cal Poly Flowchart Module is a personalized tool, integrated into the Cal Poly enrollment software, that allows students to track their major progress, plan future classes, and easily enroll in up-to-date courses, enhancing efficiency and effectiveness in academic planning. It helps students plan their classes more efficiently and effectively. Unlike the static flowcharts and PolyFlow, our product will be integrated with up-to-date Cal Poly class data and will be automatically configured based on the user’s class history. It will also be integrated with the enrollment software to allow students to easily enroll in classes that they plan to take at the start of each quarter.

Please note we only had two primary programmers for this project (as one of our team mates was primarily dedicted for design), so we did as much as we could handle throughout the quarter.


##UI Prototype## https://tinyurl.com/ui-calpolyflowchart

***Diagram*** https://github.com/WesternConcrete/307FinalProject/wiki/Diagram

Setting up ESLint in Visual Studio Code:
1. Install ESLint globally: Open your terminal or command prompt and run the following command: 
   npm install -g eslint
2. Install the ESLint extension in Visual Studio Code: Launch Visual Studio Code and go to the Extensions view (click on the square icon in the left sidebar or press Ctrl+Shift+X). Search for "ESLint" in the search bar, and click "Install" next to the ESLint extension.
3. Configure ESLint: Open the root folder of your project in Visual Studio Code.
   In the terminal or command prompt, navigate to the project's root directory.
   Run the following command to initialize ESLint configuration:
   eslint --init

Install the Prettier extension in Visual Studio Code: 
1. In the Extensions view, search for "Prettier - Code formatter" and click "Install" next to the Prettier extension.
2. In Visual Studio Code, go to "File" -> "Preferences" -> "Settings" (or use the shortcut Ctrl+,) to open the settings.
3. Search for "Default Formatter" and select "esbenp.prettier-vscode" as the default formatter for your project.
4. Customize Prettier settings (optional): If you want to customize Prettier's behavior, you can modify its settings. Search for "Prettier" in the settings and adjust the options according to your preferences.
5. Enable format on save (optional): To automatically format your code with Prettier on save, search for "Editor: Format On Save" in the settings and enable it.



***Development Environment***:

Using node 18:

Correctly set environment variables in .env.local at ~/kanban-dashboard/

```
cd kanban-dashboard
npm install
npm run postinstall

npm run dev
```

***CI/CD Notes***:

For our CI/CD, we used Vercel. Basically, instead of explicitly creating a .yml for our Github Actions, 
we configured a Vercel project to be attached to our repository. Then, for every branch, whenever there 
is a push to that branch, Vercel makes a deployment for that branch. Our production branch for "main" 
can be found on '307-final-project.vercel.app'.

All required environment variables are stored on Vercel, but unfortunately with Vercel's pricing plan 
we cannot share the actual Vercel project with the instructor, it is only available to 2wconvery@gmail.com.

***Integration notes***:

Any time we want to develop a new feature, we developed a strategy of creating branches and merging them back into main. 
This strategy is as follows:

Whenever you are making a new change
   - checkout "main"
   - pull main
   - checkout a new sandbox branch that you will develop on from main
   - when you are done, push your changes to this new branch
   - checkout main
   - pull main
   - checkout a new "merge" branch from main
   - on this new "merge" branch, do a "git merge <branch-name>" on your sandbox branch
   - resolve merge conflicts on this new merge branch
   - run linters
   - once all conflicts are resolved and all is linted, push changes to the merge branch
   - create a PR to pull this merge branch into main
   - approve the PR
   
This process minimizes merge conflicts and ensures that we are safely updating the repo.
