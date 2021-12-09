public without sharing class Log {

	private static final Boolean IS_ENABLED = isEnabled();
	private static final String ORG_NAMESPACE = [SELECT NamespacePrefix FROM Organization].NamespacePrefix;
	private static final String CLASSNAME = Log.class.getName();
	private static final Pattern STACK_LINE = Pattern.compile('^(?:Class\\.)?([^.]+)\\.?([^\\.\\:]+)?[\\.\\:]?([^\\.\\:]*): line (\\d+), column (\\d+)$');

	private static Log__e log = null;


	// PUBLIC

	public static void debug() {
		debug('', new List<Object>());
	}
	
	
	public static void debug(String message) {
		debug(message, new List<Object>());
	}


	public static void debug(List<Object> values) {
		debug('', values);
	}


	public static void debug(String message, List<Object> values) {
		emit(message, values, LoggingLevel.DEBUG);
	}


	public static void error() {
		error('', new List<Object>());
	}


	public static void error(List<Object> values) {
		error('', values);
	}


	public static void error(String message) {
		error(message, new List<Object>());
	}


	public static void error(String message, List<Object> values) {
		emit(message, values, LoggingLevel.ERROR);
	}


	// PRIVATE

	@SuppressWarnings('PMD.AvoidDebugStatements')
	private static void emit(String message, List<Object> values, LoggingLevel level) {
		message = String.format(message, cast(values));

		if(IS_ENABLED) {
			Map<String, Object> data = new Map<String, Object>{
				'Message' => message,
				'Quiddity' =>  Request.getCurrent().getQuiddity(),
				/* Limits */
				'Callouts' => Limits.getCallouts(),
				'CpuTime' => Limits.getCpuTime(),
				'DMLRows' => Limits.getDmlRows(),
				'DMLStatements' => Limits.getDmlStatements(),
				'EmailInvocations' => Limits.getEmailInvocations(),
				'FutureCalls' => Limits.getFutureCalls(),
				'HeapSize' => Limits.getHeapSize(),
				'Queries' => Limits.getQueries(),
				'LocatorRows' => Limits.getQueryLocatorRows(),
				'QueryRows' => Limits.getQueryRows(),
				'QueueableJobs' => Limits.getQueueableJobs(),
				'SoslQueries' => Limits.getSoslQueries()
			};

			storeLocation(data);

			log = new Log__e(
				txt_User__c = UserInfo.getUserId(),
				txt_Context__c = Request.getCurrent().getRequestId(),
				txt_Level__c = level.name(),
				txl_Data__c = JSON.serializePretty(data, true)
			);
			EventBus.publish(log);
		}
		else {
			System.debug(level, message);
		}
	}

	private static List<String> cast(List<Object> values) {
		List<String> result = new List<String>();

		for(Object value : values) {
			result.add('' + value);
		}

		return result;
	}


	private static void storeLocation(Map<String, Object> data) {
		// Note: Idea taken from https://salesforce.stackexchange.com/questions/153835
		List<String> stacktrace = new DmlException().getStackTraceString().split('\n');

		for(String line : stacktrace) {
			Matcher matcher = STACK_LINE.matcher(line);

			if(matcher.find() && !line.startsWith('Class.' + CLASSNAME + '.')) {
				data.put('Class', className(matcher));
				data.put('Method', methodName(matcher));
				data.put('Line', Integer.valueOf(matcher.group(4)));

				return;
			}
		}
	}

	private static String className(Matcher matcher) {
		String result = null;

		if((hasNamespace(matcher)) ) {
			result = (matcher.group(1).equals(ORG_NAMESPACE)) ? matcher.group(2) 
															  : matcher.group(1) + '.' + matcher.group(2);
		}
		else {
			result = matcher.group(1);
		}

		return result;
	}

	private static String methodName(Matcher matcher) {
		return (hasNamespace(matcher)) 
						? prettyMethod(matcher.group(3)) 
						: prettyMethod(matcher.group(2));
	}


	private static Boolean hasNamespace(Matcher matcher) {
		return (String.isNotBlank(matcher.group(3)));
	}


	private static String prettyMethod(String method) {
		String result = (method == null) ? 'anonymous' : method;
		return (result.contains('init')) ? 'ctor' : result;
	}


	private static Boolean isEnabled() {
		Settings__c settings = Settings__c.getValues(UserInfo.getUserId());
		return (settings == null) ? false : (System.today() == settings.dat_LogViaEvents__c);
	}


	// Note: Required to allow testing
	@TestVisible
	private static Log__e currentEvent() {
		return log;
	}
}