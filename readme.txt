ViewsFlash 10 with Survey Portlet for Liferay 7 DXP

This zip file contains:
- this readme.txt file
- ViewsFlash.war
- ViewsFlash-1.0.7.jar


Synopsis of installation:

Create a Data Source in application server, name it "ViewsFlash",
and grant its user the right to create and alter tables.

Deploy ViewsFlash-1.0.7.jar using Liferay's
Control Panel / Apps / App manager / Upload.
This becomes the ViewsFlash app,
available for adding to a page as Survey / Survey.
The portlet uses the ViewsFlash application internally.

Check the /etc/viewsflash.properties file.
Needed parameters:
license=xxxx
apiattribute=com.cogix.vwf.api

The administrators parameter is a list of the screen names of users who are
ViewsFlash administrators

Do not deploy the ViewsFlash.war file to the Liferay 7 deploy directory,
and do not upload it with the Liferay App Manager. Instead, do as follows.

Deploy the ViewsFlash.war file to the application server
by dropping it into the appropriate directory:
/webapps in Tomcat, /deployments in WildFly.
It will be deployed as /ViewsFlash.
Review the application server log and look for ViewsFlash started messages.

Add the Survey Portlet to a page, use the Configure menu,
and open ViewsFlash using the Configure Surveys link
to complete installation with the ViewsFlash setup page.

Once that's working, add application security and make sure
the administrators= parameter includes the screen names of administrators,
such as "test" in a test deployment, like this:
appsecurity=user
administrators=test,otherscreenname1,otherscreenname2


How to upgrade from an earlier version of ViewsFlash 10
Inspect this zip file. If the version of ViewsFlash-1.0.x.jar is newer
than the previous version, deploy the new portlet in the same way,
and ViewsFlash Survey portlet will be  upgraded.
Monitor the Liferay log for any errors.

Then deploy the new ViewsFlash.war file by simply dropping it to the
app server deployment  directory. Monitor the System.out log for any errors.

Once deployed, go to the ViewsFlash app Setup page and click on Diagnose.
If Diagnose shows that Styles need upgrading, click on that link to do so.

