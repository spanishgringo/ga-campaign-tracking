var goalCompletion = {
    throwErr: function(err){
         if(typeof console !="undefined"){
            console.log(err);
        //insert call to JS monitor service if available like errorception or newRelic
         if (typeof _errs =="object") { _errs.push(err); }
        };
    },
    //this main funciton should be called onFormSubmit and you must always pass a conversionType
    // this is what is passed hsMFValues.offer_value + "/" + hsMFValues.conversionType 
    //conversionType usually looks like this:  2/online-demo OR THIS 3/asset/ebook/a-guide-to-better-reporting
    trackGoal: function(conversionType, blind, trackPath, goalValue) {
        goalCompletion.conversionType = conversionType || goalCompletion.conversionType || "unknown-conversion";
        goalCompletion.trackPath = trackPath || goalCompletion.trackPath || document.location.pathname;
        goalCompletion.goalValue = goalValue || goalCompletion.goalValue || 100;
        if ((/^[1-5]\//).test(goalCompletion.conversionType)) { goalCompletion.conversionType = "/form/" + goalCompletion.conversionType; }
        try { goalCompletion.trackGoal_ga(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue); } catch (err) {throwErr(err);}
        try { goalCompletion.trackGoal_capterra(); } catch (err) {throwErr(err);}
        try { goalCompletion.trackGoal_getApp(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue); } catch (err) {throwErr(err);}
        try { goalCompletion.trackGoal_bing(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue); } catch (err) {throwErr(err);}
        try { goalCompletion.trackGoal_linkedIn(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue); } catch (err) {throwErr(err);}
        try { goalCompletion.trackGoal_fb(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue); } catch (err) {throwErr(err);}
        try { goalCompletion.trackGoal_twitter(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue); } catch (err) {throwErr(err);}
        //add any new service calls here using same pattern as above. Then create that function below. always wrap in try catch.  
        
        //catchall test for GTM loaded triggers. In case extra goals have been defined in a GTM tag
        try {
            if (typeof _GtmGoals == 'object') {
                _GtmGoals.formCompletion(goalCompletion.conversionType, goalCompletion.trackPath, goalCompletion.goalValue);
            }
        } catch (err) {throwErr(err);}
    },
    trackGoal_ga: function(conversionType, trackPath, goalValue) {
        if (typeof ga == 'function') {
            ga('send', 'pageview', (trackPath.substr(-1) == "/" ? trackPath.substr(0, trackPath.length - 1) : trackPath) + conversionType);
        }
        if (_gaq) { _gaq.push(['_trackPageview', (trackPath.substr(-1) == "/" ? trackPath.substr(0, trackPath.length - 1) : trackPath) + conversionType]); }
    },

    trackGoal_bing: function(a, b, c) {
        //build out as needed for different goal types similar to other scripts in this library
        window.uetq = window.uetq || [];
        window.uetq.push({ 'ec': 'form-submission', 'ea': 'form-submission' });
    },
    trackGoal_linkedIn: function(conversionType, trackPath, goalValue) {
        
        let liPID = ''; //insert LinkedIn Published ID here

        if (conversionType[conversionType.length - 1] != "/") {
            conversionType = conversionType + "/";
        }
        var conversionId = "";
         //this parses out the form value and conversion type string to identify the type of conversion completed
        var cType = Array.isArray(conversionType.match(/\/?form\/[1-5](\/[a-zA-Z\-_0-9]+\/)/gi)) ? conversionType.match(/\/?form\/[1-5](\/[a-zA-Z\-_0-9]+\/)/)[1] : "";
        switch (cType) {
        /* Example
            //look for this pattern in conversion type
            case "/online-demo/":
                conversionId = "566354";
                break;
        */
            //Online demo:
            case "/online-demo/":
                conversionId = "";
                break;
            //Asset main type:
            case "/asset/":
            //if you have multiple sub-types of assets to track and you need to distinguish as subtypes
                if (Array.isArray(conversionType.match(/\/?form\/[1-5]\/asset\/webcast/gi))) {
                    conversionId = "";
                } else {
                    conversionId = "";
                }
                break;
            //Free trial:
            case "/free-trial/":
                conversionId = "";
                break;
            /*
            //Contact sales 
            case "/contact-sales/":
                 conversionId = "";
                 break;
            */
            /*
            //Personal demo
             case "/personal-demo/":
                 conversionId = "";
                 break;
            */
            /*
            //Live webinar reg
            case "/webinar/":
                conversionId = "";
                break;
            */
            /*
            //Event reg
            case "/in-person-event/":
                conversionId = "";
                break;
            */
        }
        if (conversionId.length > 0) {
            jQuery(".hs-form").after('<img height="1" width="1" style="display:none;" alt="" src="https://dc.ads.linkedin.com/collect/?pid='+ liPID +'&conversionId=' + conversionId + '&fmt=gif" />');
        }

    },
    trackGoal_capterra: function() {
        var capterra_vkey = '',//insert capterra vendor key here (32 chars)
            capterra_vid = '', //insert capterra vendor ID here (~7 chars)
            capterra_prefix = (('https:' == document.location.protocol) ? 'https://ct.capterra.com' : 'http://ct.capterra.com');
        (function() {
            var ct = document.createElement('script');
            ct.type = 'text/javascript';
            ct.async = true;
            ct.src = capterra_prefix + '/capterra_tracker.js?vid=' + capterra_vid + '&vkey=' + capterra_vkey;
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ct, s);
        })();
    },
    trackGoal_getApp: function(a, b, c) {
        var r = document.referrer;
        var h = window.location.href;
        var p = typeof c == 'undefined' ? '150' : c;
        var e = '';
        var listing_id = ''; //insert getApp conversion id here usually a number
        var a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = true;
        a.src = 'https://www.getapp.com/conversion/' + encodeURIComponent(listing_id) + '/r.js?p=' + encodeURIComponent(p) + '&h=' + encodeURIComponent(h) + '&r=' + encodeURIComponent(r) + '&e=' + encodeURIComponent(e);
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(a, s);
    },
    trackGoal_twitter: function(a, b, c) {
        //this assumes twitter general tracking scripts are pre loaded
        let twitterAdID = ''; //insert twitter ad id here 
        if (typeof twttr != "undefined") { twttr.conversion.trackPid(twitterAdID, { tw_sale_amount: c, tw_order_quantity: 0 }); }
    },
    
    trackGoal_fb: function(a, b, c) {
    //this assumes FB general tracking scripts are pre loaded
        try {
            if (a[a.length - 1] != "/") {
                a = a + "/";
            }
            //this parses out the form value and conversion type string to identify the type of conversion completed
            var cType = Array.isArray(a.match(/\/?form\/[1-5](\/[a-zA-Z\-_0-9]+\/)/gi)) ? a.match(/\/?form\/[1-5](\/[a-zA-Z\-_0-9]+\/)/)[1] : "";
            switch (cType) {
                /* Example
                //look for this pattern in conversion type
                case "/online-demo/": 
                    // fbq('trackCustom', '[facebook conversion name]', { contentname: '[facebook conversion name]' });
                    fbq('trackCustom', 'OnlineDemoSignUp', { contentname: 'OnlineDemoSignUp' });
                    break;
                */
                //Online Demos: 
                case "/online-demo/":
                    fbq('trackCustom', 'OnlineDemoSignUp', { contentname: 'OnlineDemoSignUp' });
                    break;
                //Asset main type
                case "/asset/":
                    //if you have multiple sub-types of assets to track and you need to distinguish as subtypes
                    if (Array.isArray(a.match(/\/?form\/[1-5]\/asset\/webcast/gi))) {
                        fbq('trackCustom', 'webcastReg', { contentname: 'webcastReg' });
                    } else {
                        //eBook
                        fbq('trackCustom', 'eBookDownloads', { contentname: 'eBookDownloads' });
                    }
                    break;
                //Free Trial:
                case "/free-trial/":
                    fbq('trackCustom', 'FreeTrialSignup', { contentname: 'FreeTrialSignUp' });
                    break;
                //Live Webinar reg:
                case "/webinar/":
                    fbq('trackCustom', 'WebinarRegister', { contentname: 'WebinarRegister' });
                    break;
                //In-Person Event reg:
                case "/in-person-event/":
                    fbq('trackCustom', '', { contentname: '' });
                    break;
                /* case "/contact-sales/":
                    fbq('trackCustom', '', { contentname: '' });
                    break;
                /* case "/personal-demo/":
                    fbq('trackCustom', '', { contentname: '' });
                    break;
                */
            }
        } catch (err) {throwErr(err);

        }
        //always call generic lead goal in FB as well
        fbq('track', 'Lead', { value: c, currency: 'USD' });
    }
};