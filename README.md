## Getting Started

[Optional] Use virtualenv and pyenv to keep your dependencies within your virualenv (not the entire machine)
1. Install pyenv. On Mac, you can use brew
```
brew install pyenv
```
2. Install Python 3 managed by pyenv
```
pyenv install 3.7.7
pyenv global 3.7.7
```
3. Install virtualenv
```
pip3 install virtualenv
brew install pyenv-virtualenv
```
4. Create your virtualenv directory and activate it
```
virtualenv -p $(pyenv which python) ~/GitHub/venvs/bespoke
source ~/GitHub/venvs/bespoke/bin/activate
```

5. Run `make setup`
5a. Next, if you have a Mac, call `make setup-for-mac`. If you have Ubuntu, call `make setup-for-linux`

6. Once you have virtualenv, system libraries and pyenv setup, you can now install your requirements inside that environment:
```
pip3 install -r requirements.txt
pip3 install -r local_requirements.txt
```

7. NOTE: Update requirements.in, and then use `make update-requirements` which will generate the requirements.txt file.