ciruela
=======

A simple continuous integration server targeting users of Mocha under Node.js with their project hosted on GitHub. On a new commit, ciruela will grab the latest changes from your repo, run a make test, and email you whether the commit passed or failed your tests.

# Requirements
1. A Node.JS repo hosted on GitHub using Mocha
1. A Mocha test configuration called "test-ciruela". ciruela will call *make test-ciruela*, e.g.:  

```
    test-ciruela:  
        @NODE_ENV=test ./node_modules/.bin/mocha \  
                --ui bdd \  
                --timeout 5s \  
                --reporter json \  
                $(TESTS)
```

# Installation

1. Clone the source and install deps

```
    git clone https://github.com/tnktp/ciruela.git  
    cd ciruela && npm install
```

1. Configure your to & from email address and mail server

```
    cp environments/production.json-sample environments/production.json  
    vi environments/production.json
```

1. Run ciruela

```
    env NODE_ENV=production PORT=xxx node app.js
```

1. Add the contents of .ssh/id_rsa.pub to the deploy keys on your repo. Alternatively, create a deploy key if you don't already have one and then add it under settings for your GitHub repo. For OpenSSH:

```
    ssh-keygen -t rsa -b 4096
```

1. On GitHub, under your repo->Settings->Service Hooks, add your publically addressable URL (e.g. http://yourhost.yourdomain.com:3000) under WebHook URLs.
