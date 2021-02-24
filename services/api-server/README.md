# Installing

1. Copy environment over from example.

```
cp .env.example .env
```

2. Install Python 3 managed by pyenv

```
pyenv install 3.7.7
```

Installation may fail on Big Sur (OS X 11.0.1); to fix...

```
brew reinstall zlib bzip2

LDFLAGS="-L/usr/local/opt/zlib/lib -L/usr/local/opt/bzip2/lib" CPPFLAGS="-I/usr/local/opt/zlib/include -I/usr/local/opt/bzip2/include" CFLAGS="-I$(brew --prefix openssl)/include -I$(brew --prefix bzip2)/include -I$(brew --prefix readline)/include -I$(xcrun --show-sdk-path)/usr/include" LDFLAGS="-L$(brew --prefix openssl)/lib -L$(brew --prefix readline)/lib -L$(brew --prefix zlib)/lib -L$(brew --prefix bzip2)/lib" pyenv install --patch 3.7.7 < <(curl -sSL https://github.com/python/cpython/commit/8ea6353.patch\?full_index\=1)
```

More information on this [here](https://github.com/pyenv/pyenv/issues/1740).

After python 3.7.7 is installed,

```
pyenv global 3.7.7
```

Follow post-install instructions for pyenv [here](https://github.com/pyenv/pyenv#homebrew-on-macos).

3. Install virtualenv

```
pip3 install virtualenv
```

4. Create your virtualenv directory and activate it

```
virtualenv -p $(pyenv which python) ~/GitHub/venvs/bespoke
source ~/GitHub/venvs/bespoke/bin/activate
```

5. From `platform/`, run `make setup`. If you have Ubuntu, call `make setup-for-linux`.

6. Once you have virtualenv, system libraries and pyenv setup, you can now install your requirements inside that environment:

```
cd services/api-server
pip3 install -r requirements.txt
```

7. NOTE: Update requirements.in, and then use `make update-requirements` which will generate the requirements.txt file.

# Running

From this directory...

Start up hot-reloading Python server on localhost:7000...

```
make runlocal
```

# Contributing

Before you push new changes, from this directory...

Run mypy...

```
make mypy
```

Run tests...

```
make run-test-local
```
