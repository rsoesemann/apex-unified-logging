#!/bin/bash
source `dirname $0`/config.sh

execute() {
  $@ || exit
}

if [ -z "$secrets.DEV_HUB_URL" ]; then
  echo "set default devhub user"
  execute sfdx force:config:set defaultdevhubusername=$DEV_HUB_ALIAS

  echo "Deleting old scratch org"
  sfdx force:org:delete -p -u $SCRATCH_ORG_ALIAS
fi

echo "Creating scratch org"
execute sfdx force:org:create -a $SCRATCH_ORG_ALIAS -s -f ./config/project-scratch-def.json -d 7

echo "Pushing changes to scratch org"
execute sfdx force:source:push

echo "Assigning permission"
execute sfdx force:user:permset:assign -n Admin

echo "Make sure Org user is english"
sfdx force:data:record:update -s User -w "Name='User User'" -v "Languagelocalekey=en_US"

echo "Run setup code"
sfdx force:apex:execute -f scripts/setup.apex -u $SCRATCH_ORG_ALIAS

echo "Running Apex Tests"
execute sfdx force:apex:test:run -l RunLocalTests --synchronous

echo "Running CLI Scanner"
execute sfdx scanner:run --target "force-app" --pmdconfig "ruleset.xml"