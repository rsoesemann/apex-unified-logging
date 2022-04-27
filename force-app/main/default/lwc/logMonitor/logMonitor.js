import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import userId from '@salesforce/user/Id';

export default class LogMonitor extends LightningElement {
    subscription;
    isMuted = false;
    logs = {};
    lastTimestamp = {};

    logsAsTree = [];
    columns = [
        {
            type: 'number',
            fieldName: 'index',
            label: '#'
        },
        {
            type: 'text',
            fieldName: 'txl_Data__c.Quiddity',
            label: 'Quiddity',
            initialWidth: 100
        },
        {
            type: 'text',
            fieldName: 'elapsed',
            label: 'Elapsed'
        },
        {
            type: 'text',
            fieldName: 'txl_Data__c.Class',
            label: 'Class'
        },
        {
            type: 'text',
            fieldName: 'txl_Data__c.Method',
            label: 'Method'
        },
        {
            type: 'text',
            fieldName: 'txl_Data__c.Line',
            label: 'Line'
        },
        {
            type: 'number',
            fieldName: 'txl_Data__c.DMLRows',
            label: 'DMLRows'
        }
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
        this.subscription = await subscribe('/event/Log__e', -1, (message) =>
            this.receive(message)
        );

        onError((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    variant: 'error',
                    title: 'Received error from server:',
                    message: JSON.stringify(error)
                })
            );
        });
    }

    unsubscribe() {
        unsubscribe(this.subscription, (response) => {});
    }

    receive(message) {
        let templog = message.data.payload;
        templog.txl_Data__c = JSON.parse(templog.txl_Data__c);
        templog = this.flatten(templog);
        const log = templog;

        if (log.txt_User__c === userId) {
            const context = log.txt_Context__c;

            var currentTimestamp = new Date(log.CreatedDate).getTime();
            var lastTimestamp = this.lastTimestamp[context] || currentTimestamp;
            log.elapsed = currentTimestamp - lastTimestamp;
            this.lastTimestamp[context] = lastTimestamp;

            this.logs[context] = this.logs[context] || [];
            this.logs[context].push(log);

            this.renderTree();
        }
    }

    renderTree() {
        let index = 1;
        this.logsAsTree = [];

        for (const context in this.logs) {
            let log = this.logs[context][0];
            log.index = index;

            if (this.logs[context].length > 1) {
                log._children = this.logs[context].slice(1);
            }

            this.logsAsTree.push(log);
            index++;
        }

        this.template.querySelector('lightning-tree-grid').expandAll();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.unsubscribe();
        } else {
            this.subscribe();
        }
    }

    get muteIcon() {
        return this.isMuted ? 'utility:volume_off' : 'utility:volume_high';
    }

    get muteLabel() {
        return this.isMuted ? 'Unmute' : 'Mute';
    }

    flatten(obj, prefix, current) {
        prefix = prefix || [];
        current = current || {};

        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach((key) => {
                this.flatten(obj[key], prefix.concat(key), current);
            });
        } else {
            current[prefix.join('.')] = obj;
        }

        return current;
    }
}
