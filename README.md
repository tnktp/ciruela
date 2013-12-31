ciruela
=======

A simple continuous integration server targeting users of Mocha under Node.js with their project hosted on GitHub. On a new commit, ciruela will grab the latest changes from your repo, run a make test, and email you whether the commit passed or failed your tests.

# Requirements
1. A Node.JS repo hosted on GitHub using Mocha
1. A Mocha test configuration called "test-ciruela". ciruela will call *make test-ciruela*, e.g.:  

    test-ciruela:
        @NODE_ENV=test ./node_modules/.bin/mocha \
                --ui bdd \
                --timeout 5s \
                --reporter json \
                $(TESTS)

# Installation is a snap

1. Grab and run the source

    git clone https://github.com/tnktp/ciruela.git
    cd ciruela && npm install

1. Configure where you want emails to go

    vi environments/production.json

1. Run ciruela

    node app.js

1. Add the contents of .ssh/id_rsa.pub to the deploy keys on your repo. Alternatively, create a deploy key if you don't already have one and then add it under settings for your GitHub repo. For OpenSSH:

    ssh-keygen -t rsa -b 4096

1. On GitHub, under your repo->Settings->Service Hooks, add your publically addressable URL (e.g. http://machine.yourdomain.com:3000) under WebHook URLs.

# Notes

1. The default port is 3000 but is configurable via the PORT environment varibale. e.g. *env PORT=xxx node app.js* will run ciruela on a different port.
