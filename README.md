A Image Cropper built on top of jQuery
===

To Get Set Up With Github
---
Download a github shell from here: http://msysgit.github.io/

Follow these steps starting with Step 3: https://help.github.com/articles/set-up-git/
(You can setup a ssh-key if you'd like, or use the https method.  Either is fine)


To Get Setup with NodeJS
---
Download nodejs for windows from here: http://nodejs.org/ ... install it.


Basic Git Commands
---
If using ssh keys
```
git clone git@github.com:Foliotek/ImageCropper.git
```

If using https
```
git clone https://github.com/Foliotek/ImageCropper.git
```

--- The above command is similar to an SVN checkout.  It pulls the repository down.  It will create a directory for you, you need to cd into that directory.


Other Commands to know
---
```
git pull  //similar to svn update
git commit -am '[Commit Message Here]' // similar to svn commit, but it doesn't push the code to the repo.
git push origin master // will push your code to the repo.  This is IMPORTANT.  Your changes will only be local until you run this command.
git checkout -b [New Branch Name] // Create a new branch and switch your local repo to it
git checkout [Existing Branch Name] // check out from an existing branch
git push origin [branch] // If you're in a branch, this is what you'll want to do.
```

Knowledge specific to Croppie
---
`bower install`
However you like to run static sites on your machine, go for it.  Personally, I use `npm install -g node-static`.
Then I can run `static` on the command line and it starts a static web server for me.


Last Notes
---
To Publish to gh-pages `git subtree push --prefix dist origin gh-pages`