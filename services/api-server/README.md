# Installing

1. Copy environment over from example.

```
cp .env.example .env
```

2. Install Python 3 managed by pyenv

## Windows Installation

```
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
choco install pyenv-win
pyenv install 3.8.12
pyenv global 3.8.12

```

## OSX / Linux Installation

```
pyenv install 3.8.12
```

Installation may fail on Big Sur (OS X 11.0.1); to fix...

```
brew reinstall zlib bzip2

LDFLAGS="-L/usr/local/opt/zlib/lib -L/usr/local/opt/bzip2/lib" CPPFLAGS="-I/usr/local/opt/zlib/include -I/usr/local/opt/bzip2/include" CFLAGS="-I$(brew --prefix openssl)/include -I$(brew --prefix bzip2)/include -I$(brew --prefix readline)/include -I$(xcrun --show-sdk-path)/usr/include" LDFLAGS="-L$(brew --prefix openssl)/lib -L$(brew --prefix readline)/lib -L$(brew --prefix zlib)/lib -L$(brew --prefix bzip2)/lib" pyenv install --patch 3.8.12 < <(curl -sSL https://github.com/python/cpython/commit/8ea6353.patch\?full_index\=1)
```

More information on this [here](https://github.com/pyenv/pyenv/issues/1740).

After python 3.8.12 is installed,

```
pyenv global 3.8.12
```

Follow post-install instructions for pyenv [here](https://github.com/pyenv/pyenv#homebrew-on-macos).

3. Install virtualenv

```
brew install virtualenv
```

4. Install postgres

```
brew install postgresql
```

5. Create your virtualenv directory and activate it

```
virtualenv -p $(pyenv which python) ~/GitHub/venvs/bespoke
source ~/GitHub/venvs/bespoke/bin/activate
```

6. From `platform/`, run `make setup`. If you have Ubuntu, call `make setup-for-linux`.

7. Please edit your `~/.zshrc` file to include the following lines necessary for our dependencies based on your computer's architecture:

```
# M1 only
export GRPC_PYTHON_BUILD_SYSTEM_OPENSSL=1
export GRPC_PYTHON_BUILD_SYSTEM_ZLIB=1
```

8. Once you have virtualenv, system libraries and pyenv setup, you can now install your requirements inside that environment:

```
cd services/api-server
pip3 install -r requirements.txt
```

9. NOTE: Update requirements.in, and then use `make update-requirements` which will generate the requirements.txt file.

# Running

From this directory...

Start up hot-reloading Python server on localhost:7000...

```
make runlocal
```

Start up the hot-reloading Python server for asynchronous tasks on localhost:7001...

```
make run-async-local
```

If you run into the issue "port 7000 already is use", the new AirPlay Receiver may have started on this port. You can disable the AirPlay Receiver to free up the port in System Preferences > Sharing.

# Contributing

Before you push new changes, from this directory...

Run mypy...

```
make mypy

make mypy-tests
```

Run tests...

```
# Run all tests
make run-test-local
# Run a file of tests
make run-test-local NAME=unit.bespoke.finance.test_contract_util
# Run a single test (in a file of tests)
make run-test-local NAME=unit.bespoke.finance.test_contract_util.TestContractHelper.test_missing_start_date
```

## Restoring a Database from Another

Take a dump of the OLD database

	PGPASSWORD=xxx pg_dump -Fc --no-acl --no-owner -h $HOSTNAME -U $USER $DATABASE > db.dump

Put it at some publicly accessible place (like s3)

	aws s3 cp db.dump s3://$SOMEWHERE

The S3 URL will need to be publicly accessible. You can either put it in a public bucket (bad) or generate a signed url

	aws s3 presign s3://$SOMEWHERE

Then restore your NEW database from the dump

	heroku pg:backups:restore $MY_SIGNED_URL $NEW_DATABASE_NAME --app $APP
