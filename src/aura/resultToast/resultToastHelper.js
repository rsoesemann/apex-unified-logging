({
    toast: function(cmp, variant, title, message) {
        const toHugeIndicator = "Caused by: common.apex.runtime.impl.ExecutionException:";
        if(message && message.includes(toHugeIndicator)) {
            message = message.split(toHugeIndicator)[1];
        }

        cmp.find("toast").showToast({
            "title": title,
            "message": message,
            "variant": variant
        });
    },
});