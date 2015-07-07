#!/bin/bash

set -o errexit -o nounset

if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "Skipping deployment to NuGet because this is a pull request"
  echo "Skipping deployment to gh-pages because this is a pull request"
  exit 0
fi

echo $TRAVIS_TAG
if [[ "$TRAVIS_TAG" == "" ]]; then
  echo "Skipping deployment to NuGet because this is not a tagged commit"
  echo "Skipping deployment to gh-pages because this is not a tagged commit"
  exit 0
fi

VER=${TRAVIS_TAG#v}
echo $VER

echo "Deploying NuGet package"

nuget pack package.nuspec -Version $VER

echo "Deploying gh-pages"

cd pages

git init
git config user.name "CI"
git config user.email "CI@github.com"

git remote add upstream "https://$GH_TOKEN@github.com/shaftware/cmdrjs.git"
git fetch upstream
git reset upstream/gh-pages

echo "www.cmdrjs.com" > CNAME

touch .

git add -A .
git commit -m "${TRAVIS_TAG} deploy"
git push -q upstream HEAD:gh-pages