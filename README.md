A project template to start a static site.
===

Uses:
* Grunt
* Assemble

To deploy to gh-pages
---
```
git subtree push --prefix dist origin gh-pages
```

To start a project from this template
---
```bash
mkdir proj; cd proj;
git clone git@github.com:thedustinsmith/static-template.git;
rm -rf .git;
git init;
git remote add origin git@github.com:thedustinsmith/proj.git;
git add .;
```