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

## License

MIT License

## Acknowledgments

Various components originally based on the following:

* [querystring.js](http://adamv.com/dev/javascript/querystring) by Adam Vandenberg
* [ga-vki-cookies](https://code.google.com/p/ga-vki-cookies/source/browse/trunk/gaVKICookies.js?r=18)
* [Inspired originally by Cutroni](http://cutroni.com/blog/2007/10/29/integrating-google-analytics-with-a-crm/)
