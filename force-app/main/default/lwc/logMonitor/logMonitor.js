import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { subscribe, unsubscribe, onError } from "lightning/empApi";
import userId from "@salesforce/user/Id";
import longTimeFormat from "@salesforce/i18n/dateTime.longTimeFormat";

export default class LogMonitor extends LightningElement {

    subscription;
    isMuted = false;
    logs = {};

    @track logsAsTree = [];
    @track columns = [
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
    ];


    connectedCallback() {
        this.subscribe();
    }


    disconnectedCallback() {
        this.unsubscribe();
    }


    clearAll() {
        this.logs = {};
        this.logsAsTree = [];
    }


    subscribe() {
        const callback = function(message) {
            this.receive(message);
        };

        subscribe("/event/Log__e", -1, callback).then(response => {
            this.subscription = response;
        });

        onError(error => {
            this.dispatchEvent( new ShowToastEvent({
                variant: "error",
                title: "Received error from server:",
                message: JSON.stringify(error),
            }) );
        });
    }


    unsubscribe() {
        unsubscribe(this.subscription, response => {
            this.subscription = null;
        });
    }


    receive(message) {
        const log = message.data.payload;

        if(log.txt_User__c === userId) {
            log.time = new Intl.DateTimeFormat(longTimeFormat).format(log.CreatedDate);
            
            const context = log.txt_Context__c;
            this.logs[context] = this.logs[context] || [];
            this.logs[context].push(log);

            this.renderTree();
        }
    }


    renderTree() {
      let index = 1;
      this.logsAsTree = [];

      for(const context in this.logs) {
            let log = this.logs[context][0];
            log.context = index;

            if(this.logs[context].length > 1) {
                log._children = logs[context].slice(1);
            }

            this.logsAsTree.push(log);
            index++;
          }

        this.template
                .querySelector("lightning-tree-grid")
                .expandAll();
    }
  

    toggleMute() {
        this.isMuted = !this.isMuted;

        if(this.isMuted) {
            this.unsubscribe();
        }
        else {
            this.subscribe();
        }
    }


    get muteIcon() {
        return (this.isMuted) ? "utility:volume_off" : "utility:volume_high";
    }

    
    get muteLabel() {
        return (this.isMuted) ? "Unmute" : "Mute";
    }
}