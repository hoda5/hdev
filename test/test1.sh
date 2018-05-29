#!/bin/bash

set -e

cd `dirname $0`/..
DIR=`pwd`
TEMP=`realpath $DIR/tmp`
VERBOSE='--verbose'

echo pasta de teste: $TEMP

mnpm="node $DIR/dist/hdev.js"

rm -Rf $TEMP
mkdir -p $TEMP

cd $TEMP

$mnpm init $VERBOSE

if $mnpm status $VERBOSE
then
  echo status em repositório vazio deveria falhar
  exit 1
fi

$mnpm clone https://github.com/hoda5/somalib.git $VERBOSE

# if $mnpm status
# then
#   echo 'adicionado com sucesso'
# else
#   echo status deveria ter retornado o repositório @hoda5/somalib
#   exit 1
# fi

# $mnpm add @hoda5/somaapp https://github.com/thr0w/somaApp.git

# $mnpm

# $mnpm remove @hoda5/somalib

# if $mnpm status
# then
#   echo status em repositório vazio deveria falhar
#   exit 1
# fi
