<%@ page import="com.cogix.vwf.Belize" %><%@ page import="com.cogix.vwf.Dirs" %><%
    /*
    New protocol with security:
    Use Post only for survey submission to viewsflash or vfauth
    Encrypt the username before encoding, decrypt it here
    For all else ( vfadmin redirects, viewsflash api ) use Get
    and encrypt the query string, so what is received has no parameters:
    lry.jsp?e4b2c2a0 ...
    Put this code into lry2.jsp
    (defer encruypting the userid for a little while)


http://localhost:8080/ViewsFlash/lry.jsp?lry-op=vfapi&lry-userid=qlvyoltth&cmd=getspotnames&security=user&userid=joebloggs&lry-bz=8020059121003785207

    Test:

    localhost:8888/VF8/lry.jsp?lry-op=vfapi&lry-userid=!&cmd=getpollnames&status=open&title=1&sort=alpha&smp=1&isscheduled=1&spotname=Examples
    localhost:8888/VF8/lry.jsp?lry-op=viewsflash&lry-userid=tom&cmd=dfhome&status=open&title=1&sort=alpha&smp=1&isscheduled=1&spotname=Examples
Best would be: lry.jsp?xxxxvasdfasdfs (encrypt the entire query string, including a time=in seconds, and query is good for only += 10 seconds!
    Used by liferay clients
    // For APi commands:
    lry.jsp?lry-op=vfapi&lry-userid=useridencypted&cmd=getspotnames&....
    // For showing the admin UI:
    lry.jsp?lry-op=vfadmin&lry-userid=same&cmd=dfpublish&pollid=Examples!Service...
    // For showing a survey; userid is optional
    lry.jsp?lry-op=viewsflash&lry-userid=same&cmd=dfpublish&pollid=Examples!Service...
    */

System.out.println (request.getQueryString());

    String lrybz = request.getParameter ( "lry-bz" );
    String phrase = Dirs.getInitParameter ("com.cogix.surveyportlet.adage");
    Belize.Get( phrase );
    if ( ! Belize.key () .equals (lrybz ))
        return;
    String lryop = request.getParameter ( "lry-op" );
    String lryuserid = request.getParameter ( "lry-userid" );
    if ( lryop == null )
        return;
    if ( lryop.length () < 5 )
        return;
    String appendquery = null;
    if ( lryuserid != null && lryuserid.length () > 0 ) {
        String userid = Belize.fluff(lryuserid);
        String VFID = "com.cogix.vwf.UserIdSessionAttribute ";
        request.getSession ( true ).setAttribute ( VFID, userid );
        appendquery = "&userid="+userid;
    }

    if ( "vfapi".equals ( lryop ) ) {
        String cmd = request.getParameter ( "cmd" );

        if ( !( "getspotnames".equals ( cmd ) || "getpollnames".equals ( cmd ) || "seeresults".equals ( cmd ) || "getmysurveys".equals ( cmd ) ) )
            return;
        if ( appendquery != null ) {
            request.setAttribute ("com.cogix.vwf.appendquery",appendquery);
        }
        ServletContext ctx = pageContext.getServletContext ();
        String servlet = "/servlet/viewsflash";
        RequestDispatcher rd = ctx.getRequestDispatcher ( servlet );
        if ( rd == null ) {
            out.print ( "could not find request dispatcher " );
            return;
        }
        request.setAttribute ( "com.cogix.vwf.api", System.currentTimeMillis () );    //	set this attribute to the current time to establish security credentials
        rd.include ( request, response );
        return;
    }

    if ( "vfadmin".equals ( lryop ) ) {
        // Redirect to /appname/servlet/vfadmin with all params in query string
        StringBuffer uri = request.getRequestURL (); // complete url, eg https://...:8080/ViewsFlash/lry.jsp?params..
        String ur = uri.toString ().replace ( "lry.jsp", "servlet/vfadmin" ) + "?" + request.getQueryString ();
        response.sendRedirect ( ur );
        return;
    }

    if ( "viewsflash".equals ( lryop ) || "vfauth".equals ( lryop ) ) {
        ServletContext ctx = pageContext.getServletContext ();
        String servlet = "/servlet/viewsflash";
        RequestDispatcher rd = ctx.getRequestDispatcher ( servlet );
        if ( rd == null ) {
            out.print ( "could not find request dispatcher " );
            return;
        }
        String UserIdSessionAttribute = "com.cogix.vwf.UserIdSessionAttribute ";   //  From SurveyPortlet.java
        String userid = (String) request.getSession ( true ).getAttribute ( UserIdSessionAttribute );
        String VIEWSFLASHREQUESTNOTIFIERID = "com.cogix.vwf.RequestNotifierId";
        if ( userid != null )
            request.setAttribute ( VIEWSFLASHREQUESTNOTIFIERID, userid );
        rd.include ( request, response );
        return;
    }


%>