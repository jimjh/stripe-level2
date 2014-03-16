#!/bin/sh

npm install

BASE=$(dirname $0)

# download and build nginx
if [ ! -d ${BASE}/nginx ]; then
  [ -f nginx-1.4.6.tar.gz ] || wget http://nginx.org/download/nginx-1.4.6.tar.gz
  tar -xvf nginx-1.4.6.tar.gz
  cd nginx-1.4.6
  ./configure --prefix=$(readlink -f ${BASE}/nginx)
  make
  make install
  cd -
fi

# ${BASE}/nginx/sbin/nginx -c ${BASE}/conf/nginx.conf
