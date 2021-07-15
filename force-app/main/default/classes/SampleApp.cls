public with sharing class SampleApp implements Database.Batchable<Integer> {
   
    public void run() {
        Log.debug('before');
        futureMethod();
        Log.debug('after');
    }  


    @future
    public static void futureMethod() {   
        Log.debug('before');
        System.enqueueJob(new AQueueable());
        Log.debug('after');
    } 
    

    public List<Integer> start(Database.BatchableContext ctx) { 
        Log.debug();

        return new List<Integer>{ 1, 2, 3, 4 }; 
    }     


    public void execute(Database.BatchableContext ctx, List<Integer> scope){
        Log.debug('first');
        Log.error('second');
    }  

    
    public void finish(Database.BatchableContext ctx) {     
        Log.debug('first');
        Log.error('second');
    }  


    // INNER

    public with sharing class AQueueable implements Queueable {
    
        public void execute(QueueableContext ctx) {
            Log.debug('before');
            Database.executeBatch(new SampleApp(), 1);
            Log.debug('after');
        }
    }
}