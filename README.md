ciruela
=======

A customizable continuous integration server written in nodeJS.


# Installation
1. Do a git pull of the ciruela repository, preferably to a subfolder on the root system, because ciruela will download the project to a parent folder, and run the tests there.

2. Run node app.js

3. Add webhook to github, for your project, pointing to the ciruela server address

4. Ciruela git clones with the ssh url, so the account ciruela is run with, should have valid ssh keys, and be able to clone the git repository.

5. Make sure your repo has a Makefile with a make test-ciruela command, because ciruela will run that command in order to make the tests.



###Use 
Once ciruela is installed and running, and the webhook is configured properly, just do a gitpush or send a test request by pressing the test button under the webhook settings.

Ciruela will receive the post, process it and then it will clone the repo, run tests done via mocha with the makefile set up correctly to receive a make test-ciruela command.

Once Ciruela is done with the testing it will send an email with from recipient being set on the environments files. The recipient emails, must be set on environments settings as well, as is shown on the files under environment directory of the project.