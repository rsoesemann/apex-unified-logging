# Apex Unified Logging [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3814b20244d14e3d846ff05dfd3c2e2a)](https://www.codacy.com/app/rsoesemann/apex-unified-logging?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=rsoesemann/apex-unified-logging&amp;utm_campaign=Badge_Grade)

<a href="https://githubsfdeploy.herokuapp.com?owner=rsoesemann&repo=apex-unified-logging">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png">
</a>

Logging framework based on Salesfore Platform Events to overcome the limitations of `System.debug` logging.

## Features: ##
 - Provides unified view of logs over transaction boundaries (a.k.a. execution contexts)
 - Groups Logs of the same Batch
 - UI only shows the logs produced by current user
 - Autodetection of Code Location 
 - Nice UI using a Lightning Utility Bar 
 - Activated using user-level custom settings
 
## Screenshots: ##

<img width="500" alt="lightning_experience___salesforce_und_skype_und_cprm____dev_projects_cprm__-_attributeprovider" src="https://user-images.githubusercontent.com/8180281/51395918-44efcf80-1b3e-11e9-978a-5e5ca4d29247.png">

<img width="500" alt="developer_console" src="https://user-images.githubusercontent.com/8180281/51323046-69c54380-1a67-11e9-9999-29d4697d4b82.png">

<img width="500" alt="custom_settings___salesforce" src="https://user-images.githubusercontent.com/8180281/51323040-6762e980-1a67-11e9-886a-159905a035db.png">

## Kudos to: ##

I was standing on the shoulders of those giants when building this

- [Advanced Logging with Platform Events](https://www.youtube.com/watch?v=yYeurYnasVc) by https://github.com/afawcett
- [Ein Versuch über einen Protokoll-Service](https://shoreforce.herokuapp.com/ein-versuch-uber-einen-protokoll-service/) by https://github.com/szandor72
- [Build an Instant Notification App](https://trailhead.salesforce.com/en/content/learn/projects/workshop-platform-events) 
