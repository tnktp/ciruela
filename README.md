ciruela
=======

A simple continuous integration server targeting Mocha for Node.js.

# Installation
1. Do a git pull of the ciruela repository to a subfolder of your working directory, as ciruela will download the project under its parent folder.
1. npm install
1. env PORT=xxx node app.js *(if unspecified, default port is 3000)*
1. Add webhook to github, for your project, pointing to the ciruela server address
1. ciruela git clones with the ssh url, so the account ciruela is run with, should have valid ssh keys, and be able to clone the git repository.
1. Make sure your repo has a Makefile with a make test-ciruela command, because ciruela will run that command in order to make the tests.

###Use 

Once ciruela is installed and running and the webhook is configured, any **git push** will launch a test. You may also initiate a test run by pressing the test button under GitHub's webhook settings.

After receiving the callback from GitHub, Ciruela will clone the repo, run tests done via mocha with the makefile set up correctly to receive a make test-ciruela command.

Once Ciruela is done with the testing it will send an email with from recipient being set on the environments files. The recipient emails, must be set on environments settings as well, as is shown on the files under environment directory of the project.
