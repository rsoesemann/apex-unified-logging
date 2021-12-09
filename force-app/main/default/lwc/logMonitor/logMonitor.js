import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { subscribe, unsubscribe, onError } from "lightning/empApi";
import userId from "@salesforce/user/Id";
import locale from "@salesforce/i18n/locale";

export default class LogMonitor extends LightningElement {

    subscription;
    isMuted = false;
    logs = {};

    logsAsTree = [];
    columns = [
        {
            type: "number",
            fieldName: "index",
            label: "#",
            initialWidth: 10
        },
        {
            type: "text",
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
            fieldName: "Class",
            label: "Class",
            initialWidth: 200
        },
        {
            type: "text",
            fieldName: "Method",
            label: "Method"
        },
        {
            type: "text",
            fieldName: "txl_Data__c",
            label: "Data",
            initialWidth: 200
        },
        {
            type: "number",
            fieldName: "DMLRows",
            label: "DMLRows",
            initialWidth: 10
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


    async subscribe() {
        this.subscription = await subscribe("/event/Log__e", -1, (message) => this.receive(message));

        onError(error => {
            this.dispatchEvent( new ShowToastEvent({
                variant: "error",
                title: "Received error from server:",
                message: JSON.stringify(error),
            }) );
        });
    }


    unsubscribe() {
        unsubscribe(this.subscription, response => {});
    }


    receive(message) {
        const log = message.data.payload;

        if(log.txt_User__c === userId) {
            const timeFormat = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            log.time = new Intl.DateTimeFormat(locale, timeFormat).format(new Date(log.CreatedDate));
      
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
            log.index = index;
            log.context = context.split("/")[1]; 

            if(this.logs[context].length > 1) {
                log._children = this.logs[context].slice(1);
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