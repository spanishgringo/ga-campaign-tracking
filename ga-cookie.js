/* ========================================================================
 * gaCookie by Michael Freeman (@spanishgringo) & Ben Word (@retlehs)
 * https://github.com/spanishgringo/ga-campaign-tracking
 * ========================================================================
*/

var gaCookie = gaCookie || {};

// This helps distinguish items in your CRM that come from the web instead of other sources.
// For example, your CRM may already have existin lead sources called "organic" or "referral"
// so this prefix will help you distinguish between "referral" (such as a client referral) and
// "WEB-referral" (someone who came to your site via a NYT.com article) in your CRM.
gaCookie.prefix = gaCookie.prefix || 'WEB-';

// Since cookies from GA are by default set at the subdomain level, but can be modfied to
// work at the full domain or even no-domain level.
// Allows for overwride and defaults if not to current hostname
gaCookie.domainName = this.domainName || document.location.hostname;

gaCookie.getDomainHash = function(strDomainName) {
  fromGaJs_h = function(e) {
    return undefined === e || "-" === e || "" === e;
  };
  fromGaJs_s = function(e) {
    var k = 1, a = 0, j, i;
    if (!fromGaJs_h(e)) {
      k = 0;
      for (j = e.length - 1; j >= 0; j--) {
        i = e.charCodeAt(j);
        k = (k << 6 & 268435455) + i + (i << 14);
        a = k & 266338304;
        k = a !== 0 ? k ^ a >> 21 : k;
      }
    }
    return k;
  };
  return fromGaJs_s(strDomainName);
};


function getQueryVar (v)
{
  var q = window.location.search.substring(1);
  var vars = q.split("&");
       for (var i=0;i<vars.length;i++) {
               var set = vars[i].split("=");
               if(set[0] == v){return set[1];}
       }
       return(false);
}

// This is called automatically by getVisitData. Only call this if you want to load each field manually.
// This should not be run until you have already loaded GA and run the normal _trackPageview call to
// ensure that it is using the most recent source/session data

// `intGoogDomainHash` if already defined, used, but normally this will be empty
// `strCookies` use this to set the path of the cookie. 99.9% of the time you should leave this empty
// `strDefaultDomainName` this has a fallback and you should set from the value you set as gaCookie.domainName. Default value is to use the host subdomain
// `strPrefix` this is automatic and will use whatever you setup as the default prefix to appear prepended to the medium value such as WEB-cpc, WEB-referral
gaCookie.readGACookies = function(intGoogDomainHash, strCookies, strDefaultDomainName, strPrefix) {
  gaCookie.params = {};
  gaCookie.cookiesStr = strCookies;

try {
  // Check if Landing Page is already set and call it if not
  if (typeof gaCookie.landingPage == 'undefined') {
    gaCookie.checkLP();
  }
} catch(e) {

}

try{
if (typeof gaCookie.adGroup == 'undefined') {
    gaCookie.checkAdGroup();
  }
} catch(e) {

}
  // Cycle through each parameter and use default or use override if already set in gaCookie
  if (typeof intGoogDomainHash == 'undefined') {
    intGoogDomainHash = gaCookie.getDomainHash(gaCookie.getCookie('DomainName', document.location.hostname));
  }
  if (strPrefix) {
    gaCookie.prefix = strPrefix;
  }
  if (strDefaultDomainName) {
    gaCookie.strDefaultDomainName = strDefaultDomainName;
  }
  if (typeof gaCookie.cookiesStr == 'undefined') {
    gaCookie.cookiesStr = document.cookie;
  }
  if (gaCookie.cookiesStr.length === 0) {
    return;
  }
  
  // Extract only those cookies for this domain
  // RegEx Pattern to find the __utm cookies only for the right domain hash used by GA
  var rePattern = new RegExp('(__utm[a-z]{1,2}=[0-9]+[^;]*)', "g");
  // Create an array of the _utm cookies to rebuild the cookie string for later value extraction
  var matchedCookies = gaCookie.cookiesStr.match(rePattern, "$1");
  if (matchedCookies) {
    gaCookie.cookiesStr = matchedCookies.join(';');
  } else {
    gaCookie.cookiesStr = '';
    if(!gaCookie.failedCounter){
      gaCookie.failedCounter = true;
      gaCookie.rerun = setTimeout(function(){gaCookie.getVisitData(gaCookie.domainName ? gaCookie.domainName : null);},1200);
    return false;
    }
    return;
  }
  // Split up campaign cookie (_utmz) into individual name=value pairs
  gaCookie.cookiesStr = gaCookie.cookiesStr.replace(/(\.|\|)utm/g, ';utm');
  // Every name/value pair is separated by a ";"
  var args = gaCookie.cookiesStr.split(';');
  // Create the individual name=value pairs
  var i,l;
  l = args.length;
  for (i = 0; i < l; i++) {
    var pair = args[i].match(/([^=]*)=(.*)/);
    // Don't use: pair = args[i].split('=') since value could contain a 2nd =
    var name = decodeURIComponent(pair[1]);
    name = name.replace(/^\s+|\s+$/g, '');
    var value = (pair.length >= 2) ? decodeURIComponent(pair[2]) : '';
    // In case page has access to > 1 domain that has __utm* cookies, we need to ensure we look only at the
    // cookies for the tracked (sub-)domain set by the Google domain hash.
    gaCookie.params[name] = value;
    var subValues = value.split('.');

    // See http://www.seotakeaways.com/google-analytics-cookies-ultimate-guide/ for a thorough GA cookie reference guide
    switch (name) {
      case '__utma':
        // domainhash.anonymizedVisitorID.ftime.ltime.stime.sessioncount
        gaCookie.params.domainhash = subValues[0];
        gaCookie.params.visitorId = subValues[1];
        gaCookie.params.ftime = subValues[2];
        gaCookie.params.ltime = subValues[3];
        gaCookie.params.stime = subValues[4];
        gaCookie.params.sessioncount = subValues[5];
        break;
      case '__utmb':
        // eg .45.10.1218592192
        gaCookie.params.gif_hits = subValues[1];
        break;
        // Custom variables which we will later parse out
      case '__utmv':
        gaCookie.params.custom = subValues[1];
        break;
      case '__utmz':
        // Number of session visits from this visitor and number of different campaigns associated with this visitor
        gaCookie.params.numSessions = subValues[2];
        gaCookie.params.numCampaigns = subValues[3];
        break;
      case 'utmcsr':
        // Campaign/source information
        if (subValues.length > 1) {
          gaCookie.params.trafficsource = '';
          for ( subValIdx = 0; subValIdx < subValues.length; subValIdx++) {
            if (subValIdx > 0) {
              gaCookie.params.trafficsource += '.';
            }
            gaCookie.params.trafficsource += subValues[subValIdx];
          }
        } else {
          gaCookie.params.trafficsource = subValues[0];
        }
    break;
      case 'utmccn':
        gaCookie.params.campaignname = subValues[0];
        break;
      case 'utmcmd':
        gaCookie.params.campaignmedium = subValues[0];
        break;
      case 'utmctr':
        gaCookie.params.campaignterm = subValues[0];
        break;
      case 'utmcct':
        gaCookie.params.campaigncontent = subValues[0];
        break;
      case 'utmcid':
        gaCookie.params.campaignid = subValues[0];
        break;
    }
  }
};

// This function takes the GA cookie values and inserts them into your form's hidden input fields
// It makes assumptions that you have hidden input fields already created in your forms and that the system that receives the submitted data can accept these values
// Make sure your Marketing Software or CRM can receive these values in the subimtted form data. However, make sure that these are all optional fields for form submission because these fields will not always be populated.
// For example, if a user blocks javascript or cookies, then your form's hidden fields will be empty.
// I recommend you name your fields as listed below. Otherwise, update the code to match the name of your hidden form fields

// galandingpage
// gasource
// gamedium
// gacampaign
// gakeyword
// gacontent

// You will notice that depending on the medium's value, not all fields are submitted
gaCookie.getVisitData = function(domainNameOverride) {
  if(domainNameOverride){
    gaCookie.domainName = domainNameOverride;
  };
  gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  // Add values to form
  // Store the landing page from the session
  jQuery('input[name="galandingpage"]').val(gaCookie.landingPage);

  // Store the ad group from the session, if any
  if( typeof gaCookie.adGroup != 'undefined'){
      jQuery('input[name="gaadgroup"]').val(gaCookie.adGroup);
  }
  // Store the GA cookie Data
  switch (gaCookie.params.campaignmedium) {
    case 'organic':
      jQuery('input[name="gasource"]').val(gaCookie.params.trafficsource);
      jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + 'organic');
      jQuery('input[name="gacampaign"]').val('(organic)');
      jQuery('input[name="gakeyword"]').val(gaCookie.params.campaignterm);
      break;
    case '(none)':
      // Direct visits
      jQuery('input[name="gasource"]').val('(direct)');
      jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + '(none)');
      jQuery('input[name="gacampaign"]').val('(direct)');
      break;
    case 'referral':
      jQuery('input[name="gasource"]').val(gaCookie.params.trafficsource);
      jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + 'referral');
      jQuery('input[name="gacampaign"]').val('(referral)');
      jQuery('input[name="gacontent"]').val(gaCookie.params.campaigncontent);
      break;
      case 'cpc':
        jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + 'cpc');
        jQuery('input[name="gasource"]').val(gaCookie.params.trafficsource);
        jQuery('input[name="gacampaign"]').val(gaCookie.params.campaignname);
        if(gaCookie.params.campaignterm){jQuery('input[name="gakeyword"]').val(gaCookie.params.campaignterm);}
        if(gaCookie.params.campaigncontent){jQuery('input[name="gacontent"]').val(gaCookie.params.campaigncontent);}
        if(gaCookie.params.utmgclid){jQuery('input[name="gaadwordsid"]').val(gaCookie.params.utmgclid);}
      break;
    case '(not set)':
      if (gaCookie.params.utmgclid) {
        // GA Adwords since it has gclid
        jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + 'cpc');
        } else{
        jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + '(not set)');
        }
        // These may need to be fixed because it depends on gclid on the backend
        if(gaCookie.params.trafficsource){jQuery('input[name="gasource"]').val(gaCookie.params.trafficsource);}
        if(gaCookie.params.campaignname){jQuery('input[name="gacampaign"]').val(gaCookie.params.campaignname);}
        if(gaCookie.params.campaignterm){jQuery('input[name="gakeyword"]').val(gaCookie.params.campaignterm);}
        if(gaCookie.params.campaigncontent){jQuery('input[name="gacontent"]').val(gaCookie.params.campaigncontent);}
        if(gaCookie.params.utmgclid){jQuery('input[name="gaadwordsid"]').val(gaCookie.params.utmgclid);}
      
      break;
      case undefined:
        // Referrer is same as host so referrer can't be source or there is no referrer
        if (document.referrer === "" || document.referrer.match(/\/\/(.+)\//)[1]==document.location.hostname) {
          jQuery('input[name="gasource"]').val("(not set)");
          jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + '(none)');
        } else {
          var ref = document.referrer.match(/\/\/(.+)\//)[1];
          jQuery('input[name="gasource"]').val(ref.indexOf("www.")==0 ? ref.substr(4) : ref);
          jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + 'referral');
        }
        
        jQuery('input[name="gacampaign"],input[name="gacampaign"]').val('(not set)');
      break;
    default:
      // Assume it is a custom campaign and try to include everything
      if (gaCookie.params.utmgclid) {
        // GA Adwords since it has gclid
            jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + 'cpc');
            if(gaCookie.params.utmgclid){jQuery('input[name="gaadwordsid"]').val(gaCookie.params.utmgclid);}
        } else {
            if(gaCookie.params.campaignmedium){
                jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + gaCookie.params.campaignmedium);
        } else{
            jQuery('input[name="gamedium"],input[name="leadsource"]').val(gaCookie.prefix + '(none)');
        }
        }
        // These may need to be fixed because it depends on gclid on the backend
        if(gaCookie.params.trafficsource){jQuery('input[name="gasource"]').val(gaCookie.params.trafficsource);}
        if(gaCookie.params.campaignname){jQuery('input[name="gacampaign"]').val(gaCookie.params.campaignname);}
        if(gaCookie.params.campaignterm){jQuery('input[name="gakeyword"]').val(gaCookie.params.campaignterm);}
        if(gaCookie.params.campaigncontent){jQuery('input[name="gacontent"]').val(gaCookie.params.campaigncontent);}
    }
};

// Helper functions to place less used session time and count data in your hidden form fields
// Most MAP already track this info well and in a way fairly consistently with GA so they often are not necessary
gaCookie.getFirstVisitTime = function(firstVisitFieldName) {
  if (typeof gaCookie.params.ftime == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  if (firstVisitFieldName) {
    jQuery('input[name="'+ firstVisitFieldName +'"]').val(gaCookie.params.ftime);
  } else {
    return gaCookie.params.ftime;
  }
};

gaCookie.getLastVisitTime = function(lastVisitFieldName) {
  if (typeof gaCookie.params.ltime == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  if (lastVisitFieldName) {
    jQuery('input[name="'+ lastVisitFieldName +'"]').val(gaCookie.params.ltime);
  } else {
    return gaCookie.params.ltime;
  }
};

gaCookie.getSessionStartTime = function(sessionVisitTimeFieldName) {
  if (typeof gaCookie.params.stime == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  if (sessionVisitTimeFieldName) {
  jQuery('input[name="'+ sessionVisitTimeFieldName +'"]').val(gaCookie.params.stime);
  } else {
    return gaCookie.params.stime;
  }
};

gaCookie.getSessionVisits = function(sessionVisitsFieldName) {
  if (typeof gaCookie.params.numSessions == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  if (sessionVisitsFieldName) {
    jQuery('input[name="'+ sessionVisitsFieldName +'"]').val(gaCookie.params.numSessions);
  } else {
    return gaCookie.params.numSessions;
  }
};

gaCookie.getNumberCampaigns = function(numberCampaignsFieldName) {
  if (typeof gaCookie.params.numCampaigns == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  if (numberCampaignsFieldName) {
    jQuery('input[name="'+ numberCampaignsFieldName +'"]').val(gaCookie.params.numCampaigns);
  } else {
    return gaCookie.params.numCampaigns;
  }
};

gaCookie.getGAVisitorID = function(gaVisitorIDFieldName) {
  if (typeof gaCookie.params.visitorId == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  if (gaVisitorIDFieldName) {
    jQuery('input[name="'+ gaVisitorIDFieldName +'"]').val(gaCookie.params.visitorId);
  } else {
    return gaCookie.params.visitorId;
  }
};

// TODO: parse out Custom Variable values
// Custom variables are not always persisted in the GA cookie. It depends on the custom variable's scope. The custom variable is accessible if it
// is a session-level scoped custom variable.  Page-level scoe custom variables only appear during the page view where the custom variable was set. Visitor level custom variables are set one time and then tracked via the visitorID on the backend
gaCookie.getCustomVar = function(customVarNum, customVarFieldName) {
  if (typeof gaCookie.params.visitorId == 'undefined') {
    gaCookie.readGACookies(gaCookie.domainName ? gaCookie.domainName : null);
  }
  var custVarVal;
  try {
   custVarVal = gaCookie.params.custom;
  } catch(e) {
    custVarVal = '';
  }
  if (customVarFieldName) {
    jQuery('input[name="'+ customVarFieldName +'"]').val(custVarVal);
  } else {
    return custVarVal;
  }
};

// Utility Functions for getting, setting, testing, and deleting cookies
gaCookie.get = function(key, default_) {
  var value = this.params[key];
  return (value !== null) ? value : default_;
};

gaCookie.set = function(strCookieName, value, strDomainName, strPath, hours) {
  this.writeCookie(strCookieName, value, strDomainName, strPath, hours);
};

gaCookie.contains = function(key) {
  var value = this.params[key];
  return (value !== null);
};

gaCookie.formatDateTime = function(strSession) {
  var value = this.params[strSession];
  var d = new Date(value * 1000);

  var strDate = d.toLocaleDateString();
  strDate = strDate.replace(/[a-z]{3}.*[, ]+([a-z]{3})[^, ]*/i, '$1');
  strDate += ' ' + d.toLocaleTimeString();
  return strDate;
};

gaCookie.getCookie = function(strCookieName, strDefault) {
  var strCookieValue;
  try {
    strCookieValue = document.cookie.match(strCookieName + '=' + '(([^;])*)')[1];
  } catch(e) {
    strCookieValue = strDefault;
  }
  return strCookieValue;
};

gaCookie.deleteCookie = function(strCookieName, strDomainName, strPath) {
  this.writeCookie(strCookieName, '', strDomainName, strPath, -1);
};

gaCookie.deleteAllCookies = function(strDomainName) {
  var new_date = new Date();
  var aryCookie;
  new_date.setTime(1);
  new_date = new_date.toGMTString();

  var thecookie = document.cookie.split(';');
  for (var i = 0; i < thecookie.length; i++) {
    aryCookie = thecookie[i].split('=');
    deleteCookie(aryCookie[0], strDomainName, '');
  }
};

gaCookie.writeCookie = function(strCookieName, value, strDomainName, strPath, hours) {
  var d = new Date();
  strDomainName = strDomainName || this.strDefaultDomainName;
  d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
  var strExpiry = (hours === 0) ? 0 : d.toGMTString();
  var strCookie = strCookieName + '=' + value + ';expires=' + strExpiry + ';path=' + strPath + ';domain=' + strDomainName;
  document.cookie = strCookie;
};

// Function for storing and retrieving session landing page in a 1st party cookie. Since the GA cookie does not track the landing page you need to do this outside of the GA cookie
// But this value is accessed via the gaCookie object by calling gaCookie.landingPage
// This function should be called as part of your onReady or onLoad events in the webpage.  For example include this in
// $().ready(function({
// if you use top domain level GA tracking, uncomment the line below. replace yoursite.com with your website's domain
//  gaCookie.domainName = "yoursite.com" ;
// if you want no prefix appended to your medium and lead source fields such as "WEB-" then uncomment the below line and leave as is. If you want to change it, uncomment and add your own prefix
//  gaCookie.prefix = "";
//    gaCookie.checkLP();
// });
gaCookie.checkLP = function() {
  try {
    var cVarPos = document.cookie.search('gaCVarLP');
    if (cVarPos > -1) {
      gaCookie.landingPage = gaCookie.getCookie('gaCVarLP', '');
    } else {
      var lp = document.location.pathname;
      lp = lp.length > 124 ? lp.substr(lp.length - 124,124) : lp;
      gaCookie.set('gaCVarLP', lp, this.domainName, '/', 0.5);
      gaCookie.landingPage =lp;
    }
  } catch(e) { }
};

//function to check if adgroup is included in URL params.

gaCookie.checkAdGroup = function() {
  try {
    var cVarPos = document.cookie.search('gaCVarAdGrp');
    if (cVarPos > -1) {
      gaCookie.landingPage = gaCookie.getCookie('gaCVarAdGrp', '');
    } else {
      var adGrp = getQueryVar('utm_adgroup');
      if(adGrp){
        adGrp = adGrp.length > 124 ? adGrp.substr(adGrp.length - 124,124) : adGrp;
        gaCookie.set('gaCVarAdGrp', adGrp, this.domainName, '/', 0.5);
        gaCookie.adGroup =adGrp;
      }
    }
  } catch(e) { }
};

// set a lookup count
gaCookie.zipLookupCount = 0;

//function to lookup city, state and country automatically based on zip code.
gaCookie.processZip = function(){
  // activate on zip code field blur
  $("input[name='zip']").on("blur",function(){
      gaCookie.doZipLookup();
  });
  // check data is filled out on form submit
  $('form').on('submit', function(e) {
    // if country field is blank
    if( $('input[name="country"]').val()=='' ) {
      // do zip lookup
      gaCookie.doZipLookup();
      // cancel form submit
      e.preventDefault();
    }
  });
};

//function to lookup city, state and country automatically based on zip code.
//populates hidden fields on blur, will destroy any previously set value.
gaCookie.doZipLookup = function() {
  try{
    if($("input[name='zip']").val().length>0){

      // call geoNames - YOU MUST CREATE YOUR OWN USERNAME IN PLACE OF THE CURRENT VALUE OF "DEMO"
      $.getJSON("//ws.geonames.net/postalCodeSearchJSON?postalcode="+$("input[name='zip']").val()+"&maxRows=10&username=highfive", function(data) {

        //console.log(data);

        // if data not returned
        if(typeof data == 'undefined' || typeof data.status != 'undefined') {

          console.log('zip code lookup returned empty or invalid data...');

          // only check 3 times
          if(gaCookie.zipLookupCount<3) {

            console.log('(' + (gaCookie.zipLookupCount+1) + ')reattempting zip code lookup...');

            // retry search after 250ms
            window.setTimeout(gaCookie.doZipLookup, 250);

            // increment lookup count (prevents users from getting caught in endless loop)
            gaCookie.zipLookupCount++;

          }

        // if data returned
        } else {

          // remove any existing error notice
          $('.zipError').remove();
          $("input[name='zip']").removeClass('invalid');

          //console.log(data.postalCodes.length);

          // if no matches found
          if(data.postalCodes.length == 0) {

            // flag error
            $("input[name='zip']").addClass('invalid');
            // notify user
            $("input[name='zip']").after("<span class='zipError' style='font-size:.85em;display:inline-block;padding-top:5px;'>Are you sure that's a zip code?</span>");

          // if only 1 result
          } else if(data.postalCodes.length == 1) {

            // update form fields            
            $("input[name='country']").val(data.postalCodes[0]['countryCode']);
            $("input[name='city']").val(data.postalCodes[0]['placeName']);
            $("input[name='state']").val(data.postalCodes[0]['adminCode1']);
          
          // if more than 1 result
          } else {

            async.each(data.postalCodes, function(postalCode, callback) {

              if(postalCode['countryCode']=='US') {
                callback(postalCode);
              } else callback();

            }, function(isUS) {
              // if US value was found
              if(isUS) {
                //console.log('us postal code value found');

                // update form fields
                $("input[name='country']").val(isUS['countryCode']);
                $("input[name='city']").val(isUS['placeName']);
                $("input[name='state']").val(isUS['adminCode1']);
              // if no US value was found
              } else {
                //console.log('no us postal code value was found');

                // if no modal already exists
                if(!$('#zipModal').length) {
                  // create bootstrap modal
                  $('body').append(
                    $('<div>').attr({'class': 'modal fade', 'id': 'zipModal', 'tabindex': '-1', 'role': 'dialog', 'aria-labelledby': 'zipModal', 'aria-hidden': 'true'}).append(
                      $('<div>').attr({'class': 'modal-dialog'}).append(
                        $('<div>').attr({'class': 'modal-content'}).append(
                          $('<div>').attr({'class': 'modal-header'}).append(
                            $('<button>').attr({'type': 'button','class':'close','data-dismiss':'modal','aria-label':'close'}).append(
                                $('<span>').attr({'aria-hidden':'true'})
                              ).html('&times;')
                          ).append(
                            $('<h4>').attr({'class': 'modal-title'}).text('Please choose a location')
                          )
                        ).append(
                          $('<div>').attr({'class': 'modal-body'}).append( $('<div>').attr({'class': 'list-group'}) )
                        ).append(
                          $('<div>').attr({'class':'modal-footer'}).append(
                            $('<button>').attr({'type':'button','class':'btn btn-default','data-dismiss':'modal'}).text('Close')
                          )
                        )
                      )
                    )
                  );
                // if modal already exists
                } else {
                  // remove any existing items from the modal list
                  $('#zipModal .modal-body .list-group').html('');
                }

                // loop data
                $.each(data.postalCodes, function(i,pc) {
                  // add in choices
                  $('#zipModal .modal-body .list-group').append(
                    $('<a>')
                      .attr({'href':'javascript:;','class':'list-group-item','data-zip': JSON.stringify(pc) })
                      .text( pc['placeName'] + ', ' + (pc['adminCode1'] || '--') + ' ' + pc['countryCode'] + ' (' + pc['postalCode'] + ')'  )
                      .on('click', function() {
                        // get place data
                        var placeData = $.parseJSON($(this).attr('data-zip'));
                        // update form fields
                        $("input[name='country']").val(placeData['countryCode']);
                        $("input[name='city']").val(placeData['placeName']);
                        $("input[name='state']").val( (placeData['adminCode1'] || '--') );
                        // close modal
                        $('#zipModal').modal('hide');
                      })
                  );
                  // show the modal
                  $('#zipModal').modal('show');
                });
              }
            });

          }

        }


      }).fail(function(){

        console.log('jqxhr call failed...');

        // try again - but only check 3 times
        if(gaCookie.zipLookupCount<3) {

          console.log('(' + (gaCookie.zipLookupCount+1) + ')retrying jqxhr call...');

          // retry search after 250ms
          window.setTimeout(gaCookie.doZipLookup, 250);

          // increment lookup count (prevents users from getting caught in endless loop)
          gaCookie.zipLookupCount++;

        }

      });
    }

  } catch(e) {
    // handle error
    console.log('error in doZipLookup: ' + e);
  }
};

//override for local GA cookie values
gaCookie.updateUTMZ = function(csr,cmd,ccn,ctr,cct){
var newUTMZ = gaCookie.getCookie("__utmz");
var nodes = newUTMZ.split("|");
  /* source */
  if(csr){  newUTMZ = newUTMZ.replace(/utmcsr=(.*?)\|/,"utmcsr=" + csr + "|" );}  
/* medium */
  if(cmd){  newUTMZ = newUTMZ.replace(/(utmcmd=[\w\(\)\-_\+]*)\|?/,"utmcmd=" + cmd + (nodes.length <4 ? "" : "|") );}
/* campaign */
  if(ccn){  newUTMZ = newUTMZ.replace(/utmccn=(.*?)\|/,"utmccn=" + ccn + "|" );}
/* term */
  if(ctr){  newUTMZ = newUTMZ.replace(/utmctr=(.*?)/,"utmctr=" + ctr  );}
/* content */
  if(cct){  newUTMZ = newUTMZ.replace(/utmcct=(.*?)/,"utmcct=" + cct  );}
  gaCookie.set('__utmz', newUTMZ, this.domainName, '/', 4382);
};
