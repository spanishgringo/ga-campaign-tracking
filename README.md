# Google Analytics Campaign Tracking Script

Use this plugin to pull campaign and other data out of the Google Analytics cookie for use in your web app or passing into your MAP and CRM for full closed-loop source and ROI reporting.

Written and maintained by [Michael Freeman](https://twitter.com/spanishgringo) & [Ben Word](https://twitter.com/retlehs).

* [http://www.shoretel.com/](http://www.shoretel.com/)
* [http://www.shoretelsky.com/](http://www.shoretelsky.com/)

# Usage

* Place the `ga-cookie.js` script above your standard `ga.js` tracking code
* Set the defaults:
  * `gaCookie.domainName`: if you do not use standard subdomain level GA tracking, set this to the same domain that you use for your GA cookie
  * `gaCookie.strPath`: if you do not use standard subdomain level GA tracking, set this to the same cookie path that you use for your GA cookie
  * `gaCookie.prefix`: To differentiate values that come from your website instead of other channels, this object will attach a prefix in front of the Medium value. Default is "WEB-" but you can set it to anything, including empty ""
* Call `gaCookie.getVisitData();` once your form is loaded (in the case of an AJAX loaded form, make sure it is in the DOM before calling. I suggest binding to an using the "one method in jQuery when the form receives focus or shows")

# Default values that are populated in webforms
If you do not modify the script you will need to ensure that your hidden fields on your forms include the proper fields with the correct name attributes.
  * `gaLandingPage`: The Landing Page of the current session
  * `gaCamMed`: Google Analytics Campaign Medium
  * `gaSource`: Google Analytics Campaign Source
  * `gaCamName`: Google Analytics Campaign Name (for Campaign Name to appear from Paid Search traffic you must manually tag your ad URLs, even for AdWords)
  * `gaCamKW`: Google Analytics Campaign Keyword (for KW to appear from Paid Search traffic you must manually tag your ad URLs, even for AdWords)
  * `gaCamContent`: Google Analytics Campaign Content (for Content to appear from Paid Search traffic you must manually tag your ad URLs, even for AdWords)
  * `gaAdWordsID`: Google AdWords GACLID value - this is a value that can be used to later upload CRM conversion data back into AdWords.[https://support.google.com/adwords/answer/2998031] More information about uploading offline conversions into AdWords

# Other values that can be accessed from the GA cookie


## License

MIT License

## Acknowledgments

Various components originally based on the following:

* [querystring.js](http://adamv.com/dev/javascript/querystring) by Adam Vandenberg
* [ga-vki-cookies](https://code.google.com/p/ga-vki-cookies/source/browse/trunk/gaVKICookies.js?r=18)
* [Inspired originally by Cutroni](http://cutroni.com/blog/2007/10/29/integrating-google-analytics-with-a-crm/)
