({
    toastError: function(cmp, evt, helper) {
        const params = evt.getParam("arguments");
        const error = params.error;
        helper.toast(cmp, "error", error.name, error.message);
    },


    toastWarning: function(cmp, evt, helper) {
        const params = evt.getParam("arguments");
        const warning = params.warning;
        helper.toast(cmp, "warning", warning.name, warning.message);
    },


    toast: function(cmp, evt, helper) {
        const params = evt.getParam("arguments");
        helper.toast(cmp, "success",  params.title, params.message);
    },
});