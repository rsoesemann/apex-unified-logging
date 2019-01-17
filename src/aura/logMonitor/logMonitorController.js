({
    init: function(cmp, evt, hlp) {
        hlp.initGrid(cmp);
        hlp.subscribe(cmp, evt, hlp);
    },


    clear: function(cmp, evt, hlp) {
        cmp.set("v.logs", {});
        cmp.set("v.treeData", []);
    },
  
  
    toggleMute: function(cmp, evt, hlp) {
        const isMuted = !(cmp.get("v.isMuted"));

        if(isMuted) {
            hlp.unsubscribe(cmp, evt, hlp);
        }
        else {
            hlp.subscribe(cmp, evt, hlp);
        }

        cmp.set("v.isMuted", isMuted);
    },
});