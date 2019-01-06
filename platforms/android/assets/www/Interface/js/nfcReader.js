
var NfcPlugin = {
    initialize: function () {
        this.bind();
    },
    bind: function () {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function () {
        function failure(reason) {
            navigator.notification.alert(reason, function () { }, "There was a problem");
        }

        nfc.addNdefListener(
            NfcPlugin.onNdef,
            function () {
                console.log("Listening for NDEF tags.");
            },
            failure
        );

        if (cordova.platformId == "android") {

            // Android reads non-NDEF tag. BlackBerry and Windows don't.
            nfc.addTagDiscoveredListener(
                NfcPlugin.onNfc,
                function () {
                    console.log("Listening for non-NDEF tags.");
                },
                failure
            );

            // Android launches the app when tags with mime type text/pg are scanned
            // because of an intent in AndroidManifest.xml.
            // phonegap-nfc fires an ndef-mime event (as opposed to an ndef event)
            // the code reuses the same onNfc handler
            nfc.addMimeTypeListener(
                'text/pg',
                NfcPlugin.onNdef,
                function () {
                    console.log("Listening for NDEF mime tags with type text/pg.");
                },
                failure
            );
        }
    },
    onTagDetect: function (nfcEvent) {
    	var tag = nfcEvent.tag;
    	if(tag) {
    		if(appModel.currentRoute == "/login") {
                console.log(nfcEvent.tag);
        		nfcTag = nfcEvent.tag.payload;
        		var str="";
            	for(var i = 0; i < nfcTag.length ; i++) {
            		var str22=((nfcTag[i] < 16) ? "0":"") + nfcTag[i].toString(16);
            		var res=str22.substring(1, 2);
            		str += res;
            	}
        		
            	firstChar = str.slice(0,1);
            	if(firstChar == 4) {
            		// Employee ID
            		newstr = str.slice(5);
            		newstr = newstr.slice(0,5);
            		
            		appModel.getUsernameById(newstr, 'pernr');
            	} else if(firstChar == 2) {
            		newstr = str.slice(1);
            		newstr = newstr.slice(0,2);
            		
            		appModel.getUsernameById(newstr, 'perid');
            	}
        	}
			
			if(appModel.currentRoute == "/mainPage") {
        		nfcTag = nfcEvent.tag.payload;
        		var str="";
            	for(var i = 0; i < nfcTag.length ; i++) {
            		var str22=((nfcTag[i] < 16) ? "0":"") + nfcTag[i].toString(16);
            		var res=str22.substring(1, 2);
            		str += res;
            	}
        		
            	firstChar = str.slice(0,1);
            	if(firstChar == 4) {
            		// Employee ID
            		newstr = str.slice(5);
            		newstr = newstr.slice(0,5);
            		
            		angular.element($("#mainWraper")).scope().$apply(function (scope) {
    					scope.go('/userPage/pernr/'+newstr);
    				});
            		
            		//appModel.getUsernameById(newstr, 'pernr');
            	} else if(firstChar == 2) {
            		newstr = str.slice(1);
            		newstr = newstr.slice(0,2);
            		
            		angular.element($("#mainWraper")).scope().$apply(function (scope) {
    					scope.go('/userPage/perid/'+newstr);
    				});
            		
            		//appModel.getUsernameById(newstr, 'perid');
            	}
        	}
    	} else {
    		alert("תג לא תקין.");
    	}
    },
    onNfc: function (nfcEvent) {
        NfcPlugin.onTagDetect(nfcEvent);
    },
    onWriteSuccess: function () {
        //sekerModel.nfcSuccessWrite();
        flowMessasge("onWriteSuccess");
    },
    onWriteError: function () {
        flowMessasge("onWriteError");
    },
    onLockSuccess: function () {
        flowMessasge("onLockSuccess");
    },
    onLockError: function () {
        flowMessasge("onLockError");
    },
    onNdef: function (nfcEvent) {
        NfcPlugin.onTagDetect(nfcEvent);
    }
};
