ciruela
=======

A simple continuous integration server targeting users of Mocha under Node.js with their project hosted on GitHub. On a new commit, ciruela will grab the latest changes from your repo, run a make test, and email you whether the commit passed or failed your tests.

# Requirements
1. A Node.JS repo hosted on GitHub using Mocha
1. Git CLI tools in your path
1. A recent version of node (tested on v0.10.20+)
1. A Mocha test configuration called "test-ciruela". ciruela will call *make test-ciruela*, e.g.:  

```
    test-ciruela:  
        @NODE_ENV=test ./node_modules/.bin/mocha \  
                --ui bdd \  
                --timeout 5s \  
                --reporter json \  
                $(TESTS)
```
1. A Mocha test configuration called "test-cov". ciruela will call *make test-cov*, to build the coverage file e.g.: 

```
    test-cov: clean api-cov
        @NODE_ENV=test HTMLCOV=1 ./node_modules/.bin/mocha $(TESTS) --reporter html-cov > $(HTML_FILE)
        rm -fr api-cov

    api-cov:
        jscoverage api api-cov
     
    clean:
        rm -f test/reports/*
        rm -fr api-cov

```

# Installation

1. Clone the source and install deps

```
    git clone https://github.com/tnktp/ciruela.git  
    cd ciruela && npm install
    sudo apt-get install jscoverage Or brew install jscoverage
```

2. Configure your to & from email address and mail server

```
    cp environments/production.json-sample environments/production.json  
    vi environments/production.json
```

3. Run ciruela

```
    env NODE_ENV=production PORT=xxx node app.js
```

4. Add the contents of .ssh/id_rsa.pub to the deploy keys on your repo. Alternatively, create a deploy key if you don't already have one and then add it under settings for your GitHub repo. For OpenSSH:

```
    ssh-keygen -t rsa -b 4096
```

Make sure that you've cloned your repository using ssh at least once from the account which will be running ciruela. You'll need to accept GitHub's host key the first time you connect using this method.

```
$ git clone git@github.com:yourAccount/yourRepo.git
Cloning into 'yourRepo'...
The authenticity of host 'github.com (192.30.252.131)' can't be established.
RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'github.com,192.30.252.131' (RSA) to the list of known hosts.
remote: Counting objects: 8221, done.
remote: Compressing objects: 100% (2006/2006), done.
remote: Total 8221 (delta 5488), reused 8209 (delta 5478)
Receiving objects: 100% (8221/8221), 33.60 MiB | 7.63 MiB/s, done.
Resolving deltas: 100% (5488/5488), done.
```

5. On GitHub, under your repo->Settings->Service Hooks, add your publically addressable URL (e.g. http://yourhost.yourdomain.com:3000) under WebHook URLs.
