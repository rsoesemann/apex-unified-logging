({
    initGrid: function(cmp) {
        cmp.set("v.columns", [
            {
                type: "number",
                fieldName: "context",
                label: "Context",
                initialWidth: 100
            },
            {
                type: "text",
                fieldName: "time",
                label: "Time",
                initialWidth: 100
            },
            {
                type: "text",
                fieldName: "txt_Class__c",
                label: "Class",
                initialWidth: 200
            },
            {
                type: "text",
                fieldName: "txt_Method__c",
                label: "Method"
            },
            {
                type: "text",
                fieldName: "txl_Message__c",
                label: "Message",
                initialWidth: 200
            },
        ]);
    },


    subscribe: function(cmp, evt, hlp) {
        const errorHandler = function (message) {
            cmp.find("toast").toastError(JSON.stringify(message));
        };

        const callback = function (message) {
            hlp.receive(cmp, message);
        };

        const empApi = cmp.find("empApi");
        empApi.onError($A.getCallback(errorHandler));
        empApi.subscribe("/event/Log__e", -1, $A.getCallback(callback)).then($A.getCallback(function (subscription) {
            cmp.set("v.subscription", subscription);
        }));
    },


    unsubscribe: function(cmp, evt, hlp) {
        const callback = function (message) { /* Note: do nothing */ };

        const empApi = cmp.find("empApi");
        empApi.unsubscribe(cmp.get("v.subscription"), $A.getCallback(callback));

        cmp.set("v.subscription", null);
    },


    receive: function(cmp, evt) {
        const log = evt.data.payload;

        if(this.isCurrentUser(log)) {
            log.time = $A.localizationService.formatDateTime(log.CreatedDate, "HH:mm:ss");

            this.store(cmp, log);
            this.renderTree(cmp);
        }
    },


    store: function(cmp, log) {
        const context = log.txt_Context__c;

        let logs = cmp.get("v.logs") || {};
        logs[context] = logs[context] || [];
        logs[context].push(log);

        cmp.set("v.logs", logs);
    },


    renderTree: function(cmp) {
      let treeData = [];
      let logs = cmp.get("v.logs");
      let index = 1;

      for(const context in logs) {
              let log = logs[context][0];
            log.context = index;

            if(logs[context].length > 1) {
                log._children = logs[context].slice(1);
            }

              treeData.push(log);
            index++;
          }

      cmp.set("v.treeData", treeData);
      cmp.find("tree").expandAll();
    },


    isCurrentUser: function(log) {
        return (log.txt_User__c === $A.get("$SObjectType.CurrentUser.Id"));
    },
});