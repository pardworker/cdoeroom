ROOM & FACULTY ALLOCATION CONSOLE — GITHUB-ONLY VERSION
==========================================================

What this version does
--------------------------
Runs entirely on GitHub — no Netlify, no separate database, no other
service. Two GitHub features do all the work:

- GitHub Pages hosts the app itself (the HTML/CSS/JS).
- The GitHub REST API stores the shared schedule as a JSON file that
  lives in this same repo (data/schedule.json), and lets an admin
  update it directly from the browser.

Everyone who opens the site link sees the same schedule. Only someone
signed in with a GitHub Personal Access Token (explained below) can
upload, edit, or clear it.


One real tradeoff, up front
-------------------------------
With Netlify, changes went live for everyone within seconds. On GitHub
Pages, every update needs to rebuild and redeploy the site, which
usually takes 30–90 seconds. So:
- The admin who just made a change sees it instantly on their own
  screen (no waiting).
- Everyone else sees it within roughly a minute, not instantly.
This is a fundamental GitHub Pages behavior, not a bug — worth knowing
so it doesn't feel broken when a change doesn't appear immediately on
someone else's phone.

Also worth knowing: the schedule data file lives in your repo, so if
the repo is public, that JSON file is technically fetchable by anyone
who knows the URL, even without opening the app. If that matters to
you, make the repo private (GitHub Pages works with private repos on
free personal accounts too).


What's in this folder
----------------------
index.html                app + all the logic, including the part that
                           talks to GitHub's API
manifest.json, icon-*.png  home-screen install assets
service-worker.js          offline app-shell caching (never caches the
                           live schedule data itself)
data/schedule.json         placeholder — gets overwritten the first
                           time an admin uploads a file


STEP 1 — Create the repository
-----------------------------------
1. Create a free GitHub account if you don't have one: https://github.com
2. Create a new repository (public is simplest; private works too, see
   note above). Suggested name: room-allocation-console
3. Upload every file in this folder to that repository, keeping the
   data/ subfolder intact.


STEP 2 — Turn on GitHub Pages
----------------------------------
1. In the repository: Settings -> Pages.
2. Under "Build and deployment", Source: "Deploy from a branch".
3. Branch: main, folder: / (root). Save.
4. GitHub shows a URL like https://your-username.github.io/room-allocation-console/
   — it takes a minute or two to go live the first time.


STEP 3 — Point the app at your repo
----------------------------------------
Open index.html in this folder (or directly in GitHub's web editor) and
find these three lines near the top of the <script> section:

    const GH_OWNER = 'your-github-username';
    const GH_REPO = 'your-repo-name';
    const GH_BRANCH = 'main';

Change GH_OWNER to your GitHub username (or organization name), and
GH_REPO to the exact repository name you created in Step 1. Leave
GH_BRANCH as 'main' unless your default branch is named something else.
Save, and re-upload/commit this file if you edited it locally.


STEP 4 — Create a Personal Access Token (this is the "admin key")
-----------------------------------------------------------------------
This token is what lets someone sign in as admin. Anyone with it can
edit this repo's files, so scope it as tightly as possible:

1. Click your profile picture (top right) -> Settings.
2. Left sidebar, all the way down: Developer settings.
3. Personal access tokens -> Fine-grained tokens -> Generate new token.
4. Give it a name like "room-console-admin".
5. Set an expiration (90 days is a reasonable default — you'll just
   generate a new one and re-share it when it expires).
6. Repository access: "Only select repositories" -> choose the one
   repo you created in Step 1. Do NOT choose "All repositories".
7. Permissions -> Repository permissions -> Contents: set to
   "Read and write". Leave everything else as "No access".
8. Generate token, and copy it immediately (GitHub only shows it once).
9. Share this token only with whoever should be able to edit the
   schedule — treat it like a password. Because it's scoped to just
   this one repo with just Contents access, even if it leaked, someone
   could only edit this repo's files, not anything else in your account.


STEP 5 — Use it
--------------------
- Share the Pages URL from Step 2 with everyone who needs to VIEW the
  schedule — no sign-in needed, they just see it.
- Anyone who needs to UPLOAD or EDIT taps "Admin sign-in" at the bottom
  of the page and pastes the token from Step 4.
- For the installable home-screen app: open the link on a phone, then
  "Add to Home Screen" (Safari: Share icon; Chrome: menu -> Install app).


When the token expires
---------------------------
Fine-grained tokens can have an expiration date (Step 4 recommended 90
days). When it expires, admin sign-in will start failing with a clear
"token was rejected" message — just generate a new one following Step 4
again and share the new one.


A few things worth knowing
-----------------------------
- Only one schedule is stored at a time — uploading a new file replaces
  what everyone sees, same as before.
- If two admins edit at the same time, the last save wins — there's no
  merge.
- Viewers who lose their internet connection keep seeing the last
  version their device successfully loaded, with a small banner noting
  it may be out of date, until the connection comes back.
- Every admin change creates a normal Git commit in your repo's
  history — which is actually handy, since it gives you a free,
  automatic audit trail of every schedule change and who made it (if
  each admin uses their own token) and lets you revert to any past
  version straight from GitHub if needed.
