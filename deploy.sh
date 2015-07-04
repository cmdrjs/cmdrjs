#!/bin/bash

set -o errexit -o nounset

rev=$(git rev-parse --short HEAD)

cd pages

git init
git config user.name "CI"
git config user.email "CI@github.com"

git remote add upstream "https://$GH_TOKEN@github.com/shaftware/cmdrjs.git"
git fetch upstream
git reset upstream/gh-pages

echo "www.cmdjrs.com" > CNAME

touch .

git add -A .
git commit -m "rebuild pages at ${rev}"
git push -q upstream HEAD:gh-pages