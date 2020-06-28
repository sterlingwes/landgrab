#!/bin/sh

set -e

pushd dist
git init
git add .
git commit -m "manual deploy"
git push -f git@github.com:sterlingwes/landgrab.git HEAD:gh-pages
rm -rf .git

popd
