@IsTest
private class Log_Test {

	@IsTest
	private static void debug() {

		// Setup
		enableLogEvents(System.today());

		String message = '{0}=={1}:{2}';
		List<Object> values = new List<Object>{ 1, '2', false };
		insert new Account(Name = 'Acme');


		// Execute
		Log.debug(message, values);


		// Verify
		Log__e log = Log.currentEvent();
		System.assertEquals(UserInfo.getUserId(), log.txt_User__c);
		System.assertEquals(LoggingLevel.DEBUG.name(), log.txt_Level__c);
		System.assertEquals(Request.getCurrent().getRequestId() + '/' + Request.getCurrent().getQuiddity(), log.txt_Context__c);

		System.assertEquals('1==2:false', log.txl_Message__c);
		System.assertEquals(thisClassName(), log.txt_Class__c);
		System.assertEquals('debug', log.txt_Method__c);
		System.assertEquals(16, log.num_Line__c);

		Map<String, Object> data = data(log);
		System.assertEquals('1==2:false', (String) data.get('Message'));
		System.assertEquals(thisClassName(), (String) data.get('Class'));
		System.assertEquals('debug', (String) data.get('Method'));
		System.assertEquals(16, (Integer) data.get('Line'));
		System.assertEquals(2, (Integer) data.get('DMLRows')); // 1x Settings__c + 1x Log__e
	}


	@IsTest
	private static void error() {

		// Setup
		enableLogEvents(System.today());


		// Execute
		Log.error('');


		// Verify
		System.assertEquals(LoggingLevel.ERROR.name(), Log.currentEvent().txt_Level__c);
	}


	@IsTest
	private static void timestampWhenNoContextId() {

		// Setup
		enableLogEvents(System.today());


		// Execute
		Log.debug('');


		// Verify
		System.assertNotEquals(null, Log.currentEvent().txt_Context__c);
	}


	@IsTest
	private static void noEventsSendWhenDisabled() {

		// Execute
		Log.debug('');


		// Verify
		System.assertEquals(null, Log.currentEvent());

	}


	@IsTest
	private static void noEventsWhenExpired() {

		// Setup
		enableLogEvents(yesterDay());


		// Execute
		Log.debug('');


		// Verify
		System.assertEquals(null, Log.currentEvent());

	}


	// HELPER

	private static void enableLogEvents(Date day) {
		insert new Settings__c(SetupOwnerId = UserInfo.getUserId(), dat_LogViaEvents__c = day);
	}


	private static Date yesterDay() {
		return System.today().addDays(-1);
	}


	private static String thisClassName() {
		String ns = [SELECT NamespacePrefix FROM Organization].NamespacePrefix + '.';
		return Log_Test.class.getName().removeStart(ns);
	}


	private static Map<String, Object> data(Log__e log) {
		return (Map<String, Object>) JSON.deserializeUntyped(log.txl_Data__c);
	}
}