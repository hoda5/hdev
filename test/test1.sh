#!/bin/bash

set -e 

cd `dirname $0`/..
DIR=`pwd`
TEMP=$DIR/../multinpm.tmp

mnpm="node $DIR/dist/multinpm.js"

rm -Rf $TEMP
mkdir -p $TEMP

cd $TEMP

git init

$mnpm init

if $mnpm status 
then
  echo status em repositório vazio deveria falhar
  exit 1
fi 

$mnpm add @hoda5/somalib https://github.com/thr0w/somalib.git

if $mnpm status 
then
  echo 'adicionado com sucesso'
else
  echo status deveria ter retornado o repositório @hoda5/somalib
  exit 1
fi 

$mnpm remove @hoda5/somalib 

if $mnpm status 
then
  echo status em repositório vazio deveria falhar
  exit 1
fi 

