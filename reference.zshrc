export PATH="/opt/homebrew/opt/openssl@3/bin:$PATH"

# M1 settings needed for grpcio dependency
export GRPC_PYTHON_BUILD_SYSTEM_OPENSSL=1
export GRPC_PYTHON_BUILD_SYSTEM_ZLIB=1

export NVM_DIR="$HOME/.nvm"
  [ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
  [ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && . "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion

# PYENV
ARCH=`arch`
if [[ "${ARCH}"  == "arm64" ]]; then
    export PYENV_ROOT="~/.pyenv/arm64"
else
    export PYENV_ROOT="~/.pyenv/rosetta"
fi
PYENV_BIN="$PYENV_ROOT/bin"
export PYENV_SHELL=zsh
export PYTHONPATH=$PYENV_ROOT/shims


SDK_PATH="$(xcrun --show-sdk-path)"
export CPATH="${SDK_PATH}/usr/include"
export CFLAGS="-I${SDK_PATH}/usr/include/sasl $CFLAGS"
export CFLAGS="-I${SDK_PATH}/usr/include $CFLAGS"
export LDFLAGS="-L${SDK_PATH}/usr/lib $LDFLAGS"

if [[ "${ARCH}"  == "arm64" ]]; then
    PREFIX="/opt/homebrew/opt"
else
    PREFIX="/usr/local/opt"
fi

ZLIB="${PREFIX}/zlib"
BZIP2="${PREFIX}/bzip2"
READLINE="${PREFIX}/readline"
SQLITE="${PREFIX}/sqlite"
OPENSSL="${PREFIX}/openssl@1.1"
TCLTK="${PREFIX}/tcl-tk"
PGSQL="${PREFIX}/postgresql@10"
LIBS=('ZLIB' 'BZIP2' 'READLINE' 'SQLITE' 'OPENSSL' 'PGSQL' 'TCLTK')

for LIB in $LIBS; do

        BINDIR="${(P)LIB}/bin"
        if [ -d "${BINDIR}" ]; then
                export PATH="${BINDIR}:$PATH"
        fi

        LIBDIR="${(P)LIB}/lib"
        if [ -d "${LIBDIR}" ]; then
                export LDFLAGS="-L${LIBDIR} $LDFLAGS"
                export DYLD_LIBRARY_PATH="${LIBDIR}:$DYLD_LIBRARY_PATH"
                PKGCFGDIR="${LIBDIR}/pkgconfig"
                if [ -d "${PKGCFGDIR}" ]; then
                        export PKG_CONFIG_PATH="${PKGCFGDIR} $PKG_CONFIG_PATH"
                fi
        fi

        INCDIR="${(P)LIB}/include"
        if [ -d "${INCDIR}" ]; then
                export CFLAGS="-I${INCDIR} $CFLAGS"
        fi

done

export CPPFLAGS="${CFLAGS}"
export CXXFLAGS="${CFLAGS}"

export PYTHON_CONFIGURE_OPTS="--enable-framework"
export PYTHON_CONFIGURE_OPTS="--with-openssl=$(brew --prefix openssl) ${PYTHON_CONFIGURE_OPTS}"
export PYTHON_CONFIGURE_OPTS="--with-tcltk-includes='-I$(brew --prefix tcl-tk)/include' ${PYTHON_CONFIGURE_OPTS}"
export PYTHON_CONFIGURE_OPTS="--with-tcltk-libs='-L$(brew --prefix tcl-tk)/lib -ltcl8.6 -ltk8.6' ${PYTHON_CONFIGURE_OPTS}"

export HASURA_GRAPHQL_ADMIN_SECRET=myadminsecretkey
